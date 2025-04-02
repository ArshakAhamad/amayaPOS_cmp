import express from 'express';
import pool from '../config/db.js'; // Import your MySQL connection pool

const router = express.Router();

// GET /api/suppliers - Fetch all suppliers with pagination and search
router.get('/suppliers', async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `SELECT * FROM suppliers`;
    let params = [];

    // Add search filter if search query is provided
    if (search) {
      query += ` WHERE supplier_name LIKE ?`;
      params.push(`%${search}%`);
    }

    // Add pagination
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Fetch suppliers from the database
    const [suppliers] = await pool.execute(query, params);

    if (suppliers.length === 0) {
      return res.status(404).json({ success: false, message: 'No suppliers found.' });
    }

    // Parse numeric fields as numbers
    const parsedSuppliers = suppliers.map((supplier) => ({
      ...supplier,
      outstanding: parseFloat(supplier.outstanding), // Parse outstanding as a number
    }));

    // Return the suppliers data
    res.status(200).json({
      success: true,
      suppliers: parsedSuppliers,
    });
  } catch (err) {
    console.error('Error fetching suppliers:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/suppliers - Create a new supplier
router.post('/suppliers', async (req, res) => {
  const { supplierName, creditPeriod, description } = req.body;

  // Validate required fields
  if (!supplierName || !creditPeriod) {
    return res.status(400).json({ success: false, message: 'Supplier Name and Credit Period are required.' });
  }

  try {
    // Insert the supplier details into the database
    const [result] = await pool.execute(
      `INSERT INTO suppliers (supplier_name, outstanding, credit_period, description, created_by, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [supplierName, 0.0, creditPeriod, description || '', 'Admin', 'Active'] // Default values for outstanding, created_by, and status
    );

    if (result.affectedRows > 0) {
      res.status(201).json({ success: true, message: 'Supplier created successfully.' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to create supplier.' });
    }
  } catch (err) {
    console.error('Error creating supplier:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// POST /api/suppliers/:id/toggle-status - Toggle the status of a supplier
router.post('/suppliers/:id/toggle-status', async (req, res) => {
  const { id } = req.params;

  try {
    // Get the current status of the supplier
    const [supplier] = await pool.execute(`SELECT status FROM suppliers WHERE id = ?`, [id]);

    if (supplier.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found.' });
    }

    // Toggle status: if "Active" => "Inactive", if "Inactive" => "Active"
    const newStatus = supplier[0].status === 'Active' ? 'Inactive' : 'Active';

    // Update the status of the supplier
    await pool.execute(`UPDATE suppliers SET status = ? WHERE id = ?`, [newStatus, id]);

    res.status(200).json({ success: true, message: 'Supplier status updated successfully.' });
  } catch (err) {
    console.error('Error toggling supplier status:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/suppliers/bills - Get supplier bills
router.get('/suppliers/bills', async (req, res) => {
  try {
    const [bills] = await pool.execute(`
      SELECT 
        s.id as supplier_id,
        s.supplier_name,
        sb.bill_no,
        sb.outstanding_amount,
        sb.settlement_date,
        sb.settled_amount,
        u.username as approved_by
      FROM supplier_bill_settlements sb
      JOIN suppliers s ON sb.supplier_id = s.id
      JOIN system_user u ON sb.approved_by = u.id
      ORDER BY sb.settlement_date DESC
    `);

    res.status(200).json({ 
      success: true, 
      bills 
    });
  } catch (err) {
    console.error('Error fetching supplier bills:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
});

// POST /api/suppliers/settle - Settle a supplier bill
router.post('/suppliers/settle', async (req, res) => {
  const { billNo, supplierId, outstandingAmount, approvalPassword } = req.body;
  
  // Input validation
  if (!billNo || !supplierId || !outstandingAmount) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields' 
    });
  }

  // Check password (simple validation - in production use proper auth)
  if (approvalPassword !== "admin123") {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid approval password' 
    });
  }

  try {
    // Start transaction
    await pool.query('START TRANSACTION');

    // 1. Record the settlement
    const [result] = await pool.execute(
      `INSERT INTO supplier_bill_settlements 
       (supplier_id, bill_no, outstanding_amount, settled_amount, settlement_date, approved_by, approval_method)
       VALUES (?, ?, ?, ?, CURDATE(), 1, 'password')`,
      [supplierId, billNo, outstandingAmount, outstandingAmount]
    );

    // 2. Update supplier's outstanding balance
    await pool.execute(
      `UPDATE suppliers 
       SET outstanding = outstanding - ?
       WHERE id = ?`,
      [outstandingAmount, supplierId]
    );

    // Commit transaction
    await pool.query('COMMIT');

    res.status(201).json({ 
      success: true, 
      message: 'Bill settled successfully',
      settlementId: result.insertId
    });

  } catch (err) {
    // Rollback on error
    await pool.query('ROLLBACK');
    console.error('Error settling supplier bill:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
});

export default router;