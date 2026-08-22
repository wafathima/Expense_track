//paymentMethodRoutes.ts
import { Router } from "express";
import pool from "../config/db";

const router = Router();

// GET all payment methods
router.get("/", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name
      FROM payment_methods
      ORDER BY name ASC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({
      message: "Failed to fetch payment methods",
    });
  }
});

export default router;

