import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET all product returns
router.get('/', async (req, res) => {
  try {
    const [returns] = await pool.query(`
      SELECT 
        pr.id,
        DATE_FORMAT(pr.date, '%Y-%m-%d') as date,
        p.product_name AS product,
        pr.unit_cost AS unitCost,
        pr.quantity,
        pr.total_cost AS totalCost,
        pr.avg_cost AS avgCost,
        pr.stock,
        pr.created_at AS createdAt
      FROM product_returns pr
      JOIN products p ON pr.product_id = p.id
      ORDER BY pr.date DESC
    `);
    res.status(200).json({ success: true, returns });
  } catch (err) {
    console.error('Error fetching returns:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST create new product return
router.post('/', async (req, res) => {
  const { products } = req.body;

  if (!products || !Array.isArray(products)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid products data' 
    });
  }

  try {
    await pool.query('START TRANSACTION');

    for (const product of products) {
      // First get product ID
      const [productRows] = await pool.query(
        'SELECT id FROM products WHERE product_name = ? LIMIT 1',
        [product.product]
      );

      if (productRows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ 
          success: false, 
          message: `Product not found: ${product.product}` 
        });
      }

      const productId = productRows[0].id;

      // Insert return record
      await pool.query(
        `INSERT INTO product_returns 
        (date, product_id, unit_cost, quantity, total_cost, avg_cost, stock) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          product.date,
          productId,
          product.unitCost,
          product.quantity,
          product.totalCost,
          product.avgCost,
          product.stock
        ]
      );

      // Update product stock
      await pool.query(
        `UPDATE products SET 
        stock = stock + ?,
        last_cost = ?,
        avg_cost = ?
        WHERE id = ?`,
        [
          product.quantity,
          product.unitCost,
          product.avgCost,
          productId
        ]
      );
    }

    await pool.query('COMMIT');
    res.status(201).json({ 
      success: true, 
      message: 'Returns saved successfully' 
    });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error saving returns:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save returns',
      error: err.message 
    });
  }
});

// GET product suggestions
router.get('/suggestions', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ 
      success: false, 
      message: 'Search query required' 
    });
  }

  try {
    const [products] = await pool.query(`
      SELECT 
        id,
        product_name AS name,
        barcode,
        last_cost AS unitCost,
        avg_cost AS avgCost,
        stock
      FROM products
      WHERE product_name LIKE ? OR barcode LIKE ?
      LIMIT 10
    `, [`%${query}%`, `%${query}%`]);

    res.status(200).json({ success: true, products });
  } catch (err) {
    console.error('Error fetching suggestions:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

export default router;