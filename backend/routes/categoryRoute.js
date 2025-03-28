import express from 'express';
import pool from '../config/db.js'; // Import your database pool
import { Parser } from 'json2csv'; // Import json2csv for export functionality
import fs from 'fs';
import path from 'path';

const router = express.Router();

// GET /api/categories - Fetch all categories
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT 
        id,
        category_name,
        description,
        created_at,
        created_by,
        status
      FROM categories
    `);

    if (categories.length === 0) {
      return res.status(404).json({ success: false, message: 'No categories found.' });
    }

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/categories - Create a new category
router.post('/categories', async (req, res) => {
    const { categoryName, description, createdBy, status } = req.body;
  
    // Validate required fields
    if (!categoryName || categoryName.length < 3) {
      return res.status(400).json({ success: false, message: 'Category Name must be at least 3 characters long.' });
    }
  
    try {
      // Insert the category details into the database
      const [result] = await pool.execute(
        `INSERT INTO categories (category_name, description, created_by, status) VALUES (?, ?, ?, ?)`,
        [categoryName, description || '', createdBy || 'Admin', status || 'Active']
      );
  
      if (result.affectedRows > 0) {
        res.status(201).json({ success: true, message: 'Category created successfully.' });
      } else {
        res.status(500).json({ success: false, message: 'Failed to create category.' });
      }
    } catch (err) {
      console.error('Error creating category:', err); // Log the error
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  });

// Export categories in CSV format
router.get('/categories/export/csv', async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT 
        id,
        category_name,
        description,
        created_at,
        created_by,
        status
      FROM categories
    `);

    if (categories.length === 0) {
      return res.status(404).json({ success: false, message: 'No categories found to export.' });
    }

    const parser = new Parser();
    const csv = parser.parse(categories);

    const filePath = path.join(__dirname, 'uploads', `categories-${Date.now()}.csv`);
    fs.writeFileSync(filePath, csv);

    res.download(filePath, 'categories.csv', (err) => {
      if (err) {
        console.error('Error downloading CSV:', err);
        res.status(500).send('Error downloading file');
      }
      // Cleanup the file after download
      fs.unlinkSync(filePath);
    });
  } catch (err) {
    console.error('Error exporting categories:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Export categories in JSON format
router.get('/categories/export/json', async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT 
        id,
        category_name,
        description,
        created_at,
        created_by,
        status
      FROM categories
    `);

    if (categories.length === 0) {
      return res.status(404).json({ success: false, message: 'No categories found to export.' });
    }

    res.json({ success: true, categories });
  } catch (err) {
    console.error('Error exporting categories:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route to update category details
router.put('/categories/:id', async (req, res) => {
  const { id } = req.params;
  const {
    category_name,
    description,
    status
  } = req.body;

  try {
    // Check if category exists
    const [existingCategory] = await pool.execute(
      'SELECT * FROM categories WHERE id = ?', 
      [id]
    );
    
    if (existingCategory.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Update the category in the database
    const [result] = await pool.execute(
      `UPDATE categories SET 
        category_name = ?,
        description = ?,
        status = ?
      WHERE id = ?`,
      [
        category_name,
        description,
        status,
        id
      ]
    );

    if (result.affectedRows > 0) {
      // Fetch the updated record
      const [updatedCategory] = await pool.execute(
        'SELECT * FROM categories WHERE id = ?', 
        [id]
      );
      return res.json({ 
        success: true, 
        message: 'Category updated successfully', 
        data: updatedCategory[0] 
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to update category' 
      });
    }
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

export default router;
