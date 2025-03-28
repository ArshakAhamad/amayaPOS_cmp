import express from 'express';
import pool from '../config/db.js';
import { format } from 'date-fns';

const router = express.Router();

// Middleware to ensure JSON responses
router.use(express.json());

// Helper function to format dates
const formatDate = (date) => format(new Date(date), 'yyyy-MM-dd');

// GET Sales Profit Report
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate inputs
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Both startDate and endDate are required'
      });
    }

    // Convert dates to proper format
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    console.log(`Fetching sales from ${formattedStartDate} to ${formattedEndDate}`);

    // 1. Get Summary Data
    const [summaryResult] = await pool.query(`
      SELECT 
        COALESCE(SUM(pi.price * pi.quantity), 0) AS productSales,
        COALESCE(SUM(pi.discount), 0) AS voucherSales,
        COALESCE(SUM(pi.quantity * COALESCE(p.last_cost, p.price * 0.6)), 0) AS cost,
        COALESCE(SUM(pi.price * pi.quantity - pi.quantity * COALESCE(p.last_cost, p.price * 0.6))), 0) AS profit,
        CASE 
          WHEN SUM(pi.price * pi.quantity) > 0 
          THEN ROUND(
            (SUM(pi.price * pi.quantity - pi.quantity * COALESCE(p.last_cost, p.price * 0.6))) / 
            SUM(pi.price * pi.quantity) * 100, 
            2
          )
          ELSE 0 
        END AS profitPercentage
      FROM payments
      JOIN payment_items pi ON payments.id = pi.payment_id
      JOIN products p ON pi.product_id = p.id
      WHERE payments.status = 'Active'
      AND DATE(payments.created_at) BETWEEN ? AND ?
    `, [formattedStartDate, formattedEndDate]);

    // 2. Get Detailed Sales Data
    const [salesData] = await pool.query(`
      SELECT 
        payments.id,
        DATE_FORMAT(payments.created_at, '%Y-%m-%d') AS date,
        'Sale' AS type,
        payments.receipt_number AS reference,
        COALESCE(SUM(pi.price * pi.quantity), 0) AS sale,
        COALESCE(SUM(pi.discount), 0) AS discount,
        COALESCE(SUM(pi.quantity * COALESCE(p.last_cost, p.price * 0.6))), 0) AS cost,
        COALESCE(SUM(pi.price * pi.quantity - pi.quantity * COALESCE(p.last_cost, p.price * 0.6))), 0) AS profit,
        CASE 
          WHEN SUM(pi.price * pi.quantity) > 0 
          THEN ROUND(
            (SUM(pi.price * pi.quantity - pi.quantity * COALESCE(p.last_cost, p.price * 0.6))) / 
            SUM(pi.price * pi.quantity) * 100, 
            2
          )
          ELSE 0 
        END AS profitPercentage
      FROM payments
      JOIN payment_items pi ON payments.id = pi.payment_id
      JOIN products p ON pi.product_id = p.id
      WHERE payments.status = 'Active'
      AND DATE(payments.created_at) BETWEEN ? AND ?
      GROUP BY payments.id
      ORDER BY payments.created_at DESC
    `, [formattedStartDate, formattedEndDate]);

    // Prepare response
    const response = {
      success: true,
      summary: {
        productSales: parseFloat(summaryResult[0]?.productSales) || 0,
        voucherSales: parseFloat(summaryResult[0]?.voucherSales) || 0,
        cost: parseFloat(summaryResult[0]?.cost) || 0,
        profit: parseFloat(summaryResult[0]?.profit) || 0,
        profitPercentage: parseFloat(summaryResult[0]?.profitPercentage) || 0
      },
      sales: salesData.map(item => ({
        id: item.id || 0,
        date: item.date || '',
        type: item.type || 'Sale',
        reference: item.reference?.toString() || '',
        sale: parseFloat(item.sale) || 0,
        discount: parseFloat(item.discount) || 0,
        cost: parseFloat(item.cost) || 0,
        profit: parseFloat(item.profit) || 0,
        profitPercentage: parseFloat(item.profitPercentage) || 0
      }))
    };

    console.log('API Response:', JSON.stringify(response, null, 2));

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(response);

  } catch (error) {
    console.error('Server Error:', {
      message: error.message,
      stack: error.stack,
      sql: error.sql
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Debug endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working',
    data: {
      test: 123,
      items: ['a', 'b', 'c']
    }
  });
});

export default router;