import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Access denied. No token provided." });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res
        .status(403)
        .json({ success: false, message: "Invalid token." });
    req.user = decoded;
    next();
  });
};

// GET user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const [user] = await pool.execute(
      "SELECT username, email FROM system_user WHERE id = ?",
      [req.user.userId],
    );

    if (user.length > 0) {
      res.json({ success: true, user: user[0] });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST (Create) user profile
router.post("/profile", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Hash the password before storing it
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.execute(
      "INSERT INTO system_user (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword],
    );

    res.status(201).json({ success: true, userId: result.insertId });
  } catch (err) {
    console.error("Error creating profile:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// UPDATE user profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    let query = "UPDATE system_user SET username = ?, email = ?";
    let params = [username, email];

    // Update password only if provided
    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      query += ", password = ?";
      params.push(hashedPassword);
    }

    query += " WHERE id = ?";
    params.push(req.user.userId);

    const [result] = await pool.execute(query, params);

    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Profile updated successfully" });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE user profile
router.delete("/profile", authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.execute(
      "DELETE FROM system_user WHERE id = ?",
      [req.user.userId],
    );

    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Profile deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (err) {
    console.error("Error deleting profile:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
