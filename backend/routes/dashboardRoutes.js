import express from "express";
import pool from "../config/db.js";
import authenticateToken from "../middlewares/authenticateToken.js";

const router = express.Router();

// Dashboard summary data
router.get("/summary", authenticateToken, async (req, res) => {
  try {
    // Get sales data
    const [salesResult] = await pool.query(`
      SELECT 
        SUM(CASE WHEN payment_method = 'Cash' THEN total_amount ELSE 0 END) AS cash_sales,
        SUM(CASE WHEN payment_method = 'Voucher' THEN total_amount ELSE 0 END) AS voucher_sales,
        COUNT(DISTINCT id) AS total_receipts
      FROM payments
      WHERE status = 'Active'
    `);

    // Get product count
    const [productsResult] = await pool.query(`
      SELECT COUNT(*) AS total_products 
      FROM products 
      WHERE status = 'Active'
    `);

    // Get customer count
    const [customersResult] = await pool.query(`
      SELECT COUNT(*) AS total_customers 
      FROM customers 
      WHERE customer_active = 1
    `);

    // Get monthly sales
    const [monthlySales] = await pool.query(`
      SELECT 
        MONTH(created_at) AS month,
        SUM(total_amount) AS amount
      FROM payments
      WHERE YEAR(created_at) = YEAR(CURRENT_DATE)
      GROUP BY MONTH(created_at)
      ORDER BY month
    `);

    // Format monthly sales data
    const monthlySalesData = Array(12).fill(0);
    monthlySales.forEach((sale) => {
      monthlySalesData[sale.month - 1] = Number(sale.amount || 0);
    });

    res.json({
      success: true,
      data: {
        productSale: Number(salesResult[0].cash_sales || 0),
        voucherSale: Number(salesResult[0].voucher_sales || 0),
        totalPurchaseDue: 0, // You'll need to implement this
        totalReceipts: salesResult[0].total_receipts,
        totalProducts: productsResult[0].total_products,
        totalCustomers: customersResult[0].total_customers,
        monthlySales: monthlySalesData,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
});

// Cashier performance data
router.get("/cashiers", authenticateToken, async (req, res) => {
  try {
    console.log("Fetching cashier data...");

    const [cashiers] = await pool.query(`
      SELECT 
        u.id,
        u.username AS name,
        COALESCE(SUM(p.total_amount), 0) AS sale,
        COALESCE(SUM(CASE WHEN p.payment_method = 'Cash' THEN p.total_amount ELSE 0 END), 0) AS cash,
        COALESCE(SUM(CASE WHEN p.payment_method = 'Voucher' THEN p.total_amount ELSE 0 END), 0) AS voucher
      FROM system_user u
      LEFT JOIN payments p ON u.username = p.created_by
      WHERE u.role = 'Cashier'
      GROUP BY u.id, u.username
    `);

    console.log("Raw cashier data:", cashiers);

    // Safe number conversion and formatting
    const formatCurrency = (value) => {
      const num = typeof value === "string" ? parseFloat(value) : Number(value);
      return isNaN(num) ? 0 : Number(num.toFixed(2));
    };

    const formattedCashiers = cashiers.map((c) => ({
      id: c.id,
      name: c.name,
      sale: formatCurrency(c.sale),
      cash: formatCurrency(c.cash),
      voucher: formatCurrency(c.voucher),
    }));

    console.log("Formatted cashier data:", formattedCashiers);

    res.json({
      success: true,
      data: formattedCashiers,
    });
  } catch (error) {
    console.error("Detailed cashiers error:", {
      message: error.message,
      stack: error.stack,
      sql: error.sql,
      errno: error.errno,
      code: error.code,
    });

    res.status(500).json({
      success: false,
      message: "Failed to load cashier data",
      error: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
});

export default router;
