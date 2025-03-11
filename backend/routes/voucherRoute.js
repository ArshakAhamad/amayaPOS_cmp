import express from 'express';
import pool from '../config/db.js'; // Import your database pool

const router = express.Router();

// POST /api/vouchers - Create a new voucher
router.post('/vouchers', async (req, res) => {
  const { code, value, valid_days } = req.body;

  // Validate inputs
  if (!code || !value || !valid_days) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {

    // Insert the voucher details into the database
    const [result] = await pool.execute(
      'INSERT INTO vouchers (code, value, valid_days) VALUES (?, ?, ?)',
      [code, value, valid_days]
    );

    if (result.affectedRows > 0) {
      res.status(201).json({ success: true, message: 'Voucher created successfully.' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to create voucher.' });
    }
  } catch (err) {
    console.error('Error creating voucher:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/vouchers - Fetch all vouchers
router.get('/vouchers', async (req, res) => {
    try {
      // Query to fetch all vouchers from the database
      const [vouchers] = await pool.execute('SELECT * FROM vouchers');
  
      if (vouchers.length === 0) {
        return res.status(404).json({ success: false, message: 'No vouchers found.' });
      }
  
      res.status(200).json({
        success: true,
        vouchers: vouchers,
      });
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  
export default router;
