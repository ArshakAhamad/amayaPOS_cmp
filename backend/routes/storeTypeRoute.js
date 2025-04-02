import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// POST /api/store-types - Create a new store type
router.post("/store-types", async (req, res) => {
  const { storeTypeName, description } = req.body; // Changed from 'type' to 'storeTypeName'
  const createdBy = req.user?.id || "system";

  if (!storeTypeName) {
    // Changed validation from 'type' to 'storeTypeName'
    return res
      .status(400)
      .json({ success: false, message: "Store type name is required." });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO store_types (type, description, created_by) 
       VALUES (?, ?, ?)`,
      [storeTypeName, description, createdBy], // Using storeTypeName for the type field
    );

    if (result.affectedRows > 0) {
      const [newStoreType] = await pool.execute(
        `SELECT 
          id,
          type as storeTypeName, // Aliasing to match frontend
          description,
          DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as createdDate,
          created_by as createdBy,
          status
         FROM store_types WHERE id = ?`,
        [result.insertId],
      );

      res.status(201).json({
        success: true,
        message: "Store type created successfully.",
        storeType: newStoreType[0],
      });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Failed to create store type." });
    }
  } catch (err) {
    console.error("Error creating store type:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ success: false, message: "Store type already exists." });
    }
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

// GET /api/store-types - Fetch store types
router.get("/store-types", async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const offset = (page - 1) * limit;

  try {
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as totalCount FROM store_types 
       WHERE type LIKE ? OR description LIKE ?`,
      [`%${search}%`, `%${search}%`],
    );

    const totalCount = countResult[0].totalCount;

    const [storeTypes] = await pool.execute(
      `SELECT 
        id,
        type,
        description,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as createdDate,
        created_by as createdBy,
        status
       FROM store_types
       WHERE type LIKE ? OR description LIKE ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [`%${search}%`, `%${search}%`, parseInt(limit), offset],
    );

    res.status(200).json({
      success: true,
      storeTypes,
      totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error("Error fetching store types:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

// PUT /api/store-types/:id - Update a store type
router.put("/store-types/:id", async (req, res) => {
  const { id } = req.params;
  const { type, description, status } = req.body;

  if (!type || !status) {
    return res.status(400).json({
      success: false,
      message: "Type and status are required.",
    });
  }

  try {
    const [result] = await pool.execute(
      `UPDATE store_types 
       SET type = ?, description = ?, status = ?
       WHERE id = ?`,
      [type, description, status, id],
    );

    if (result.affectedRows > 0) {
      const [updatedStoreType] = await pool.execute(
        `SELECT 
          id,
          type,
          description,
          DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as createdDate,
          created_by as createdBy,
          status
         FROM store_types WHERE id = ?`,
        [id],
      );

      res.status(200).json({
        success: true,
        message: "Store type updated successfully.",
        storeType: updatedStoreType[0],
      });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Store type not found." });
    }
  } catch (err) {
    console.error("Error updating store type:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ success: false, message: "Store type already exists." });
    }
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

// PUT /api/store-types/:id/toggle-status - Toggle status
router.put("/store-types/:id/toggle-status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !["Active", "Inactive"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Valid status (Active/Inactive) is required.",
    });
  }

  try {
    const newStatus = status === "Active" ? "Inactive" : "Active";

    const [result] = await pool.execute(
      `UPDATE store_types 
       SET status = ?
       WHERE id = ?`,
      [newStatus, id],
    );

    if (result.affectedRows > 0) {
      res.status(200).json({
        success: true,
        message: "Status updated successfully.",
        newStatus,
      });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Store type not found." });
    }
  } catch (err) {
    console.error("Error toggling store type status:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

// DELETE /api/store-types/:id - Delete a store type
router.delete("/store-types/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [checkResult] = await pool.execute(
      `SELECT id FROM store_types WHERE id = ?`,
      [id],
    );

    if (checkResult.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Store type not found." });
    }

    const [result] = await pool.execute(
      `DELETE FROM store_types WHERE id = ?`,
      [id],
    );

    if (result.affectedRows > 0) {
      res.status(200).json({
        success: true,
        message: "Store type deleted successfully.",
      });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Failed to delete store type." });
    }
  } catch (err) {
    console.error("Error deleting store type:", err);
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        success: false,
        message: "Cannot delete store type as it is being used by stores.",
      });
    }
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

export default router;
