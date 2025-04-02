import express from "express";
import pool from "../config/db.js"; // Import your database pool

const router = express.Router();

// POST /api/customers - Create a new customer
router.post("/customers", async (req, res) => {
  const { customerName, phone, address } = req.body;

  // Validate inputs
  if (!customerName || !phone || !address) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  try {
    // Insert the customer details into the database
    const [result] = await pool.execute(
      "INSERT INTO customers (customer_name, customer_phone, customer_address, customer_active) VALUES (?, ?, ?, ?)",
      [customerName, phone, address, true], // Default to active true
    );

    if (result.affectedRows > 0) {
      res
        .status(201)
        .json({ success: true, message: "Customer created successfully." });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Failed to create customer." });
    }
  } catch (err) {
    console.error("Error creating customer:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/customers - Fetch all customers
router.get("/customers", async (req, res) => {
  try {
    // Query to fetch all customers from the database
    const [customers] = await pool.execute("SELECT * FROM customers");

    if (customers.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No customers found." });
    }

    res.status(200).json({
      success: true,
      customers: customers,
    });
  } catch (err) {
    console.error("Error fetching customers:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Route to update customer details
router.put("/customers/:id", async (req, res) => {
  const { id } = req.params;
  const { customer_name, customer_phone, customer_address, customer_active } =
    req.body;

  try {
    // Check if customer exists
    const [existingCustomer] = await pool.execute(
      "SELECT * FROM customers WHERE customer_id = ?",
      [id],
    );

    if (existingCustomer.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    // Update the customer in the database
    const [result] = await pool.execute(
      `UPDATE customers SET 
        customer_name = ?,
        customer_phone = ?,
        customer_address = ?,
        customer_active = ?
      WHERE customer_id = ?`,
      [customer_name, customer_phone, customer_address, customer_active, id],
    );

    if (result.affectedRows > 0) {
      // Fetch the updated record
      const [updatedCustomer] = await pool.execute(
        "SELECT * FROM customers WHERE customer_id = ?",
        [id],
      );
      return res.json({
        success: true,
        message: "Customer updated successfully",
        data: updatedCustomer[0],
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Failed to update customer",
      });
    }
  } catch (err) {
    console.error("Error updating customer:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
