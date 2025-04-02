import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// Fetch all product returns with product name
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        pr.*, 
        p.product_name as product_name 
      FROM product_returns pr
      LEFT JOIN products p ON pr.product_id = p.id
      ORDER BY pr.date DESC
    `);

    res.json({
      success: true,
      returns: rows,
    });
  } catch (err) {
    console.error("Error fetching product returns:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch product returns",
    });
  }
});

// Add a new product return
router.post("/", async (req, res) => {
  const { date, product_id, unit_cost, quantity, total_cost, avg_cost, stock } =
    req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO product_returns 
      (date, product_id, unit_cost, quantity, total_cost, avg_cost, stock) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [date, product_id, unit_cost, quantity, total_cost, avg_cost, stock],
    );

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: "Product return added successfully",
    });
  } catch (err) {
    console.error("Error adding product return:", err);
    res.status(500).json({
      success: false,
      error: "Failed to add product return",
    });
  }
});

// Delete a product return
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM product_returns WHERE id = ?", [id]);
    res.json({
      success: true,
      message: "Product return deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting product return:", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete product return",
    });
  }
});

export default router;
