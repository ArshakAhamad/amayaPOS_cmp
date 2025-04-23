import express from "express";
import pool from "../config/db.js"; // Import your MySQL connection pool

const router = express.Router();

// GET /api/suppliers - Fetch all suppliers with pagination and search
router.get("/suppliers", async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `SELECT * FROM suppliers`;
    let params = [];

    // Add search filter if search query is provided
    if (search) {
      query += ` WHERE supplier_name LIKE ?`;
      params.push(`%${search}%`);
    }

    // Add pagination
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Fetch suppliers from the database
    const [suppliers] = await pool.execute(query, params);

    if (suppliers.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No suppliers found." });
    }

    // Parse numeric fields as numbers
    const parsedSuppliers = suppliers.map((supplier) => ({
      ...supplier,
      outstanding: parseFloat(supplier.outstanding), // Parse outstanding as a number
    }));

    // Return the suppliers data
    res.status(200).json({
      success: true,
      suppliers: parsedSuppliers,
    });
  } catch (err) {
    console.error("Error fetching suppliers:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/suppliers - Create a new supplier
router.post("/suppliers", async (req, res) => {
  const { supplierName, creditPeriod, description } = req.body;

  // Validate required fields
  if (!supplierName || !creditPeriod) {
    return res.status(400).json({
      success: false,
      message: "Supplier Name and Credit Period are required.",
    });
  }

  try {
    // Insert the supplier details into the database
    const [result] = await pool.execute(
      `INSERT INTO suppliers (supplier_name, outstanding, credit_period, description, created_by, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [supplierName, 0.0, creditPeriod, description || "", "Admin", "Active"] // Default values for outstanding, created_by, and status
    );

    if (result.affectedRows > 0) {
      res
        .status(201)
        .json({ success: true, message: "Supplier created successfully." });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Failed to create supplier." });
    }
  } catch (err) {
    console.error("Error creating supplier:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

// GET /api/suppliers - Include outstanding calculation
router.get("/", async (req, res) => {
  try {
    // Get all suppliers with their outstanding amounts
    const [suppliers] = await pool.execute(`
      SELECT s.*, 
        COALESCE(
          (SELECT SUM(pi.total_cost) 
           FROM product_in pi 
           WHERE pi.supplier_id = s.id 
           AND pi.is_settled = 0), 0) AS outstanding
      FROM suppliers s
    `);

    res.json({ success: true, suppliers });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/productin - Update to track supplier purchases
router.post("/", async (req, res) => {
  const { products, supplierId } = req.body;

  try {
    await pool.beginTransaction();

    // Insert each product purchase
    for (const product of products) {
      await pool.execute(
        `INSERT INTO product_in 
        (date, product_id, product_name, unit_cost, quantity, total_cost, supplier_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          product.date,
          product.product_id,
          product.product,
          product.unitCost,
          product.quantity,
          product.totalCost,
          supplierId,
        ]
      );

      // Update product stock
      await pool.execute(`UPDATE products SET stock = stock + ? WHERE id = ?`, [
        product.quantity,
        product.product_id,
      ]);
    }

    await pool.commit();
    res.json({ success: true, message: "Products saved successfully" });
  } catch (error) {
    await pool.rollback();
    console.error("Error saving products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/suppliers/:id/toggle-status - Toggle the status of a supplier
router.post("/suppliers/:id/toggle-status", async (req, res) => {
  const { id } = req.params;

  try {
    // Get the current status of the supplier
    const [supplier] = await pool.execute(
      `SELECT status FROM suppliers WHERE id = ?`,
      [id]
    );

    if (supplier.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Supplier not found." });
    }

    // Toggle status: if "Active" => "Inactive", if "Inactive" => "Active"
    const newStatus = supplier[0].status === "Active" ? "Inactive" : "Active";

    // Update the status of the supplier
    await pool.execute(`UPDATE suppliers SET status = ? WHERE id = ?`, [
      newStatus,
      id,
    ]);

    res.status(200).json({
      success: true,
      message: "Supplier status updated successfully.",
    });
  } catch (err) {
    console.error("Error toggling supplier status:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/suppliers/outstanding - Get outstanding amounts from productin
// Add this route to your supplierRoute.js
router.get("/outstanding", async (req, res) => {
  const { search = "", page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // Base query
    let query = `
      SELECT 
        s.id,
        s.supplier_name,
        s.outstanding,
        s.credit_period,
        s.status,
        s.created_at,
        s.created_by,
        COUNT(pi.id) as purchase_count,
        COALESCE(SUM(pi.totalCost), 0) as total_purchases
      FROM suppliers s
      LEFT JOIN productin pi ON s.id = pi.supplier_id
    `;

    let countQuery = `SELECT COUNT(*) as total FROM suppliers s`;
    let queryParams = [];
    let countParams = [];

    // Add search filter if provided
    if (search) {
      query += ` WHERE s.supplier_name LIKE ?`;
      countQuery += ` WHERE s.supplier_name LIKE ?`;
      queryParams.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    // Complete the queries
    query += `
      GROUP BY s.id
      ORDER BY s.supplier_name
      LIMIT ? OFFSET ?
    `;
    queryParams.push(parseInt(limit), parseInt(offset));

    // Execute both queries in parallel
    const [suppliers, [totalCount]] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, countParams),
    ]);

    res.json({
      success: true,
      suppliers: suppliers[0].map((row) => ({
        ...row,
        outstanding: parseFloat(row.outstanding) || 0,
        total_purchases: parseFloat(row.total_purchases) || 0,
      })),
      totalCount: totalCount[0].total,
    });
  } catch (err) {
    console.error("Error fetching supplier outstanding:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// GET /api/suppliers/bills - Get supplier bills
router.get("/suppliers/bills", async (req, res) => {
  try {
    const [bills] = await pool.execute(`
      SELECT 
        s.id as supplier_id,
        s.supplier_name,
        sb.bill_no,
        sb.outstanding_amount,
        sb.settlement_date,
        sb.settled_amount,
        u.username as approved_by
      FROM supplier_bill_settlements sb
      JOIN suppliers s ON sb.supplier_id = s.id
      JOIN system_user u ON sb.approved_by = u.id
      ORDER BY sb.settlement_date DESC
    `);

    res.status(200).json({
      success: true,
      bills,
    });
  } catch (err) {
    console.error("Error fetching supplier bills:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// POST /api/suppliers/settle - Settle a supplier bill

/*router.post("/suppliers/settle", async (req, res) => {
  const { billNo, supplierId, outstandingAmount, approvalPassword } = req.body;

  // Input validation
  if (!billNo || !supplierId || !outstandingAmount) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  // Check password (simple validation - in production use proper auth)
  if (approvalPassword !== "admin123") {
    return res.status(403).json({
      success: false,
      message: "Invalid approval password",
    });
  }

  try {
    // Start transaction
    await pool.query("START TRANSACTION");

    // 1. Record the settlement
    const [result] = await pool.execute(
      `INSERT INTO supplier_bill_settlements 
       (supplier_id, bill_no, outstanding_amount, settled_amount, settlement_date, approved_by, approval_method)
       VALUES (?, ?, ?, ?, CURDATE(), 1, 'password')`,
      [supplierId, billNo, outstandingAmount, outstandingAmount]
    );

    // 2. Update supplier's outstanding balance
    await pool.execute(
      `UPDATE suppliers 
       SET outstanding = outstanding - ?
       WHERE id = ?`,
      [outstandingAmount, supplierId]
    );

    // Commit transaction
    await pool.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Bill settled successfully",
      settlementId: result.insertId,
    });
  } catch (err) {
    // Rollback on error
    await pool.query("ROLLBACK");
    console.error("Error settling supplier bill:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
}); */

// Get all bills for a specific supplier
router.get("/suppliers/:id/bills", async (req, res) => {
  try {
    const { id } = req.params;

    // Get unsettled purchase bills
    const [unsettledBills] = await pool.query(
      `
      SELECT 
        p.id,
        p.date,
        p.product,
        p.unitCost,
        p.quantity,
        p.totalCost,
        p.bill_no,
        s.supplier_name
      FROM productin p
      JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.supplier_id = ? AND p.is_settled = FALSE
      ORDER BY p.date DESC
    `,
      [id]
    );

    // Get settlement history
    const [settledBills] = await pool.query(
      `
      SELECT 
        s.id,
        s.settlement_date,
        p.product,
        s.amount,
        s.bill_no,
        u.username as settled_by
      FROM supplier_bill_settlements s
      JOIN productin p ON s.productin_id = p.id
      JOIN system_user u ON s.settled_by = u.id
      WHERE s.supplier_id = ?
      ORDER BY s.settlement_date DESC
    `,
      [id]
    );

    res.json({
      success: true,
      unsettledBills,
      settledBills,
      supplier: (
        await pool.query("SELECT * FROM suppliers WHERE id = ?", [id])
      )[0][0],
    });
  } catch (err) {
    console.error("Error fetching supplier bills:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Settle a specific bill
router.post("/suppliers/:id/settle", async (req, res) => {
  const { id } = req.params;
  const { billId, approvalPassword } = req.body;

  try {
    // Verify admin password
    const [admin] = await pool.query(
      "SELECT id FROM system_user WHERE role = 'Admin' AND password = ?",
      [await bcrypt.hash(approvalPassword, 10)]
    );

    if (!admin.length) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid password" });
    }

    await pool.query("START TRANSACTION");

    // Get the bill details
    const [bill] = await pool.query(
      `
      SELECT id, totalCost, bill_no 
      FROM productin 
      WHERE id = ? AND supplier_id = ? AND is_settled = FALSE
    `,
      [billId, id]
    );

    if (!bill.length) {
      await pool.query("ROLLBACK");
      return res
        .status(404)
        .json({ success: false, message: "Bill not found" });
    }

    // Mark as settled
    await pool.query("UPDATE productin SET is_settled = TRUE WHERE id = ?", [
      billId,
    ]);

    // Record settlement
    await pool.query(
      `INSERT INTO supplier_bill_settlements 
       (supplier_id, productin_id, bill_no, amount, settled_by)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        billId,
        bill[0].bill_no || `BILL-${Date.now()}`,
        bill[0].totalCost,
        admin[0].id,
      ]
    );

    // Update supplier outstanding
    await pool.query(
      "UPDATE suppliers SET outstanding = outstanding - ? WHERE id = ?",
      [bill[0].totalCost, id]
    );

    await pool.query("COMMIT");
    res.json({ success: true, message: "Bill settled successfully" });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Error settling bill:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
