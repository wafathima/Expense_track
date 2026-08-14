"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../config/db"));
const expense_validator_1 = require("../validators/expense.validator");
const router = (0, express_1.Router)();
// ==========================================
// GET ALL EXPENSES + SEARCH + FILTER
// ==========================================
router.get("/", async (req, res) => {
    try {
        const { search, category_id, payment_method_id, } = req.query;
        const values = [];
        const conditions = [];
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
            conditions.push(`expenses.category_id = $${values.length}`);
        }
        if (payment_method_id) {
            values.push(payment_method_id);
            conditions.push(`expenses.payment_method_id = $${values.length}`);
        }
        const whereClause = conditions.length > 0
            ? `WHERE ${conditions.join(" AND ")}`
            : "";
        const result = await db_1.default.query(`
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

      JOIN users
        ON expenses.user_id = users.id

      JOIN categories
        ON expenses.category_id = categories.id

      JOIN payment_methods
        ON expenses.payment_method_id = payment_methods.id

      ${whereClause}

      ORDER BY expenses.expense_date DESC;
      `, values);
        res.json(result.rows);
    }
    catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({
            message: "Failed to fetch expenses",
        });
    }
});
// Add this new endpoint for date range filtering
router.get("/filter-by-date", async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        if (!start_date || !end_date) {
            return res.status(400).json({
                message: "Both start_date and end_date are required",
            });
        }
        const result = await db_1.default.query(`
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
      WHERE expenses.expense_date BETWEEN $1 AND $2
      ORDER BY expenses.expense_date DESC;
      `, [start_date, end_date]);
        res.json(result.rows);
    }
    catch (error) {
        console.error("Error filtering expenses by date:", error);
        res.status(500).json({
            message: "Failed to filter expenses by date",
        });
    }
});
// ==========================================
// CREATE EXPENSE
// ==========================================
router.post("/", async (req, res) => {
    // Validate BEFORE connecting to database
    const validatedData = expense_validator_1.createExpenseSchema.safeParse(req.body);
    if (!validatedData.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: validatedData.error.flatten().fieldErrors,
        });
    }
    const { user_id, category_id, payment_method_id, title, description, amount, expense_date, } = validatedData.data;
    const client = await db_1.default.connect();
    try {
        // Start transaction
        await client.query("BEGIN");
        const result = await client.query(`
      INSERT INTO expenses (
        user_id,
        category_id,
        payment_method_id,
        title,
        description,
        amount,
        expense_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
      `, [
            user_id,
            category_id,
            payment_method_id,
            title,
            description,
            amount,
            expense_date,
        ]);
        // Save transaction
        await client.query("COMMIT");
        res.status(201).json({
            message: "Expense created successfully",
            expense: result.rows[0],
        });
    }
    catch (error) {
        // Undo transaction if something fails
        await client.query("ROLLBACK");
        console.error("Error creating expense:", error);
        res.status(500).json({
            message: "Failed to create expense",
        });
    }
    finally {
        // Return client to pool
        client.release();
    }
});
// ==========================================
// UPDATE EXPENSE
// ==========================================
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        // Validate update data
        const validatedData = expense_validator_1.updateExpenseSchema.safeParse(req.body);
        if (!validatedData.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validatedData.error.flatten().fieldErrors,
            });
        }
        const { category_id, payment_method_id, title, description, amount, expense_date, } = validatedData.data;
        const result = await db_1.default.query(`
      UPDATE expenses
      SET
        category_id = $1,
        payment_method_id = $2,
        title = $3,
        description = $4,
        amount = $5,
        expense_date = $6
      WHERE id = $7
      RETURNING *;
      `, [
            category_id,
            payment_method_id,
            title,
            description,
            amount,
            expense_date,
            id,
        ]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Expense not found",
            });
        }
        res.json({
            message: "Expense updated successfully",
            expense: result.rows[0],
        });
    }
    catch (error) {
        console.error("Error updating expense:", error);
        res.status(500).json({
            message: "Failed to update expense",
        });
    }
});
// ==========================================
// DELETE EXPENSE
// ==========================================
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.default.query(`
      DELETE FROM expenses
      WHERE id = $1
      RETURNING *;
      `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Expense not found",
            });
        }
        res.json({
            message: "Expense deleted successfully",
            expense: result.rows[0],
        });
    }
    catch (error) {
        console.error("Error deleting expense:", error);
        res.status(500).json({
            message: "Failed to delete expense",
        });
    }
});
// ==========================================
// CREATE EXPENSE + AUDIT
// TRANSACTION DEMONSTRATION
// ==========================================
router.post("/with-audit", async (req, res) => {
    // Validate before getting database connection
    const validatedData = expense_validator_1.createExpenseSchema.safeParse(req.body);
    if (!validatedData.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: validatedData.error.flatten().fieldErrors,
        });
    }
    const { user_id, category_id, payment_method_id, title, description, amount, expense_date, } = validatedData.data;
    const client = await db_1.default.connect();
    try {
        // Start transaction
        await client.query("BEGIN");
        // 1. Create expense
        const expenseResult = await client.query(`
      INSERT INTO expenses (
        user_id,
        category_id,
        payment_method_id,
        title,
        description,
        amount,
        expense_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
      `, [
            user_id,
            category_id,
            payment_method_id,
            title,
            description,
            amount,
            expense_date,
        ]);
        const expense = expenseResult.rows[0];
        // 2. Create audit record
        await client.query(`
      INSERT INTO expense_audit (
        expense_id,
        action
      )
      VALUES ($1, $2);
      `, [expense.id, "CREATE"]);
        // Everything succeeded
        await client.query("COMMIT");
        res.status(201).json({
            message: "Expense and audit created successfully",
            expense,
        });
    }
    catch (error) {
        // Something failed → undo everything
        await client.query("ROLLBACK");
        console.error("Transaction failed:", error);
        res.status(500).json({
            message: "Transaction failed",
        });
    }
    finally {
        // Return connection to pool
        client.release();
    }
});
exports.default = router;
