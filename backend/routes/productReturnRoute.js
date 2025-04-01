import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Fetch all product returns
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM `product-returns`');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new product return
router.post('/', async (req, res) => {
  const { date, product_id, unit_cost, quantity, total_cost, avg_cost, stock } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO `product-returns` (date, product_id, unit_cost, quantity, total_cost, avg_cost, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [date, product_id, unit_cost, quantity, total_cost, avg_cost, stock]
    );
    res.status(201).json({ id: result.insertId, message: 'Product return added successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a product return
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM `product-returns` WHERE id = ?', [id]);
    res.json({ message: 'Product return deleted successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
