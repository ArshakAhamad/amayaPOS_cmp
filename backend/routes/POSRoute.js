import express from 'express';
import pool from '../config/db.js'; // Import your database pool

const router = express.Router();

// POST /api/cart - Add a product to the cart
router.post('/cart', async (req, res) => {
  const { productId, quantity, status } = req.body;

  // Validate required fields
  if (!productId || !quantity || !status) {
    return res.status(400).json({ success: false, message: 'Product ID, quantity, and status are required.' });
  }

  try {
    // Fetch product details from the database
    const [product] = await pool.execute(
      `SELECT 
        id, 
        product_name, 
        price 
      FROM products 
      WHERE id = ?`,
      [productId]
    );

    if (product.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const { product_name, price } = product[0];

    // Insert the product into the cart table
    const [result] = await pool.execute(
      `INSERT INTO cart (
        product_id, 
        product_name, 
        price, 
        quantity, 
        status
      ) VALUES (?, ?, ?, ?, ?)`,
      [productId, product_name, price, quantity, status]
    );

    if (result.affectedRows > 0) {
      res.status(201).json({ success: true, message: 'Product added to cart successfully.' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to add product to cart.' });
    }
  } catch (err) {
    console.error('Error adding product to cart:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// PUT /api/cart/:id - Update the quantity of a product in the cart
router.put('/cart/:id', async (req, res) => {
    const { id } = req.params; // Cart item ID
    const { quantity } = req.body;
  
    // Validate required fields
    if (!quantity) {
      return res.status(400).json({ success: false, message: 'Quantity is required.' });
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
        res.status(200).json({ success: true, message: 'Cart item updated successfully.' });
      } else {
        res.status(404).json({ success: false, message: 'Cart item not found.' });
      }
    } catch (err) {
      console.error('Error updating cart item:', err);
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  });

// GET /api/cart - Fetch all items in the cart
router.get('/cart', async (req, res) => {
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
        return res.status(404).json({ success: false, message: 'No items in the cart.' });
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
      console.error('Error fetching cart items:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

// POST /api/payment - Process payment for the cart
router.post('/payment', async (req, res) => {
  const {
    paymentMethod,
    totalAmount,
    cartItems,
    customer = 'Walk-In-Customer', // Default value
    phone = '+94757110053', // Default value
    receiptNumber = 2865, // Default value
    cash = totalAmount, // Default value (use totalAmount if not provided)
    card = 0, // Default value
  } = req.body;

  // Validate required fields
  if (!paymentMethod || !totalAmount || !cartItems || cartItems.length === 0) {
    return res.status(400).json({ success: false, message: 'Payment method, total amount, and cart items are required.' });
  }

  let connection;
  try {
    // Get a connection from the pool
    connection = await pool.getConnection();

    // Start a database transaction
    await connection.beginTransaction();

    // Insert the payment details into the payments table
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
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [paymentMethod, totalAmount, customer, phone, receiptNumber, cash, card, 'Admin', 'Active'] // Default values for created_by and status
    );

    if (paymentResult.affectedRows > 0) {
      const paymentId = paymentResult.insertId;

      // Insert each cart item into the payment_items table
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

      // Commit the transaction
      await connection.commit();

      res.status(201).json({ success: true, message: 'Payment processed successfully.' });
    } else {
      // Rollback the transaction if payment insertion fails
      await connection.rollback();
      res.status(500).json({ success: false, message: 'Failed to process payment.' });
    }
  } catch (err) {
    // Rollback the transaction on error
    if (connection) await connection.rollback();
    console.error('Error processing payment:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  } finally {
    // Release the connection back to the pool
    if (connection) connection.release();
  }
});

// GET /api/payments - Fetch all payments
router.get('/payments', async (req, res) => {
  try {
    const [payments] = await pool.query('SELECT * FROM payments');
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

  // POST /api/return - Process return for the cart
router.post('/returns', async (req, res) => {
    const { returnReason, cartItems } = req.body;
  
    // Validate required fields
    if (!returnReason || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Return reason and cart items are required.' });
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
            [returnId, item.product_id, item.product_name, item.price, item.quantity]
          );
        }
  
        // Clear the cart after return
        await pool.execute('DELETE FROM cart');
  
        res.status(201).json({ success: true, message: 'Return processed successfully.' });
      } else {
        res.status(500).json({ success: false, message: 'Failed to process return.' });
      }
    } catch (err) {
      console.error('Error processing return:', err);
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  });

// GET /api/reorders - Fetch reorder products with sale quantity for the last 30 days
router.get('/reorders', async (req, res) => {
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
    console.error('Error fetching reorder products:', error);
    res.status(500).json({ error: 'Failed to fetch reorder products' });
  }
});


export default router;