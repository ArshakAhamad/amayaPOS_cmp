import express from 'express';
import pool from '../config/db.js'; // Import your database pool

const router = express.Router();

// POST /api/customers - Create a new customer
router.post('/customers', async (req, res) => {
  const { customerName, phone, address } = req.body;

  // Validate inputs
  if (!customerName || !phone || !address) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    // Insert the customer details into the database
    const [result] = await pool.execute(
      'INSERT INTO customers (customer_name, customer_phone, customer_address, customer_active) VALUES (?, ?, ?, ?)',
      [customerName, phone, address, true]  // Default to active true
    );

    if (result.affectedRows > 0) {
      res.status(201).json({ success: true, message: 'Customer created successfully.' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to create customer.' });
    }
  } catch (err) {
    console.error('Error creating customer:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/customers - Fetch all customers
router.get('/customers', async (req, res) => {
    try {
      // Query to fetch all customers from the database
      const [customers] = await pool.execute('SELECT * FROM customers');
      
      if (customers.length === 0) {
        return res.status(404).json({ success: false, message: 'No customers found.' });
      }
  
      res.status(200).json({
        success: true,
        customers: customers,
      });
    } catch (err) {
      console.error('Error fetching customers:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

export default router;
