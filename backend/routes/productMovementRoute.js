import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Get product movement report
router.get('/', async (req, res) => {
  const { startDate, endDate, productId } = req.query;

  try {
    // Base query for sales data
    let salesQuery = `
      SELECT 
        DATE_FORMAT(p.created_at, '%Y-%m-%d') as date,
        'Sale' as type,
        p.receipt_number as reference,
        pi.product_name as product,
        pi.price,
        pr.last_cost as cost,
        0 as productIn,
        pi.quantity as productOut,
        NULL as returnId,
        (
          SELECT COALESCE(SUM(quantity), 0) 
          FROM productin 
          WHERE product = pi.product_name AND date <= p.created_at
        ) - 
        (
          SELECT COALESCE(SUM(quantity), 0) 
          FROM payment_items 
          WHERE product_name = pi.product_name 
          AND payment_id IN (SELECT id FROM payments WHERE created_at <= p.created_at)
        ) as inventory
      FROM payments p
      JOIN payment_items pi ON p.id = pi.payment_id
      JOIN products pr ON pi.product_id = pr.id
      WHERE p.status = 'Active' AND p.created_at BETWEEN ? AND ?
    `;

    const salesParams = [startDate, endDate];

    if (productId) {
      salesQuery += ' AND pi.product_id = ?';
      salesParams.push(productId);
    }

    // Query for purchase data
    let purchaseQuery = `
      SELECT 
        DATE_FORMAT(date, '%Y-%m-%d') as date,
        'Purchase' as type,
        CONCAT('PIN-', id) as reference,
        product,
        unitCost as price,
        unitCost as cost,
        quantity as productIn,
        0 as productOut,
        NULL as returnId,
        (
          SELECT COALESCE(SUM(quantity), 0) 
          FROM productin 
          WHERE product = pi.product AND date <= pi.date
        ) - 
        (
          SELECT COALESCE(SUM(quantity), 0) 
          FROM payment_items 
          WHERE product_name = pi.product 
          AND payment_id IN (SELECT id FROM payments WHERE created_at <= pi.date)
        ) as inventory
      FROM productin pi
      WHERE date BETWEEN ? AND ?
    `;

    const purchaseParams = [startDate, endDate];
    
    if (productId) {
      purchaseQuery += ' AND product = (SELECT product_name FROM products WHERE id = ?)';
      purchaseParams.push(productId);
    }

    // Execute both queries
    const [sales] = await pool.query(salesQuery, salesParams);
    const [purchases] = await pool.query(purchaseQuery, purchaseParams);
    const movements = [...sales, ...purchases].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate summary data
    const summary = {
      productSales: 0,
      costDiscounts: 0,
      profitLoss: 0
    };

    movements.forEach(movement => {
      if (movement.type === 'Sale') {
        summary.productSales += Number(movement.price) * Number(movement.productOut);
        summary.costDiscounts += Number(movement.cost) * Number(movement.productOut);
      }
    });

    summary.profitLoss = summary.productSales - summary.costDiscounts;

    res.json({
      success: true,
      movements,
      summary
    });

  } catch (err) {
    console.error('Error fetching product movement:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get all products for dropdown
router.get('/products', async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT id, product_name 
      FROM products 
      WHERE status = 'Active'
      ORDER BY product_name ASC
    `);
    res.json({ success: true, products });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;