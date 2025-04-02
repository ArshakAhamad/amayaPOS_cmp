import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

// Logout endpoint
router.post("/logout", (req, res) => {
  try {
    // In a real application, you might want to:
    // 1. Add token to blacklist (if using JWT blacklisting)
    // 2. Clear session (if using sessions)
    // 3. Clear cookies

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error during logout",
    });
  }
});

export default router;
