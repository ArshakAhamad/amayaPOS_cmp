import express from 'express';
import pool from '../config/db.js'; // MySQL connection pool

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
  } = req.body;

  try {
    // Check if username already exists
    console.log("Checking if username exists:", username);
    const [existingUser] = await pool.execute('SELECT * FROM sales_rep WHERE user_name = ?', [username]);
    console.log("Existing user check:", existingUser);

    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    // Insert the new sales rep into the database
    console.log('Inserting sales rep into the database:', { name, username, store, description, email });
    const [result] = await pool.execute(
      'INSERT INTO sales_rep (salesrep_name, user_name, store, description, email, phone, remarks, notification_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, username, store, description, email, phone, remarks, notificationMethod]
    );
    console.log("Sales rep added successfully:", result);

    res.json({ success: true, message: 'Sales Rep created successfully', data: result });
  } catch (err) {
    console.error('Error during sales rep insertion:', err);
    res.status(500).json({ success: false, message: 'Server error' });
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
  

export default router;
