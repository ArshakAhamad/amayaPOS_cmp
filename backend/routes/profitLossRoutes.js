import express from "express";
import pool from "../config/db.js";
import cors from "cors";

const router = express.Router();

router.use(cors());
router.use(express.json());

router.get("/", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Both dates are required",
      });
    }

    // Get summary data
    const [[sales]] = await pool.query(
      `
      SELECT COALESCE(SUM(pi.price * pi.quantity), 0) AS productSales
      FROM payments p
      JOIN payment_items pi ON p.id = pi.payment_id
      WHERE p.status = 'Active'
      AND DATE(p.created_at) BETWEEN ? AND ?
    `,
      [startDate, endDate],
    );

    const [[expenses]] = await pool.query(
      `
      SELECT COALESCE(SUM(amount), 0) AS totalExpenses
      FROM pos_expenses
      WHERE DATE(date) BETWEEN ? AND ?
    `,
      [startDate, endDate],
    );

    const [[costs]] = await pool.query(
      `
      SELECT COALESCE(SUM(pi.quantity * pr.last_cost), 0) AS totalCost
      FROM payment_items pi
      JOIN products pr ON pi.product_id = pr.id
      JOIN payments p ON pi.payment_id = p.id
      WHERE p.status = 'Active'
      AND DATE(p.created_at) BETWEEN ? AND ?
    `,
      [startDate, endDate],
    );

    // Get receipt data
    const [receipts] = await pool.query(
      `
      SELECT 
        p.id,
        p.receipt_number,
        DATE_FORMAT(p.created_at, '%Y-%m-%d') AS date,
        p.total_amount AS amount,
        p.created_by,
        GROUP_CONCAT(pi.product_name SEPARATOR ', ') AS items
      FROM payments p
      JOIN payment_items pi ON p.id = pi.payment_id
      WHERE p.status = 'Active'
      AND DATE(p.created_at) BETWEEN ? AND ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `,
      [startDate, endDate],
    );

    res.json({
      success: true,
      productSales: Number(sales.productSales),
      voucherSales: 0,
      costDiscounts: Number(costs.totalCost),
      expenses: Number(expenses.totalExpenses),
      profitLoss:
        Number(sales.productSales) -
        Number(costs.totalCost) -
        Number(expenses.totalExpenses),
      receipts: receipts || [],
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
