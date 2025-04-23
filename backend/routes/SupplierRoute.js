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

// In SupplierRoute.js - settlements endpoint
router.get("/suppliers/:id/settlements", async (req, res) => {
  try {
    const supplierId = req.params.id;

    // 1. First verify supplier exists
    const [supplier] = await pool.query(
      "SELECT id, supplier_name FROM suppliers WHERE id = ?",
      [supplierId]
    );

    if (!supplier.length) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    // 2. Get settlements - modified to handle empty results
    const [settlements] = await pool.query(
      `SELECT 
         sbs.id,
         sbs.bill_no,
         sbs.amount,
         sbs.settlement_date,
         sbs.settled_by,
         sbs.productin_id,
         pi.product AS product_name,
         pi.date AS purchase_date,
         pi.quantity,
         pi.unitCost
       FROM supplier_bill_settlements sbs
       LEFT JOIN productin pi ON sbs.productin_id = pi.id
       WHERE sbs.supplier_id = ?`,
      [supplierId]
    );

    // Always return success with empty array if no settlements
    res.json({
      success: true,
      message: settlements.length
        ? "Settlements found"
        : "No settlements found for this supplier",
      supplier: {
        id: supplier[0].id,
        name: supplier[0].supplier_name,
      },
      settlements: settlements || [],
      summary: {
        outstanding: settlements.reduce(
          (sum, s) => (s.settlement_date ? sum : sum + s.amount),
          0
        ),
        settled: settlements.reduce(
          (sum, s) => (s.settlement_date ? sum + s.amount : sum),
          0
        ),
        total: settlements.reduce((sum, s) => sum + s.amount, 0),
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Database error",
      error: error.message,
    });
  }
});

// PUT /api/suppliers/:supplierId/settlements/:billId - Mark bill as settled
router.put("/suppliers/:supplierId/settlements/:billId", async (req, res) => {
  const { supplierId, billId } = req.params;

  try {
    await pool.query("START TRANSACTION");

    // 1. Verify the bill exists and belongs to the supplier
    const [bill] = await pool.query(
      `SELECT id, amount FROM supplier_bill_settlements 
       WHERE id = ? AND supplier_id = ? AND settlement_date IS NULL`,
      [billId, supplierId]
    );

    if (!bill.length) {
      await pool.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Bill not found or already settled",
      });
    }

    const amount = bill[0].amount;
    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    // 2. Update the settlement record
    await pool.query(
      `UPDATE supplier_bill_settlements 
       SET settlement_date = ?, settled_by = ?
       WHERE id = ?`,
      [currentDate, req.user.id, billId]
    );

    // 3. Update the productin record
    await pool.query(
      `UPDATE productin SET is_settled = 1 
       WHERE id = (SELECT productin_id FROM supplier_bill_settlements WHERE id = ?)`,
      [billId]
    );

    // 4. Update supplier's outstanding balance
    await pool.query(
      `UPDATE suppliers 
       SET outstanding = GREATEST(COALESCE(outstanding, 0) - ?, 0)
       WHERE id = ?`,
      [amount, supplierId]
    );

    await pool.query("COMMIT");

    res.json({
      success: true,
      message: "Bill marked as settled successfully",
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error settling bill:", error);
    res.status(500).json({
      success: false,
      message: "Failed to settle bill",
      error: error.message,
    });
  }
});

export default router;
