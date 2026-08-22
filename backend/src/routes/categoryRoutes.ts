//categoryRoutes.ts
import { Router } from "express";
import pool from "../config/db";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name
      FROM categories
      ORDER BY name ASC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching categories:", error);

    res.status(500).json({
      message: "Failed to fetch categories",
    });
  }
});

export default router;
