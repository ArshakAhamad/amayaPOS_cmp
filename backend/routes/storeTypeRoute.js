import express from 'express';
import pool from '../config/db.js'; // Import your database connection pool

const router = express.Router();

// POST /api/store-types - Create a new store type
router.post('/store-types', async (req, res) => {
  const { storeTypeName, description } = req.body;

  // Validate required fields
  if (!storeTypeName) {
    return res.status(400).json({ success: false, message: 'Store Type Name is required.' });
  }

  try {
    // Insert the store type details into the database
    const [result] = await pool.execute(
      `INSERT INTO store_types (type, description) VALUES (?, ?)`,
      [storeTypeName, description]
    );

    if (result.affectedRows > 0) {
      res.status(201).json({ success: true, message: 'Store type created successfully.' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to create store type.' });
    }
  } catch (err) {
    console.error('Error creating store type:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// GET /api/store-types - Fetch all store types
router.get('/store-types', async (req, res) => {
  try {
    const [storeTypes] = await pool.execute(`
      SELECT 
        id,
        type,
        description,
        created_at AS createdDate,
        created_by AS createdBy,
        status
      FROM store_types
    `);

    if (storeTypes.length === 0) {
      return res.status(404).json({ success: false, message: 'No store types found.' });
    }

    res.status(200).json({ success: true, storeTypes });
  } catch (err) {
    console.error('Error fetching store types:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/store-types/:id - Update a store type
router.put('/store-types/:id', async (req, res) => {
  const { id } = req.params;
  const { storeTypeName, description, status } = req.body;

  // Validate required fields
  if (!storeTypeName || !status) {
    return res.status(400).json({ success: false, message: 'Store Type Name and Status are required.' });
  }

  try {
    // Update the store type details in the database
    const [result] = await pool.execute(
      `UPDATE store_types 
       SET type = ?, description = ?, status = ?
       WHERE id = ?`,
      [storeTypeName, description, status, id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: 'Store type updated successfully.' });
    } else {
      res.status(404).json({ success: false, message: 'Store type not found.' });
    }
  } catch (err) {
    console.error('Error updating store type:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// DELETE /api/store-types/:id - Delete a store type
router.delete('/store-types/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Delete the store type from the database
    const [result] = await pool.execute(`DELETE FROM store_types WHERE id = ?`, [id]);

    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: 'Store type deleted successfully.' });
    } else {
      res.status(404).json({ success: false, message: 'Store type not found.' });
    }
  } catch (err) {
    console.error('Error deleting store type:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

export default router;