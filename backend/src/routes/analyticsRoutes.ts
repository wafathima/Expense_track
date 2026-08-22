// backend/src/routes/analyticsRoutes.ts
import { Router } from "express";
import pool from "../config/db";
import { authenticate, AuthRequest } from "../middleware/auth.middleware";

const router = Router();

// ==========================================
// 🔒 ALL ROUTES REQUIRE AUTHENTICATION
// ==========================================
router.use(authenticate); // <-- ADD THIS LINE

// ==========================================
// GET EXPENSE SUMMARY
// (ONLY FOR AUTHENTICATED USER)
// ==========================================

router.get("/summary", async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id; // <-- GET USER ID

    const result = await pool.query(
      `
      SELECT
        COUNT(*) AS total_expenses,
        COALESCE(SUM(amount), 0) AS total_amount,
        COALESCE(AVG(amount), 0) AS average_amount,
        COALESCE(MAX(amount), 0) AS highest_amount
      FROM expenses
      WHERE user_id = $1; -- <-- FILTER BY USER
      `,
      [userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching expense summary:", error);
    res.status(500).json({
      message: "Failed to fetch expense summary",
    });
  }
});

// ==========================================
// GET CATEGORY BREAKDOWN
// (ONLY FOR AUTHENTICATED USER)
// ==========================================

router.get("/by-category", async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id; // <-- GET USER ID

    const result = await pool.query(
      `
      SELECT
        categories.id,
        categories.name AS category,
        categories.icon,
        categories.color,
        COUNT(expenses.id) AS expense_count,
        COALESCE(SUM(expenses.amount), 0) AS total_amount
      FROM categories
      LEFT JOIN expenses 
        ON expenses.category_id = categories.id 
        AND expenses.user_id = $1 -- <-- FILTER BY USER
      GROUP BY categories.id, categories.name, categories.icon, categories.color
      HAVING COUNT(expenses.id) > 0
      ORDER BY total_amount DESC;
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching category analytics:", error);
    res.status(500).json({
      message: "Failed to fetch category analytics",
    });
  }
});

// ==========================================
// GET ABOVE AVERAGE EXPENSES
// (ONLY FOR AUTHENTICATED USER)
// ==========================================

router.get("/above-average", async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id; // <-- GET USER ID

    const result = await pool.query(
      `
      SELECT
        expenses.id,
        expenses.title,
        expenses.description,
        expenses.amount,
        expenses.expense_date,
        categories.name AS category,
        payment_methods.name AS payment_method
      FROM expenses
      JOIN categories ON expenses.category_id = categories.id
      JOIN payment_methods ON expenses.payment_method_id = payment_methods.id
      WHERE expenses.user_id = $1 -- <-- FILTER BY USER
        AND expenses.amount > (
          SELECT AVG(amount)
          FROM expenses
          WHERE user_id = $1 -- <-- USER'S OWN AVERAGE
        )
      ORDER BY expenses.amount DESC;
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching above-average expenses:", error);
    res.status(500).json({
      message: "Failed to fetch above-average expenses",
    });
  }
});

// ==========================================
// GET CATEGORY ANALYSIS
// (ONLY FOR AUTHENTICATED USER)
// ==========================================

router.get("/category-analysis", async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id; // <-- GET USER ID

    const result = await pool.query(
      `
      WITH category_totals AS (
        SELECT
          categories.id,
          categories.name AS category,
          COUNT(expenses.id) AS expense_count,
          COALESCE(SUM(expenses.amount), 0) AS total_amount
        FROM categories
        LEFT JOIN expenses 
          ON expenses.category_id = categories.id 
          AND expenses.user_id = $1 -- <-- FILTER BY USER
        GROUP BY categories.id, categories.name
      )
      SELECT
        id,
        category,
        expense_count,
        total_amount
      FROM category_totals
      WHERE expense_count > 0
      ORDER BY total_amount DESC;
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching category analysis:", error);
    res.status(500).json({
      message: "Failed to fetch category analysis",
    });
  }
});

// ==========================================
// GET EXPENSE REPORT
// (ONLY FOR AUTHENTICATED USER)
// ==========================================

router.get("/report", async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id; // <-- GET USER ID

    const result = await pool.query(
      `
      SELECT *
      FROM expense_report
      WHERE user_id = $1 -- <-- FILTER BY USER
      ORDER BY expense_date DESC;
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching expense report:", error);
    res.status(500).json({
      message: "Failed to fetch expense report",
    });
  }
});

// ==========================================
// GET MONTHLY SPENDING
// (ONLY FOR AUTHENTICATED USER)
// ==========================================

router.get("/monthly", async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id; // <-- GET USER ID

    const result = await pool.query(
      `
      SELECT 
        DATE_TRUNC('month', expense_date) AS month,
        COUNT(*) AS total_expenses,
        COALESCE(SUM(amount), 0) AS total_amount,
        COALESCE(AVG(amount), 0) AS average_amount
      FROM expenses
      WHERE user_id = $1 -- <-- FILTER BY USER
      GROUP BY DATE_TRUNC('month', expense_date)
      ORDER BY month DESC
      LIMIT 12;
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching monthly spending:", error);
    res.status(500).json({
      message: "Failed to fetch monthly spending",
    });
  }
});

// ==========================================
// GET EXPENSE DETAILS
// (MUST BELONG TO AUTHENTICATED USER)
// ==========================================

router.get("/expense-details/:id", async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id; // <-- GET USER ID
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        e.*,
        u.name AS user_name,
        c.name AS category_name,
        c.icon AS category_icon,
        c.color AS category_color,
        pm.name AS payment_method_name
      FROM expenses e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN payment_methods pm ON e.payment_method_id = pm.id
      WHERE e.id = $1 AND e.user_id = $2; -- <-- FILTER BY USER
      `,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching expense details:", error);
    res.status(500).json({
      message: "Failed to fetch expense details",
    });
  }
});

export default router;