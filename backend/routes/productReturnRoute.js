import express from 'express';
import pool from '../config/db.js'; // Import your database connection pool

const router = express.Router();

// POST /api/product-returns - Create a new product return
router.post('/product-returns', async (req, res) => {
  const { date, product, unitCost, quantity, totalCost, avgCost, stock } = req.body;

  // Validate required fields
  if (!date || !product || !unitCost || !quantity || !totalCost || !avgCost || !stock) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    // Insert the product return details into the database
    const [result] = await pool.execute(
      `INSERT INTO product_returns (date, product, unitCost, quantity, totalCost, avgCost, stock)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [date, product, unitCost, quantity, totalCost, avgCost, stock]
    );

    if (result.affectedRows > 0) {
      res.status(201).json({ success: true, message: 'Product return created successfully.' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to create product return.' });
    }
  } catch (err) {
    console.error('Error creating product return:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// GET /api/product-returns - Fetch all product returns
router.get('/product-returns', async (req, res) => {
  try {
    const [productReturns] = await pool.execute(`
      SELECT 
        id,
        date,
        product,
        unitCost,
        quantity,
        totalCost,
        avgCost,
        stock
      FROM product_returns
    `);

    if (productReturns.length === 0) {
      return res.status(404).json({ success: false, message: 'No product returns found.' });
    }

    res.status(200).json({ success: true, productReturns });
  } catch (err) {
    console.error('Error fetching product returns:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/product-returns/:id - Update a product return
router.put('/product-returns/:id', async (req, res) => {
  const { id } = req.params;
  const { date, product, unitCost, quantity, totalCost, avgCost, stock } = req.body;

  // Validate required fields
  if (!date || !product || !unitCost || !quantity || !totalCost || !avgCost || !stock) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    // Update the product return details in the database
    const [result] = await pool.execute(
      `UPDATE product_returns 
       SET date = ?, product = ?, unitCost = ?, quantity = ?, totalCost = ?, avgCost = ?, stock = ? 
       WHERE id = ?`,
      [date, product, unitCost, quantity, totalCost, avgCost, stock, id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: 'Product return updated successfully.' });
    } else {
      res.status(404).json({ success: false, message: 'Product return not found.' });
    }
  } catch (err) {
    console.error('Error updating product return:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// DELETE /api/product-returns/:id - Delete a product return
router.delete('/product-returns/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Delete the product return from the database
    const [result] = await pool.execute(`DELETE FROM product_returns WHERE id = ?`, [id]);

    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: 'Product return deleted successfully.' });
    } else {
      res.status(404).json({ success: false, message: 'Product return not found.' });
    }
  } catch (err) {
    console.error('Error deleting product return:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

export default router;
