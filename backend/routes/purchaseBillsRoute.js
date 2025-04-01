import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// Change this route to include /api prefix
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        DATE_FORMAT(date, '%Y-%m-%d') as date,
        'POS_GRN' as billType,
        id as billNo,
        supplier,
        totalCost as amount
      FROM productin 
      ORDER BY date DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching purchase bills:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;