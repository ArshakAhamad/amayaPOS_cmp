import express from 'express';
import pool from '../config/db.js'; // Import your database pool
import multer from 'multer'; // Import multer for file uploads
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage });

// POST /api/products - Create a new product with file upload
router.post('/products', upload.single('file'), async (req, res) => {
  const {
    productName,
    barcode,
    category,
    supplier,
    price,
    discount,
    minQuantity,
    giftVoucher,
  } = req.body;

  const filePath = req.file ? req.file.path : null; // Get the file path if a file is uploaded

  // Validate required fields
  if (
    !productName ||
    !barcode ||
    !category ||
    !supplier ||
    !price ||
    !minQuantity
  ) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    // Insert the product details into the database
    const [result] = await pool.execute(
      `INSERT INTO products (
        product_name, 
        barcode, 
        category, 
        supplier, 
        price, 
        discount, 
        min_quantity, 
        gift_voucher,
        image_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productName,
        barcode,
        category,
        supplier,
        price,
        discount || 0, // Default to 0 if discount is not provided
        minQuantity,
        giftVoucher || false, // Default to false if giftVoucher is not provided
        filePath, // Save the file path in the database
      ]
    );

    if (result.affectedRows > 0) {
      res.status(201).json({ success: true, message: 'Product created successfully.' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to create product.' });
    }
  } catch (err) {
    console.error('Error creating product:', err); // Log the error
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// GET /api/products - Fetch all products
router.get('/products', async (req, res) => {
  try {
    const [products] = await pool.execute(`
      SELECT 
        id,
        product_name,
        barcode,
        category,
        supplier,
        price,
        discount,
        min_quantity,
        gift_voucher,
        image_path,
        created_at,
        last_cost,
        avg_cost,
        created_by,
        status
      FROM products
    `);

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'No products found.' });
    }

    // Parse numeric fields as numbers
    const parsedProducts = products.map((product) => ({
      ...product,
      price: parseFloat(product.price),
      discount: parseFloat(product.discount),
      last_cost: product.last_cost ? parseFloat(product.last_cost) : null,
      avg_cost: product.avg_cost ? parseFloat(product.avg_cost) : null,
    }));

    res.status(200).json({
      success: true,
      products: parsedProducts,
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
export default router;