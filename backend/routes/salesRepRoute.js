import express from 'express';
import pool from '../config/db.js'; // MySQL connection pool
import bcrypt from 'bcrypt';


const router = express.Router();

// Sales Rep creation route
router.post('/sales-rep', async (req, res) => {
  const {
    name,
    username,
    store,
    description,
    email,
    phone,
    remarks,
    notificationMethod,
    generatedPassword
  } = req.body;

  // Basic validation
  if (!name || !username || !store || !email || !phone || !notificationMethod) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Check if username exists
    const [salesRepCheck] = await connection.query(
      'SELECT 1 FROM sales_rep WHERE user_name = ? LIMIT 1', 
      [username]
    );
    
    const [systemUserCheck] = await connection.query(
      'SELECT 1 FROM system_user WHERE username = ? LIMIT 1',
      [username]
    );

    if (salesRepCheck.length > 0 || systemUserCheck.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Insert sales rep
    const [salesRepResult] = await connection.query(
      `INSERT INTO sales_rep 
      (salesrep_name, user_name, store, description, email, phone, remarks, notification_method) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, username, store, description, email, phone, remarks, notificationMethod]
    );

    // If manual notification, create system user with hashed password
    if (notificationMethod.toLowerCase() === "manual" && generatedPassword) {
      try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(generatedPassword, saltRounds);
        
        await connection.query(
          `INSERT INTO system_user 
          (username, email, password, role) 
          VALUES (?, ?, ?, ?)`,
          [username, email, hashedPassword, 'Cashier']
        );
      } catch (hashError) {
        console.error('Password hashing error:', hashError);
        await connection.rollback();
        return res.status(500).json({
          success: false,
          message: 'Failed to hash password'
        });
      }
    }

    await connection.commit();
    
    return res.json({
      success: true,
      message: 'Sales Rep created successfully',
      data: {
        salesRepId: salesRepResult.insertId
      }
    });

  } catch (err) {
    console.error('Database error:', err);
    
    if (connection) {
      await connection.rollback();
    }
    
    return res.status(500).json({
      success: false,
      message: 'Database operation failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Sales Rep List route
router.get('/sales-reps', async (req, res) => {
    try {
      // Query to fetch all sales reps
      const [rows] = await pool.execute('SELECT * FROM sales_rep');
      
      // Send the sales rep data as a response
      res.json({ success: true, salesReps: rows });
    } catch (err) {
      console.error('Error fetching sales reps:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }); 

  // Route to update sales rep status
router.patch('/sales-rep/status/:id', async (req, res) => {
    const { id } = req.params; // Get the sales rep ID from the URL
    const { status } = req.body; // Get the new status from the request body
  
    try {
      // Validate the status value
      if (status !== "Active" && status !== "Inactive") {
        return res.status(400).json({ success: false, message: "Invalid status" });
      }
  
      // Update the status in the database
      const [result] = await pool.execute(
        'UPDATE sales_rep SET status = ? WHERE salesrep_id = ?',
        [status, id]
      );
  
      if (result.affectedRows > 0) {
        return res.json({ success: true, message: 'Sales Rep status updated successfully' });
      } else {
        return res.status(404).json({ success: false, message: 'Sales Rep not found' });
      }
    } catch (err) {
      console.error('Error updating status:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  
// Route to update sales rep details
router.put('/sales-reps/:id', async (req, res) => {
  const { id } = req.params;
  const {
    salesrep_name,
    user_name,
    store,
    description,
    email,
    phone,
    remarks,
    notification_method,
    status
  } = req.body;

  try {
    // Check if sales rep exists
    const [existingRep] = await pool.execute('SELECT * FROM sales_rep WHERE salesrep_id = ?', [id]);
    if (existingRep.length === 0) {
      return res.status(404).json({ success: false, message: 'Sales Rep not found' });
    }

    // Update the sales rep in the database
    const [result] = await pool.execute(
      `UPDATE sales_rep SET 
        salesrep_name = ?,
        user_name = ?,
        store = ?,
        description = ?,
        email = ?,
        phone = ?,
        remarks = ?,
        notification_method = ?,
        status = ?
      WHERE salesrep_id = ?`,
      [
        salesrep_name,
        user_name,
        store,
        description,
        email,
        phone,
        remarks,
        notification_method,
        status,
        id
      ]
    );

    if (result.affectedRows > 0) {
      // Fetch the updated record
      const [updatedRep] = await pool.execute('SELECT * FROM sales_rep WHERE salesrep_id = ?', [id]);
      return res.json({ success: true, message: 'Sales Rep updated successfully', data: updatedRep[0] });
    } else {
      return res.status(400).json({ success: false, message: 'Failed to update Sales Rep' });
    }
  } catch (err) {
    console.error('Error updating sales rep:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
