import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// GET /api/daily_openings/check
router.get("/check", async (req, res) => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

  try {
    const [existing] = await pool.execute(
      "SELECT * FROM daily_openings WHERE date = ?",
      [today]
    );

    res.status(200).json({
      success: true,
      isDayStarted: existing.length > 0,
      existingOpening: existing[0] || null,
    });
  } catch (err) {
    console.error("Error checking day status:", err);
    res.status(500).json({
      success: false,
      message: "Server error checking day status",
    });
  }
});

// POST /api/daily_openings
router.post(
  "/",
  [
    // Add validation if needed
  ],
  async (req, res) => {
    const { cashInHand } = req.body;
    const today = new Date().toISOString().split("T")[0];

    try {
      // Check if already exists
      const [existing] = await pool.execute(
        "SELECT id FROM daily_openings WHERE date = ?",
        [today]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Day has already been started",
        });
      }

      // Create new opening
      const [result] = await pool.execute(
        "INSERT INTO daily_openings (date, cash_in_hand, opened_by) VALUES (?, ?, ?)",
        [today, cashInHand, "Cashier"] // Replace with actual user from session
      );

      res.status(201).json({
        success: true,
        message: "Day started successfully",
        openingId: result.insertId,
      });
    } catch (err) {
      console.error("Error starting day:", err);
      res.status(500).json({
        success: false,
        message: "Server error starting day",
      });
    }
  }
);

export default router;
