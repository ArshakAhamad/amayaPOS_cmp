import express from 'express';
import pool from '../config/db.js'; // Import your database connection pool

const router = express.Router();

// POST /api/stores - Create a new store
router.post('/stores', async (req, res) => {
  const { storeName, description, storeType } = req.body;

  // Validate required fields
  if (!storeName || !storeType) {
    return res.status(400).json({ success: false, message: 'Store Name and Store Type are required.' });
  }

  try {
    // Insert the store details into the database
    const [result] = await pool.execute(
      `INSERT INTO stores (store_name, description, store_type) VALUES (?, ?, ?)`,
      [storeName, description, storeType]
    );

    if (result.affectedRows > 0) {
      res.status(201).json({ success: true, message: 'Store created successfully.' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to create store.' });
    }
  } catch (err) {
    console.error('Error creating store:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// GET /api/stores - Fetch all stores
router.get('/stores', async (req, res) => {
  try {
    const [stores] = await pool.execute(`
      SELECT 
        id,
        store_name AS name,
        description,
        store_type AS type,
        created_at AS createdDate,
        created_by AS createdBy,
        status
      FROM stores
    `);

    if (stores.length === 0) {
      return res.status(404).json({ success: false, message: 'No stores found.' });
    }

    res.status(200).json({ success: true, stores });
  } catch (err) {
    console.error('Error fetching stores:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/stores/:id - Update a store
router.put('/stores/:id', async (req, res) => {
  const { id } = req.params;
  const { storeName, description, storeType, status } = req.body;

  // Validate required fields
  if (!storeName || !storeType || !status) {
    return res.status(400).json({ success: false, message: 'Store Name, Store Type, and Status are required.' });
  }

  try {
    // Update the store details in the database
    const [result] = await pool.execute(
      `UPDATE stores 
       SET store_name = ?, description = ?, store_type = ?, status = ?
       WHERE id = ?`,
      [storeName, description, storeType, status, id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: 'Store updated successfully.' });
    } else {
      res.status(404).json({ success: false, message: 'Store not found.' });
    }
  } catch (err) {
    console.error('Error updating store:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Route to update store details
router.put('/stores/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    storeName, // from frontend
    name,      // alternative from frontend
    storeType, // from frontend
    type,      // alternative from frontend
    description, 
    status 
  } = req.body;

  // Use whichever name was provided
  const finalStoreName = storeName || name;
  const finalStoreType = storeType || type;

  // Validate required fields
  if (!finalStoreName || !finalStoreType || !status) {
    return res.status(400).json({ 
      success: false, 
      message: 'Store Name, Store Type, and Status are required.' 
    });
  }

  try {
    // Update the store details in the database
    const [result] = await pool.execute(
      `UPDATE stores 
       SET store_name = ?, description = ?, store_type = ?, status = ?
       WHERE id = ?`,
      [finalStoreName, description, finalStoreType, status, id]
    );

    if (result.affectedRows > 0) {
      // Fetch the updated record
      const [updatedStore] = await pool.execute(`
        SELECT 
          id,
          store_name AS name,
          description,
          store_type AS type,
          created_at AS createdDate,
          created_by AS createdBy,
          status
        FROM stores WHERE id = ?`, 
        [id]
      );
      
      res.status(200).json({ 
        success: true, 
        message: 'Store updated successfully.',
        data: updatedStore[0]
      });
    } else {
      res.status(404).json({ success: false, message: 'Store not found.' });
    }
  } catch (err) {
    console.error('Error updating store:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
});

// DELETE /api/stores/:id - Delete a store
router.delete('/stores/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Delete the store from the database
    const [result] = await pool.execute(`DELETE FROM stores WHERE id = ?`, [id]);

    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: 'Store deleted successfully.' });
    } else {
      res.status(404).json({ success: false, message: 'Store not found.' });
    }
  } catch (err) {
    console.error('Error deleting store:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

export default router;