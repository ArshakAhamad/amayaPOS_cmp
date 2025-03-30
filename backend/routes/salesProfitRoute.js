import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    // Get summary data
    const [summary] = await pool.query(`
      SELECT 
        COALESCE(SUM(pi.price * pi.quantity), 0) as productSales,
        COALESCE(SUM(CASE WHEN p.voucher_id IS NOT NULL THEN p.total_amount ELSE 0 END), 0) as voucherSales,
        COALESCE(SUM(pr.last_cost * pi.quantity), 0) as cost,
        COALESCE(SUM(pi.price * pi.quantity) - SUM(pr.last_cost * pi.quantity), 0) as profit
      FROM payment_items pi
      JOIN payments p ON pi.payment_id = p.id
      JOIN products pr ON pi.product_id = pr.id
      WHERE p.status = 'Active'
        AND DATE(p.created_at) BETWEEN ? AND ?
    `, [startDate, endDate]);

    // Calculate profit percentage
    const profitPercentage = summary[0].productSales > 0 
      ? (summary[0].profit / summary[0].productSales) * 100 
      : 0;

    // Get receipt-wise sales with fixed CASE statement
    const [receipts] = await pool.query(`
      SELECT 
        p.id,
        DATE_FORMAT(p.created_at, '%Y-%m-%d %H:%i') as date,
        p.payment_method as type,
        p.receipt_number as reference,
        COALESCE(SUM(pi.price * pi.quantity), 0) as sale,
        COALESCE(SUM(pi.price * pi.quantity * (pr.discount/100)), 0) as discount,
        COALESCE(SUM(pr.last_cost * pi.quantity), 0) as cost,
        COALESCE(SUM(pi.price * pi.quantity) - SUM(pr.last_cost * pi.quantity), 0) as profit,
        CASE 
          WHEN COALESCE(SUM(pi.price * pi.quantity), 0) > 0 
          THEN ROUND(
            ((COALESCE(SUM(pi.price * pi.quantity), 0) - COALESCE(SUM(pr.last_cost * pi.quantity), 0)) / 
            COALESCE(SUM(pi.price * pi.quantity), 1)) * 100, 
            2
          )
          ELSE 0 
        END as profit_percentage
      FROM payment_items pi
      JOIN payments p ON pi.payment_id = p.id
      JOIN products pr ON pi.product_id = pr.id
      WHERE p.status = 'Active'
        AND DATE(p.created_at) BETWEEN ? AND ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT 1000
    `, [startDate, endDate]);

    res.json({
      success: true,
      data: {
        summary: {
          productSales: Number(summary[0].productSales),
          voucherSales: Number(summary[0].voucherSales),
          cost: Number(summary[0].cost),
          profit: Number(summary[0].profit),
          profitPercentage: Number(profitPercentage.toFixed(2))
        },
        receipts: receipts.map(receipt => ({
          ...receipt,
          sale: Number(receipt.sale),
          discount: Number(receipt.discount),
          cost: Number(receipt.cost),
          profit: Number(receipt.profit),
          profit_percentage: Number(receipt.profit_percentage)
        }))
      }
    });

  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({
      success: false,
      message: 'Database query failed',
      error: err.message,
      sql: err.sql // This will show the exact failing query
    });
  }
});

export default router;