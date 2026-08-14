import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db";

import expenseRoutes from "./routes/expenseRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import paymentMethodRoutes from "./routes/paymentMethodRoutes";
import { errorHandler } from "./middleware/error.middleware";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/expenses", expenseRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/payment-methods", paymentMethodRoutes);
app.use(errorHandler);

app.get("/", (_req, res) => {
  res.json({
    message: "Expense Tracker API is running 🚀",
  });
});

app.get("/api/test-db", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "PostgreSQL connected successfully ✅",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      message: "Database connection failed ❌",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});