import express from 'express';
import pool from '../config/db.js'; // Your database connection

const router = express.Router();

// GET Cashier Summary Data (with optional date filter)
router.get('/api/cashier_summary', async (req, res) => {
  try {
    const { date } = req.query;

    const query = `
      SELECT 
        u.username AS name,
        COALESCE(ss.sale, 0) AS sale,
        COALESCE(ss.cash, 0) AS cash,
        COALESCE(ss.card, 0) AS card,
        COALESCE(ss.voucher, 0) AS voucher
      FROM system_user u
      LEFT JOIN cashier_summary ss ON u.id = ss.cashier_id
      WHERE u.role = 'Cashier'
      ${date ? `AND ss.date = ?` : ''}
      GROUP BY u.username
    `;

    const params = date ? [date] : [];
    const [cashierData] = await pool.query(query, params);

    res.json({
      success: true,
      data: cashierData,
    });
  } catch (error) {
    console.error('Error fetching cashier data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cashier data',
    });
  }
});

export default router;
