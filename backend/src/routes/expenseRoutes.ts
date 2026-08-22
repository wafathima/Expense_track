// backend/src/routes/expenseRoutes.ts
import { Router } from "express";
import pool from "../config/db";
import { authenticate, AuthRequest } from "../middleware/auth.middleware";
import {
  createExpenseSchema,
  updateExpenseSchema,
} from "../validators/expense.validator";

const router = Router();

// ==========================================
// 🔒 ALL ROUTES REQUIRE AUTHENTICATION
// ==========================================
router.use(authenticate); 

// ==========================================
// GET ALL EXPENSES + SEARCH + FILTER
// ==========================================

router.get("/", async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id; // <-- GET USER ID FROM AUTH
    
    const {
      search,
      category_id,
      payment_method_id,
    } = req.query;

    const values: unknown[] = [userId]; // <-- FIRST PARAMETER IS USER ID
    const conditions: string[] = ["expenses.user_id = $1"]; // <-- ALWAYS FILTER BY USER

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`
        (
          expenses.title ILIKE $${values.length}
          OR expenses.description ILIKE $${values.length}
        )
      `);
    }

    if (category_id) {
      values.push(category_id);
      conditions.push(
        `expenses.category_id = $${values.length}`
      );
    }

    if (payment_method_id) {
      values.push(payment_method_id);
      conditions.push(
        `expenses.payment_method_id = $${values.length}`
      );
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const result = await pool.query(
      `
      SELECT
        expenses.id,
        expenses.user_id,
        expenses.category_id,
        expenses.payment_method_id,
        users.name AS user_name,
        expenses.title,
        expenses.description,
        categories.name AS category,
        payment_methods.name AS payment_method,
        expenses.amount,
        expenses.expense_date
      FROM expenses
      JOIN users ON expenses.user_id = users.id
      JOIN categories ON expenses.category_id = categories.id
      JOIN payment_methods ON expenses.payment_method_id = payment_methods.id
      ${whereClause}
      ORDER BY expenses.expense_date DESC;
      `,
      values
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({
      message: "Failed to fetch expenses",
    });
  }
});

// ==========================================
// GET EXPENSES BY DATE RANGE
// (ONLY FOR THE AUTHENTICATED USER)
// ==========================================

router.get("/filter-by-date", async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id; // <-- GET USER ID
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        message: "Both start_date and end_date are required",
      });
    }

    const result = await pool.query(
      `
      SELECT
        expenses.id,
        expenses.user_id,
        expenses.category_id,
        expenses.payment_method_id,
        users.name AS user_name,
        expenses.title,
        expenses.description,
        categories.name AS category,
        payment_methods.name AS payment_method,
        expenses.amount,
        expenses.expense_date
      FROM expenses
      JOIN users ON expenses.user_id = users.id
      JOIN categories ON expenses.category_id = categories.id
      JOIN payment_methods ON expenses.payment_method_id = payment_methods.id
      WHERE expenses.user_id = $1 
        AND expenses.expense_date BETWEEN $2 AND $3
      ORDER BY expenses.expense_date DESC;
      `,
      [userId, start_date, end_date] // <-- FILTER BY USER
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error filtering expenses by date:", error);
    res.status(500).json({
      message: "Failed to filter expenses by date",
    });
  }
});

// ==========================================
// CREATE EXPENSE
// (AUTOMATICALLY ASSIGNED TO AUTHENTICATED USER)
// ==========================================

router.post("/", async (req: AuthRequest, res) => {
  // Validate BEFORE connecting to database
  const validatedData = createExpenseSchema.safeParse(req.body);

  if (!validatedData.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: validatedData.error.flatten().fieldErrors,
    });
  }

  // REMOVE user_id from request body - USE AUTHENTICATED USER INSTEAD
  const userId = req.user?.id; // <-- GET FROM AUTH
  const {
    category_id,
    payment_method_id,
    title,
    description,
    amount,
    expense_date,
  } = validatedData.data;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      INSERT INTO expenses (
        user_id,        -- <-- USE AUTHENTICATED USER ID
        category_id,
        payment_method_id,
        title,
        description,
        amount,
        expense_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
      `,
      [
        userId, // <-- USER ID FROM AUTH
        category_id,
        payment_method_id,
        title,
        description,
        amount,
        expense_date,
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Expense created successfully",
      expense: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating expense:", error);
    res.status(500).json({
      message: "Failed to create expense",
    });
  } finally {
    client.release();
  }
});

// ==========================================
// UPDATE EXPENSE
// (MUST BELONG TO AUTHENTICATED USER)
// ==========================================

router.put("/:id", async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id; // <-- GET USER ID
    const { id } = req.params;

    // Validate update data
    const validatedData = updateExpenseSchema.safeParse(req.body);

    if (!validatedData.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validatedData.error.flatten().fieldErrors,
      });
    }

    const {
      category_id,
      payment_method_id,
      title,
      description,
      amount,
      expense_date,
    } = validatedData.data;

    // FIRST: Check if expense exists AND belongs to user
    const checkResult = await pool.query(
      "SELECT id FROM expenses WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        message: "Expense not found or you don't have permission",
      });
    }

    // THEN: Update the expense
    const result = await pool.query(
      `
      UPDATE expenses
      SET
        category_id = $1,
        payment_method_id = $2,
        title = $3,
        description = $4,
        amount = $5,
        expense_date = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 AND user_id = $8
      RETURNING *;
      `,
      [
        category_id,
        payment_method_id,
        title,
        description,
        amount,
        expense_date,
        id,
        userId, // <-- ENSURE USER OWNS THE EXPENSE
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.json({
      message: "Expense updated successfully",
      expense: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({
      message: "Failed to update expense",
    });
  }
});

// ==========================================
// DELETE EXPENSE
// (MUST BELONG TO AUTHENTICATED USER)
// ==========================================

router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id; // <-- GET USER ID
    const { id } = req.params;

    // DELETE only if expense belongs to user
    const result = await pool.query(
      "DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId] // <-- ENSURE USER OWNS THE EXPENSE
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Expense not found or you don't have permission",
      });
    }

    res.json({
      message: "Expense deleted successfully",
      expense: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({
      message: "Failed to delete expense",
    });
  }
});

// ==========================================
// CREATE EXPENSE + AUDIT (WITH AUTH)
// ==========================================

router.post("/with-audit", async (req: AuthRequest, res) => {
  const validatedData = createExpenseSchema.safeParse(req.body);

  if (!validatedData.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: validatedData.error.flatten().fieldErrors,
    });
  }

  const userId = req.user?.id; // <-- GET FROM AUTH
  const {
    category_id,
    payment_method_id,
    title,
    description,
    amount,
    expense_date,
  } = validatedData.data;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Create expense with authenticated user
    const expenseResult = await client.query(
      `
      INSERT INTO expenses (
        user_id,        -- <-- USE AUTHENTICATED USER
        category_id,
        payment_method_id,
        title,
        description,
        amount,
        expense_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
      `,
      [
        userId, // <-- USER ID FROM AUTH
        category_id,
        payment_method_id,
        title,
        description,
        amount,
        expense_date,
      ]
    );

    const expense = expenseResult.rows[0];

    // 2. Create audit record
    await client.query(
      `
      INSERT INTO expense_audit (
        expense_id,
        action
      )
      VALUES ($1, $2);
      `,
      [expense.id, "CREATE"]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Expense and audit created successfully",
      expense,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Transaction failed:", error);
    res.status(500).json({
      message: "Transaction failed",
    });
  } finally {
    client.release();
  }
});

export default router;