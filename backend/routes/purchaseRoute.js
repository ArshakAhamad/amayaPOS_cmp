import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Middleware to parse JSON
router.use(express.json());

// Batch insert products with supplier
router.post('/productin', async (req, res) => {
  const { products, supplier } = req.body;

  if (!products || !Array.isArray(products)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid products data' 
    });
  }

  try {
    // Start a transaction
    await pool.query('START TRANSACTION');

    // Insert each product
    for (const product of products) {
      if (!product.product) continue;

      await pool.query(
        `INSERT INTO productin 
        (date, product, unitCost, quantity, totalCost, stock, supplier) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          product.date || new Date().toISOString().split('T')[0],
          product.product,
          product.unitCost || 0,
          product.quantity || 0,
          product.totalCost || 0,
          product.stock || 0,
          supplier || 'Unknown'
        ]
      );
    }

    // Commit the transaction
    await pool.query('COMMIT');
    res.json({ 
      success: true, 
      message: 'Products saved successfully' 
    });
  } catch (err) {
    // Rollback on error
    await pool.query('ROLLBACK');
    console.error('Error saving products:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
});

// Get all product entries
router.get('/productin', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id, 
        DATE_FORMAT(date, '%Y-%m-%d') as date,
        product, 
        unitCost, 
        quantity, 
        totalCost, 
        stock, 
        supplier 
      FROM productin 
      ORDER BY date DESC
    `);
    
    res.json({ 
      success: true, 
      products: rows 
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
});

export default router;