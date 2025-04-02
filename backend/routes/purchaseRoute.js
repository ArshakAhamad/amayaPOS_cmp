import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// Middleware to parse JSON
router.use(express.json());

// Get all active suppliers
router.get("/suppliers", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, supplier_name 
      FROM suppliers 
      WHERE status = 'Active'
      ORDER BY supplier_name ASC
    `);
    res.json({ success: true, suppliers: rows });
  } catch (err) {
    console.error("Error fetching suppliers:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// Batch insert products with supplier
router.post("/productin", async (req, res) => {
  const { products, supplierId } = req.body;

  if (!products || !Array.isArray(products)) {
    return res.status(400).json({
      success: false,
      message: "Invalid products data",
    });
  }

  if (!supplierId) {
    return res.status(400).json({
      success: false,
      message: "Supplier ID is required",
    });
  }

  try {
    // First get supplier details
    const [supplierRows] = await pool.query(
      "SELECT supplier_name FROM suppliers WHERE id = ?",
      [supplierId],
    );

    if (supplierRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier ID",
      });
    }

    const supplierName = supplierRows[0].supplier_name;

    // Start a transaction
    await pool.query("START TRANSACTION");

    // Insert each product
    for (const product of products) {
      if (!product.product) continue;

      await pool.query(
        `INSERT INTO productin 
        (date, product, unitCost, quantity, totalCost, stock, supplier) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          product.date || new Date().toISOString().split("T")[0],
          product.product,
          product.unitCost || 0,
          product.quantity || 0,
          product.totalCost || 0,
          product.stock || 0,
          supplierName,
        ],
      );
    }

    // Commit the transaction
    await pool.query("COMMIT");
    res.json({
      success: true,
      message: "Products saved successfully",
    });
  } catch (err) {
    // Rollback on error
    await pool.query("ROLLBACK");
    console.error("Error saving products:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// Get all product entries
router.get("/productin", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id, 
        DATE_FORMAT(date, '%Y-%m-%d') as date,
        product, 
        unitCost, 
        quantity, 
        totalCost, 
        stock, 
        supplier 
      FROM productin 
      ORDER BY date DESC
    `);

    res.json({
      success: true,
      products: rows,
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// Delete a product entry
router.delete("/productin/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Start a transaction
    await pool.query("START TRANSACTION");

    const [result] = await pool.query("DELETE FROM productin WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Commit the transaction
    await pool.query("COMMIT");
    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    // Rollback on error
    await pool.query("ROLLBACK");
    console.error("Error deleting product:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

//--------------------------------------------------------------------------------------------Product Return--------------------------------------------------------------------------------//
// GET all product returns
router.get("/product-returns", async (req, res) => {
  try {
    const [returns] = await pool.execute(`
        SELECT 
          pr.id,
          pr.date,
          p.product_name AS product,
          pr.unit_cost AS unitCost,
          pr.quantity,
          pr.total_cost AS totalCost,
          pr.avg_cost AS avgCost,
          pr.stock,
          pr.created_at AS createdAt
        FROM product_returns pr
        JOIN products p ON pr.product_id = p.id
        ORDER BY pr.date DESC
      `);

    res.status(200).json({ success: true, returns });
  } catch (err) {
    console.error("Error fetching product returns:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST create new product return
router.post("/product-returns", async (req, res) => {
  const { returns } = req.body;

  if (!returns || !Array.isArray(returns) || returns.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No return data provided" });
  }

  try {
    await pool.execute("START TRANSACTION");

    // Insert each return item
    for (const item of returns) {
      const {
        date,
        product_id,
        unitCost,
        quantity,
        totalCost,
        avgCost,
        stock,
      } = item;

      await pool.execute(
        `INSERT INTO product_returns 
          (date, product_id, unit_cost, quantity, total_cost, avg_cost, stock) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [date, product_id, unitCost, quantity, totalCost, avgCost, stock],
      );

      // Update product stock in products table
      await pool.execute(
        `UPDATE products SET 
          last_cost = ?,
          avg_cost = ?
          WHERE id = ?`,
        [unitCost, avgCost, product_id],
      );
    }

    await pool.execute("COMMIT");
    res
      .status(201)
      .json({ success: true, message: "Product returns saved successfully" });
  } catch (err) {
    await pool.execute("ROLLBACK");
    console.error("Error saving product returns:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to save product returns" });
  }
});

// GET product suggestions for barcode/search
router.get("/products/suggestions", async (req, res) => {
  const { query } = req.query;

  try {
    const [products] = await pool.execute(
      `
        SELECT 
          id,
          product_name AS name,
          barcode,
          price AS unitCost,
          avg_cost AS avgCost,
          (SELECT SUM(quantity) FROM inventory WHERE product_id = products.id) AS stock
        FROM products
        WHERE product_name LIKE ? OR barcode LIKE ?
        LIMIT 10
      `,
      [`%${query}%`, `%${query}%`],
    );

    res.status(200).json({ success: true, products });
  } catch (err) {
    console.error("Error fetching product suggestions:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
