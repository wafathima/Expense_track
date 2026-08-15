import { Router } from "express";
import pool from "../config/db";

const router = Router();

router.get("/summary", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) AS total_expenses,
        COALESCE(SUM(amount), 0) AS total_amount,
        COALESCE(AVG(amount), 0) AS average_amount,
        COALESCE(MAX(amount), 0) AS highest_amount
      FROM expenses;
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching expense summary:", error);

    res.status(500).json({
      message: "Failed to fetch expense summary",
    });
  }
});
router.get("/by-category", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        categories.id,
        categories.name AS category,
        COUNT(expenses.id) AS expense_count,
        COALESCE(SUM(expenses.amount), 0) AS total_amount
      FROM categories
      LEFT JOIN expenses
        ON expenses.category_id = categories.id
      GROUP BY categories.id, categories.name
      ORDER BY total_amount DESC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching category analytics:", error);

    res.status(500).json({
      message: "Failed to fetch category analytics",
    });
  }
});

router.get("/above-average", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        expenses.id,
        expenses.title,
        expenses.description,
        expenses.amount,
        expenses.expense_date,
        categories.name AS category,
        payment_methods.name AS payment_method
      FROM expenses

      JOIN categories
        ON expenses.category_id = categories.id

      JOIN payment_methods
        ON expenses.payment_method_id = payment_methods.id

      WHERE expenses.amount > (
        SELECT AVG(amount)
        FROM expenses
      )

      ORDER BY expenses.amount DESC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching above-average expenses:", error);

    res.status(500).json({
      message: "Failed to fetch above-average expenses",
    });
  }
});

router.get("/category-analysis", async (_req, res) => {
  try {
    const result = await pool.query(`
      WITH category_totals AS (
        SELECT
          categories.id,
          categories.name AS category,
          COUNT(expenses.id) AS expense_count,
          COALESCE(SUM(expenses.amount), 0) AS total_amount
        FROM categories
        LEFT JOIN expenses
          ON expenses.category_id = categories.id
        GROUP BY categories.id, categories.name
      )

      SELECT
        id,
        category,
        expense_count,
        total_amount
      FROM category_totals
      ORDER BY total_amount DESC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching category analysis:", error);

    res.status(500).json({
      message: "Failed to fetch category analysis",
    });
  }
});
router.get("/report", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM expense_report
      ORDER BY expense_date DESC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching expense report:", error);

    res.status(500).json({
      message: "Failed to fetch expense report",
    });
  }
});

// Monthly spending
router.get("/monthly", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE_TRUNC('month', expense_date) AS month,
        COUNT(*) AS total_expenses,
        COALESCE(SUM(amount), 0) AS total_amount,
        COALESCE(AVG(amount), 0) AS average_amount
      FROM expenses
      GROUP BY DATE_TRUNC('month', expense_date)
      ORDER BY month DESC
      LIMIT 12;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching monthly spending:", error);
    res.status(500).json({
      message: "Failed to fetch monthly spending",
    });
  }
});

// Expense details with full info
router.get("/expense-details/:id", async (req, res) => {
  try {
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
      WHERE e.id = $1;
      `,
      [id]
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