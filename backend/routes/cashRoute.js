import express from "express";
import pool from "../config/db.js";
import authenticateToken from "../middlewares/authenticateToken.js";

const router = express.Router();

router.get("/summary", authenticateToken, async (req, res) => {
  const { date } = req.query;

  // Debug logging
  console.log(`\n[DEBUG] Request received for date: ${date}`);
  console.log(`[DEBUG] Full query params:`, req.query);

  if (!date) {
    console.error("[ERROR] No date parameter provided");
    return res.status(400).json({
      success: false,
      message: "Date parameter is required",
    });
  }

  try {
    // 1. Get all cashiers
    console.log("[DEBUG] Fetching cashiers...");
    const [cashiers] = await pool.query(
      `SELECT id, username as name FROM system_user WHERE role = 'Cashier'`
    );
    console.log(`[DEBUG] Found ${cashiers.length} cashiers:`, cashiers);

    if (cashiers.length === 0) {
      console.warn("[WARN] No cashiers found in system");
      return res.json({
        success: true,
        data: [],
        message: "No cashiers found",
      });
    }

    // 2. Get daily openings for each cashier
    console.log(`[DEBUG] Fetching openings for date: ${date}`);
    const [openings] = await pool.query(
      `SELECT opened_by, cash_in_hand 
       FROM daily_openings 
       WHERE date = ?`,
      [date]
    );
    console.log("[DEBUG] Daily openings data:", openings);

    // 3. Get payment totals grouped by cashier (updated with Admin handling)
    console.log(`[DEBUG] Fetching payment aggregates for date: ${date}`);
    const [payments] = await pool.query(
      `SELECT 
        COALESCE(created_by, 'Admin') as created_by,
        SUM(total_amount) as total_sales,
        SUM(cash) as total_cash,
        SUM(COALESCE(card, 0)) as total_card,
        COUNT(*) as transaction_count
       FROM payments 
       WHERE DATE(created_at) = ? 
         AND status = 'Active'
       GROUP BY created_by`,
      [date]
    );
    console.log("[DEBUG] Payment aggregates:", payments);

    // 4. Get total expenses for the date
    console.log("[DEBUG] Fetching expenses...");
    const [[expenses]] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total_expenses 
       FROM pos_expenses 
       WHERE date = ?`,
      [date]
    );
    console.log("[DEBUG] Expenses total:", expenses.total_expenses);

    // 5. Get voucher redemptions for the date
    console.log("[DEBUG] Fetching voucher redemptions...");
    const [[vouchers]] = await pool.query(
      `SELECT COALESCE(SUM(value), 0) as total_vouchers 
       FROM vouchers 
       WHERE DATE(redeemed_date) = ? 
         AND status = 'Redeemed'`,
      [date]
    );
    console.log("[DEBUG] Vouchers total:", vouchers.total_vouchers);

    // Combine all data with Admin-to-Cashier mapping
    console.log("\n[DEBUG] Starting data combination:");
    const result = cashiers.map((cashier) => {
      console.log(
        `\n[DEBUG] Processing cashier: ${cashier.name} (ID: ${cashier.id})`
      );

      // Special handling for Admin-created payments assigned to Cashier
      const payment = payments.find((p) => {
        const isAdminPayment =
          p.created_by === "Admin" && cashier.name === "Cashier";
        const isDirectMatch =
          p.created_by === cashier.name ||
          p.created_by === cashier.id.toString();
        const match = isAdminPayment || isDirectMatch;

        console.log(
          `[DEBUG] Checking payment record: ${p.created_by} vs cashier ${
            cashier.name
          }/${cashier.id} → ${match ? "MATCH" : "no match"}`
        );
        return match;
      }) || {
        total_sales: 0,
        total_cash: 0,
        total_card: 0,
        transaction_count: 0,
      };

      const opening = openings.find((o) => {
        const match =
          o.opened_by === cashier.name || o.opened_by === cashier.id.toString();
        console.log(
          `[DEBUG] Checking opening record: ${o.opened_by} vs cashier ${
            cashier.name
          }/${cashier.id} → ${match ? "MATCH" : "no match"}`
        );
        return match;
      }) || {
        cash_in_hand: 0,
      };

      const cashierData = {
        id: cashier.id,
        name: cashier.name,
        sale: Number(payment.total_sales) || 0,
        cash: Number(payment.total_cash) || 0,
        card: Number(payment.total_card) || 0,
        transaction_count: Number(payment.transaction_count) || 0,
        voucher: Number(vouchers.total_vouchers) || 0,
        opening_balance: Number(opening.cash_in_hand) || 0,
        expenses: Number(expenses.total_expenses) || 0,
      };

      console.log("[DEBUG] Cashier result:", cashierData);
      return cashierData;
    });

    console.log("\n[DEBUG] Final response data:", result);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("\n[ERROR] In /api/cashiers/summary:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

export default router;
