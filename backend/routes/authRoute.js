import express from "express";
import pool from "../config/db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Enhanced authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing",
      });
    }

    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [user] = await pool.execute(
      'SELECT id, username, role FROM system_user WHERE id = ? AND status = "Active"',
      [decoded.id]
    );

    if (user.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    req.user = user[0];
    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

// POS Access Check Endpoint
router.get("/check-pos-access", authenticateUser, async (req, res) => {
  try {
    const { id, role, username } = req.user;

    // Check if user has Cashier role
    if (role === "Cashier") {
      return res.json({
        success: true,
        data: {
          hasPosAccess: true,
          role: "Cashier",
        },
      });
    }

    // For Admin users, check if they're also Sales Reps
    if (role === "Admin") {
      const [salesRep] = await pool.execute(
        `SELECT 1 FROM sales_rep 
                 WHERE user_name = ? AND status = 'Active' 
                 LIMIT 1`,
        [username]
      );

      if (salesRep.length > 0) {
        return res.json({
          success: true,
          data: {
            hasPosAccess: true,
            role: "Admin",
            isSalesRep: true,
          },
        });
      }
    }

    // If no access
    return res.status(403).json({
      success: false,
      message:
        "Access denied. Requires Cashier role or Admin with SalesRep privileges",
    });
  } catch (error) {
    console.error("POS access check error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
