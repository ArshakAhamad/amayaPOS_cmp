import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// POST /api/cart - Add a product to the cart
router.post("/cart", async (req, res) => {
  const { productId, quantity, status } = req.body;

  if (!productId || !quantity || !status) {
    return res.status(400).json({
      success: false,
      message: "Product ID, quantity, and status are required.",
    });
  }

  try {
    const [product] = await pool.execute(
      `SELECT id, product_name, price FROM products WHERE id = ?`,
      [productId]
    );

    if (product.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    const { product_name, price } = product[0];
    const [result] = await pool.execute(
      `INSERT INTO cart (product_id, product_name, price, quantity, status) VALUES (?, ?, ?, ?, ?)`,
      [productId, product_name, price, quantity, status]
    );

    if (result.affectedRows > 0) {
      res.status(201).json({
        success: true,
        message: "Product added to cart successfully.",
      });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Failed to add product to cart." });
    }
  } catch (err) {
    console.error("Error adding product to cart:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

// GET /api/vouchers/:code - Validate voucher
router.get("/vouchers/:code", async (req, res) => {
  const { code } = req.params;

  try {
    const [voucher] = await pool.execute(
      `SELECT * FROM vouchers WHERE code = ? AND status = 'Issued' AND active = 'Active'`,
      [code]
    );

    if (voucher.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found or already used",
      });
    }

    res.status(200).json({
      success: true,
      voucher: voucher[0],
    });
  } catch (err) {
    console.error("Error fetching voucher:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// PUT /api/cart/:id - Update the quantity of a product in the cart
router.put("/cart/:id", async (req, res) => {
  const { id } = req.params; // Cart item ID
  const { quantity } = req.body;

  // Validate required fields
  if (!quantity) {
    return res
      .status(400)
      .json({ success: false, message: "Quantity is required." });
  }

  try {
    // Update the quantity in the cart table
    const [result] = await pool.execute(
      `UPDATE cart 
        SET quantity = ? 
        WHERE id = ?`,
      [quantity, id]
    );

    if (result.affectedRows > 0) {
      res
        .status(200)
        .json({ success: true, message: "Cart item updated successfully." });
    } else {
      res.status(404).json({ success: false, message: "Cart item not found." });
    }
  } catch (err) {
    console.error("Error updating cart item:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

// GET /api/cart - Fetch all items in the cart
router.get("/cart", async (req, res) => {
  try {
    const [cartItems] = await pool.execute(`
        SELECT 
          id,
          product_id,
          product_name,
          price,
          quantity,
          status
        FROM cart
      `);

    if (cartItems.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No items in the cart." });
    }

    // Calculate the total for each item
    const parsedCartItems = cartItems.map((item) => ({
      ...item,
      total: item.price * item.quantity,
    }));

    res.status(200).json({
      success: true,
      cart: parsedCartItems,
    });
  } catch (err) {
    console.error("Error fetching cart items:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/payment - Process payment
router.post("/payment", async (req, res) => {
  const {
    paymentMethod,
    totalAmount,
    cartItems,
    customer = "Walk-In-Customer",
    phone = "+94757110053",
    receiptNumber = 2865,
    cash = totalAmount,
    card = 0,
    voucher_id = null,
  } = req.body;

  if (!paymentMethod || !totalAmount || !cartItems || cartItems.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Payment method, total amount, and cart items are required.",
    });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Insert payment
    const [paymentResult] = await connection.execute(
      `INSERT INTO payments (
        payment_method, 
        total_amount,
        customer,
        phone,
        receipt_number,
        cash,
        card,
        created_by,
        status,
        voucher_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        paymentMethod,
        totalAmount,
        customer,
        phone,
        receiptNumber,
        cash,
        card,
        "Admin",
        "Active",
        voucher_id,
      ]
    );

    if (paymentResult.affectedRows > 0) {
      const paymentId = paymentResult.insertId;

      // Insert payment items
      for (const item of cartItems) {
        await connection.execute(
          `INSERT INTO payment_items (
            payment_id, 
            product_id, 
            product_name, 
            price, 
            quantity
          ) VALUES (?, ?, ?, ?, ?)`,
          [paymentId, item.id, item.name, item.price, item.quantity]
        );
      }

      if (voucher_id) {
        // Verify voucher is still valid
        const [voucherCheck] = await connection.execute(
          `SELECT * FROM vouchers 
     WHERE id = ? AND status = 'Issued' AND active = 'Active'`,
          [voucher_id]
        );

        if (voucherCheck.length === 0) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            message: "Voucher is no longer valid",
          });
        }

        // Mark voucher as redeemed
        await connection.execute(
          `UPDATE vouchers 
     SET status = 'Redeemed',
         redeemed_date = NOW(),
         active = 'Inactive'
     WHERE id = ?`,
          [voucher_id]
        );
      }

      await connection.commit();
      res.status(201).json({
        success: true,
        message: "Payment processed successfully.",
      });
    } else {
      await connection.rollback();
      res
        .status(500)
        .json({ success: false, message: "Failed to process payment." });
    }
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error processing payment:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// GET /api/customers - Search customers by phone
router.get("/customers", async (req, res) => {
  const { phone } = req.query;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Phone number is required",
    });
  }

  try {
    // Use exact matching in the SQL query
    const [customers] = await pool.execute(
      "SELECT * FROM customers WHERE customer_phone = ?",
      [phone.trim()] // Trim whitespace from the search
    );

    res.status(200).json({
      success: true,
      customers,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching customers",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// GET /api/payments - Fetch all payments
router.get("/payments", async (req, res) => {
  try {
    const [payments] = await pool.query("SELECT * FROM payments");
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// POST /api/return - Process return for the cart
router.post("/returns", async (req, res) => {
  const { returnReason, cartItems } = req.body;

  // Validate required fields
  if (!returnReason || !cartItems || cartItems.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Return reason and cart items are required.",
    });
  }

  try {
    // Insert the return details into the returns table
    const [returnResult] = await pool.execute(
      `INSERT INTO returns (
          return_reason
        ) VALUES (?)`,
      [returnReason]
    );

    if (returnResult.affectedRows > 0) {
      const returnId = returnResult.insertId;

      // Insert each cart item into the return_items table
      for (const item of cartItems) {
        await pool.execute(
          `INSERT INTO return_items (
              return_id, 
              product_id, 
              product_name, 
              price, 
              quantity
            ) VALUES (?, ?, ?, ?, ?)`,
          [
            returnId,
            item.product_id,
            item.product_name,
            item.price,
            item.quantity,
          ]
        );
      }

      // Clear the cart after return
      await pool.execute("DELETE FROM cart");

      res
        .status(201)
        .json({ success: true, message: "Return processed successfully." });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Failed to process return." });
    }
  } catch (err) {
    console.error("Error processing return:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

// GET /api/receipt/:id - Fetch a specific receipt by ID
router.put("/payments/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;

    // First verify the receipt exists
    const [receipt] = await pool.execute(
      "SELECT id FROM payments WHERE id = ?",
      [id]
    );

    if (receipt.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    // Update status to Inactive
    const [result] = await pool.execute(
      'UPDATE payments SET status = "Inactive" WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "Receipt could not be cancelled",
      });
    }

    res.json({
      success: true,
      message: "Receipt cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling receipt:", error);
    res.status(500).json({
      success: false,
      message: "Server error while cancelling receipt",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

//------------------------------------------------POS Reorders-----------------------------------------------------------------------------------------------------//
// GET /api/reorders - Fetch reorder products with sale quantity for the last 30 days
router.get("/reorders", async (req, res) => {
  try {
    // Fetch products and their sale quantities for the last 30 days
    const [products] = await pool.query(`
     SELECT 
  p.id,
  p.product_name AS product,
  COALESCE(p.price, 0) AS price, -- Ensure price is never null
  p.min_quantity AS minimumStock,
  COALESCE(p.last_cost, 0) AS lastPurchasedPrice, -- Ensure lastPurchasedPrice is never null
  COALESCE(SUM(pi.quantity), 0) AS saleQtyLast30Days,
  p.min_quantity - COALESCE(SUM(pi.quantity), 0) AS currentStock
FROM products p
LEFT JOIN payment_items pi ON p.id = pi.product_id
LEFT JOIN payments pm ON pi.payment_id = pm.id
WHERE pm.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY p.id
    `);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching reorder products:", error);
    res.status(500).json({ error: "Failed to fetch reorder products" });
  }
});

//-------------------------------------------------------------POS Expenses-------------------------------------------------------------------------------------------------//
// GET /api/pos_expenses - Fetch all expenses
router.get("/pos_expenses", async (req, res) => {
  try {
    const [pos_expenses] = await pool.query("SELECT * FROM pos_expenses");
    res.status(200).json(pos_expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

// POST /api/pos_expenses - Add a new expense
router.post("/pos_expenses", async (req, res) => {
  const { date, expense, amount, createdBy } = req.body;

  // Validate required fields
  if (!date || !expense || !amount || !createdBy) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO pos_expenses (date, expense, amount, created_by) VALUES (?, ?, ?, ?)`,
      [date, expense, amount, createdBy]
    );

    if (result.affectedRows > 0) {
      res
        .status(201)
        .json({ success: true, message: "Expense added successfully." });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Failed to add expense." });
    }
  } catch (error) {
    console.error("Error adding expense:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// DELETE /api/pos_expenses/:id - Delete an expense
router.delete("/pos_expenses/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query("DELETE FROM pos_expenses WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows > 0) {
      res
        .status(200)
        .json({ success: true, message: "Expense deleted successfully." });
    } else {
      res.status(404).json({ success: false, message: "Expense not found." });
    }
  } catch (error) {
    console.error("Error deleting expense:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

export default router;
