// routes/dashboard.js
import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Dashboard summary data
router.get('/summary', async (req, res) => {
  try {
    // Get product sales total
    const [salesResult] = await pool.query(`
      SELECT SUM(pi.price * pi.quantity) as productSale
      FROM payment_items pi
      JOIN payments p ON pi.payment_id = p.id
      WHERE p.status = 'Active'
    `);

    // Get voucher sales total
    const [voucherResult] = await pool.query(`
      SELECT COALESCE(SUM(v.value), 0) as voucherSale
      FROM vouchers v
      WHERE v.status = 'Redeemed'
    `);

    // Get purchase due (simplified example)
    const [purchaseDue] = await pool.query(`
      SELECT COALESCE(SUM(totalCost), 0) as totalPurchaseDue
      FROM productin
    `);

    // Get total products
    const [productsCount] = await pool.query(`
      SELECT COUNT(*) as totalProducts FROM products WHERE status = 'Active'
    `);

    // Get total customers
    const [customersCount] = await pool.query(`
      SELECT COUNT(*) as totalCustomers FROM customers WHERE customer_active = 1
    `);

    res.json({
      success: true,
      data: {
        productSale: salesResult[0].productSale || 0,
        voucherSale: voucherResult[0].voucherSale || 0,
        totalPurchaseDue: purchaseDue[0].totalPurchaseDue || 0,
        totalProducts: productsCount[0].totalProducts || 0,
        totalCustomers: customersCount[0].totalCustomers || 0
      }
    });
  } catch (err) {
    console.error('Error fetching dashboard summary:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// routes/dashboard.js
// Add this to the existing file

// Monthly sales data
router.get('/monthly-sales', async (req, res) => {
    try {
      const [results] = await pool.query(`
        SELECT 
          MONTH(p.created_at) as month,
          SUM(pi.price * pi.quantity) as totalSales
        FROM payment_items pi
        JOIN payments p ON pi.payment_id = p.id
        WHERE p.status = 'Active'
          AND YEAR(p.created_at) = YEAR(CURRENT_DATE)
        GROUP BY MONTH(p.created_at)
        ORDER BY MONTH(p.created_at)
      `);
  
      // Initialize array with 12 months (0 values)
      const monthlySales = Array(12).fill(0);
      
      // Fill in actual sales data
      results.forEach(row => {
        monthlySales[row.month - 1] = Number(row.totalSales) || 0;
      });
  
      res.json({
        success: true,
        data: monthlySales
      });
    } catch (err) {
      console.error('Error fetching monthly sales:', err);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  });

  // routes/dashboard.js
// Add this to the existing file

// Cashier performance data
router.get('/cashier-summary', async (req, res) => {
    try {
      const [results] = await pool.query(`
        SELECT 
          u.username as name,
          COALESCE(SUM(CASE WHEN p.payment_method = 'Cash' THEN p.total_amount ELSE 0 END), 0) as cash,
          COALESCE(SUM(CASE WHEN p.payment_method = 'Card' THEN p.total_amount ELSE 0 END), 0) as card,
          COALESCE(SUM(CASE WHEN p.voucher_id IS NOT NULL THEN p.total_amount ELSE 0 END), 0) as voucher,
          COALESCE(SUM(p.total_amount), 0) as sale
        FROM system_user u
        LEFT JOIN payments p ON u.username = p.created_by
          AND p.status = 'Active'
          AND p.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
        WHERE u.role = 'Cashier'
        GROUP BY u.username
      `);
  
      res.json({
        success: true,
        data: results
      });
    } catch (err) {
      console.error('Error fetching cashier summary:', err);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  });

export default router;