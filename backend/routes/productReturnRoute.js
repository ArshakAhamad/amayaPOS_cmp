import express from 'express';
import pool from '../config/db.js';
import authenticateToken from '../middlewares/authenticateToken.js';

const router = express.Router();

// Get all product returns
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [returns] = await pool.query(`
      SELECT pr.*, p.product_name 
      FROM product-returns pr
      JOIN products p ON pr.product_id = p.id
      ORDER BY pr.date DESC
    `);
    
    res.json({
      success: true,
      data: returns.map(item => ({
        ...item,
        unitCost: Number(item.unitCost),
        totalCost: Number(item.totalCost),
        avgCost: Number(item.avgCost)
      }))
    });
  } catch (error) {
    console.error('Error fetching product returns:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product returns'
    });
  }
});

// Create new product return
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { date, product_id, unitCost, quantity, totalCost, avgCost, stock } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO product-returns 
       (date, product_id, unitCost, quantity, totalCost, avgCost, stock)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [date, product_id, unitCost, quantity, totalCost, avgCost, stock]
    );
    
    // Update product stock
    await pool.query(
      `UPDATE products SET stock = stock + ? WHERE id = ?`,
      [quantity, product_id]
    );
    
    res.status(201).json({
      success: true,
      message: 'Product return created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating product return:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product return'
    });
  }
});

// Delete product return
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // First get the return data to adjust stock
    const [returnData] = await pool.query(
      `SELECT product_id, quantity FROM product-returns WHERE id = ?`,
      [id]
    );
    
    if (returnData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product return not found'
      });
    }
    
    // Delete the return
    await pool.query(
      `DELETE FROM product_returns WHERE id = ?`,
      [id]
    );
    
    // Revert stock adjustment
    await pool.query(
      `UPDATE products SET stock = stock - ? WHERE id = ?`,
      [returnData[0].quantity, returnData[0].product_id]
    );
    
    res.json({
      success: true,
      message: 'Product return deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product return:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product return'
    });
  }
});

export default router;