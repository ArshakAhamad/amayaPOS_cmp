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

export default router;