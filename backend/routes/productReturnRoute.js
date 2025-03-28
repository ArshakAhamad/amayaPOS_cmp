import express from 'express';
import pool from '../config/db.js';
import cors from 'cors';

const router = express.Router();

router.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Validation middleware
const validateReturnData = (req, res, next) => {
  const { products } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Products array is required and must not be empty' 
    });
  }

  const validationErrors = [];
  
  products.forEach((product, index) => {
    const errors = [];
    
    if (!product.date) errors.push('Date is required');
    if (!product.product) errors.push('Product name is required');
    if (isNaN(parseFloat(product.unit_cost))) errors.push('Valid unit cost is required');
    if (isNaN(parseInt(product.quantity))) errors.push('Valid quantity is required');
    
    if (errors.length > 0) {
      validationErrors.push({
        productIndex: index,
        errors: errors.join(', ')
      });
    }
  });

  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validationErrors
    });
  }

  next();
};

// GET all returns
router.get('/', async (req, res) => {
  try {
    const [returns] = await pool.query(`
      SELECT 
        pr.id,
        DATE_FORMAT(pr.date, '%Y-%m-%d') as date,
        pr.product_id,
        pr.product_name as product,
        pr.unit_cost as unitCost,
        pr.quantity,
        pr.total_cost as totalCost,
        pr.avg_cost as avgCost,
        pr.stock,
        pr.return_reason,
        pr.status
      FROM product_returns pr
      ORDER BY pr.created_at DESC
    `);

    res.status(200).json({
      success: true,
      returns: returns || []
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch returns',
      error: err.message
    });
  }
});

// POST create returns
router.post('/', validateReturnData, async (req, res) => {
  try {
    await pool.query('START TRANSACTION');
    const insertedReturns = [];
    
    for (const product of req.body.products) {
      // Insert the return record
      const [result] = await pool.query(`
        INSERT INTO product_returns (
          date, 
          product_id, 
          product_name, 
          unit_cost, 
          quantity, 
          total_cost, 
          avg_cost, 
          stock, 
          return_reason,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        product.date,
        product.product_id,
        product.product,
        product.unit_cost,
        product.quantity,
        product.unit_cost * product.quantity,
        product.avg_cost,
        product.stock,
        product.return_reason || 'Damaged Product',
        'completed'
      ]);

      // Update product stock if needed
      if (product.product_id) {
        await pool.query(`
          UPDATE products 
          SET stock = stock + ? 
          WHERE id = ?
        `, [product.quantity, product.product_id]);
      }

      insertedReturns.push({
        id: result.insertId,
        ...product
      });
    }

    await pool.query('COMMIT');
    res.status(201).json({ 
      success: true,
      message: 'Returns processed successfully',
      returns: insertedReturns
    });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('POST Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to process returns',
      error: err.message
    });
  }
});

// GET product suggestions
router.get('/suggestions', async (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters'
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
      ORDER BY stock DESC, product_name ASC
      LIMIT 10
    `, [`%${query}%`, `%${query}%`]);

    res.status(200).json({
      success: true,
      products: products.map(p => ({
        ...p,
        stock: p.stock || 0,
        unitCost: p.unitCost || 0,
        avgCost: p.avgCost || 0
      }))
    });
  } catch (err) {
    console.error('Error fetching suggestions:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching suggestions',
      error: err.message
    });
  }
});

export default router;