import express from 'express';
import pool from '../config/db.js'; // Import your database pool
import authenticateToken from '../middlewares/authenticateToken.js'; // Import authentication middleware

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
      'INSERT INTO vouchers (code, value, valid_days, status, active) VALUES (?, ?, ?, ?, ?)',
      [code, value, valid_days, 'Issued', 'Active'] // Default status and active values
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

// PUT /api/vouchers/:id/cancel - Cancel a voucher
router.put('/vouchers/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const [voucher] = await pool.execute('SELECT status FROM vouchers WHERE id = ?', [id]);

    if (voucher.length === 0) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    if (voucher[0].status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Voucher is already cancelled.' });
    }

    if (voucher[0].status === 'Redeemed') {
      return res.status(400).json({ success: false, message: 'Redeemed vouchers cannot be cancelled.' });
    }

    const [result] = await pool.execute(
      'UPDATE vouchers SET status = ?, active = ? WHERE id = ?',
      ['Cancelled', 'Inactive', id]
    );

    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Voucher cancelled successfully.' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to cancel voucher.' });
    }
  } catch (err) {
    console.error('Error cancelling voucher:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PUT /api/vouchers/:id/redeem - Redeem a voucher
router.put('/:id/redeem', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Update the voucher's status and redeemed_date fields
    const [result] = await pool.execute(
      'UPDATE vouchers SET status = ?, redeemed_date = NOW() WHERE id = ?',
      ['Redeemed', id]
    );

    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Voucher redeemed successfully.' });
    } else {
      res.status(404).json({ success: false, message: 'Voucher not found.' });
    }
  } catch (err) {
    console.error('Error redeeming voucher:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

export default router;