import express from 'express';
import pool from '../config/db.js';
import authenticateToken from '../middlewares/authenticateToken.js'; 

const router = express.Router();

// GET Cashier Summary Data
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const { date, cashier_id } = req.query;

    // Validate date format if provided
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // Base query
    let query = `
      SELECT 
        u.id AS cashier_id,
        u.username AS name,
        COALESCE(SUM(ss.sale), 0) AS sale,
        COALESCE(SUM(ss.cash), 0) AS cash,
        COALESCE(SUM(ss.card), 0) AS card,
        COALESCE(SUM(ss.voucher), 0) AS voucher,
        COUNT(DISTINCT ss.date) AS days_worked
      FROM system_user u
      LEFT JOIN cashier_summary ss ON u.id = ss.cashier_id
      WHERE u.role = 'Cashier'
    `;

    const params = [];
    
    // Add filters if provided
    if (date) {
      query += ` AND DATE(ss.date) = ?`;
      params.push(date);
    }
    
    if (cashier_id) {
      query += ` AND u.id = ?`;
      params.push(cashier_id);
    }

    query += ` GROUP BY u.id, u.username ORDER BY u.username`;

    const [cashierData] = await pool.query(query, params);

    // Safely format numbers to 2 decimal places
    const formattedData = cashierData.map(item => {
      // Convert all numeric fields to proper numbers first
      const safeSale = Number(item.sale) || 0;
      const safeCash = Number(item.cash) || 0;
      const safeCard = Number(item.card) || 0;
      const safeVoucher = Number(item.voucher) || 0;

      return {
        ...item,
        sale: Number(safeSale.toFixed(2)),
        cash: Number(safeCash.toFixed(2)),
        card: Number(safeCard.toFixed(2)),
        voucher: Number(safeVoucher.toFixed(2))
      };
    });

    res.json({
      success: true,
      data: formattedData,
      message: formattedData.length > 0 
        ? 'Data retrieved successfully' 
        : 'No data available for the selected criteria'
    });

  } catch (error) {
    console.error('Detailed database error:', {
      message: error.message,
      stack: error.stack,
      query: query,
      params: params
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to process cashier data',
      error: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Internal server error'
    });
  }
});


// GET All Cashiers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [cashiers] = await pool.query(
      "SELECT id, username, email, created_at FROM system_user WHERE role = 'Cashier'"
    );
    
    res.json({
      success: true,
      data: cashiers
    });
  } catch (error) {
    console.error('Error fetching cashiers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cashiers'
    });
  }
});

// GET Cashier Details by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [cashier] = await pool.query(
      `SELECT id, username, email, created_at 
       FROM system_user 
       WHERE id = ? AND role = 'Cashier'`,
      [id]
    );
    
    if (cashier.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cashier not found'
      });
    }
    
    res.json({
      success: true,
      data: cashier[0]
    });
  } catch (error) {
    console.error('Error fetching cashier details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cashier details'
    });
  }
});

// POST Create Cashier Summary Record
router.post('/summary', authenticateToken, async (req, res) => {
  try {
    const { cashier_id, date, sale, cash, card, voucher } = req.body;

    // Validate required fields
    if (!cashier_id || !date || sale === undefined || cash === undefined || 
        card === undefined || voucher === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if cashier exists
    const [cashier] = await pool.query(
      'SELECT id FROM system_user WHERE id = ? AND role = "Cashier"',
      [cashier_id]
    );
    
    if (cashier.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cashier not found'
      });
    }

    // Insert or update summary record
    const [result] = await pool.query(
      `INSERT INTO cashier_summary 
       (cashier_id, date, sale, cash, card, voucher) 
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       sale = VALUES(sale),
       cash = VALUES(cash),
       card = VALUES(card),
       voucher = VALUES(voucher)`,
      [cashier_id, date, sale, cash, card, voucher]
    );

    res.status(201).json({
      success: true,
      message: 'Cashier summary record saved successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('Error saving cashier summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save cashier summary',
      error: error.message
    });
  }
});

// GET Cashier Daily Performance (with optional date range)
router.get('/performance', authenticateToken, async (req, res) => {
  try {
    const { cashier_id, start_date, end_date } = req.query;

    if (!cashier_id) {
      return res.status(400).json({
        success: false,
        message: 'cashier_id is required'
      });
    }

    let query = `
      SELECT 
        DATE(date) AS date,
        SUM(sale) AS total_sales,
        SUM(cash) AS total_cash,
        SUM(card) AS total_card,
        SUM(voucher) AS total_voucher
      FROM cashier_summary
      WHERE cashier_id = ?
    `;

    const params = [cashier_id];

    if (start_date && end_date) {
      query += ` AND DATE(date) BETWEEN ? AND ?`;
      params.push(start_date, end_date);
    } else if (start_date) {
      query += ` AND DATE(date) >= ?`;
      params.push(start_date);
    } else if (end_date) {
      query += ` AND DATE(date) <= ?`;
      params.push(end_date);
    }

    query += ` GROUP BY DATE(date) ORDER BY DATE(date) DESC`;

    const [performanceData] = await pool.query(query, params);

    // Format numbers
    const formattedData = performanceData.map(item => ({
      ...item,
      total_sales: Number(item.total_sales.toFixed(2)),
      total_cash: Number(item.total_cash.toFixed(2)),
      total_card: Number(item.total_card.toFixed(2)),
      total_voucher: Number(item.total_voucher.toFixed(2))
    }));

    res.json({
      success: true,
      data: formattedData
    });

  } catch (error) {
    console.error('Error fetching cashier performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cashier performance data'
    });
  }
});

// GET Cashier's Recent Transactions
router.get('/:id/transactions', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    // Validate cashier exists
    const [cashier] = await pool.query(
      'SELECT id FROM system_user WHERE id = ? AND role = "Cashier"',
      [id]
    );
    
    if (cashier.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cashier not found'
      });
    }

    const [transactions] = await pool.query(
      `SELECT 
        p.id,
        p.receipt_number,
        p.payment_method,
        p.total_amount,
        p.created_at,
        COUNT(pi.id) AS items_count
      FROM payments p
      JOIN payment_items pi ON p.id = pi.payment_id
      WHERE p.created_by = (SELECT username FROM system_user WHERE id = ?)
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ?`,
      [id, parseInt(limit)]
    );

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching cashier transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cashier transactions'
    });
  }
});

export default router;