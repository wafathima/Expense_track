"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../config/db"));
const router = (0, express_1.Router)();
// GET all payment methods
router.get("/", async (_req, res) => {
    try {
        const result = await db_1.default.query(`
      SELECT id, name
      FROM payment_methods
      ORDER BY name ASC;
    `);
        res.json(result.rows);
    }
    catch (error) {
        console.error("Error fetching payment methods:", error);
        res.status(500).json({
            message: "Failed to fetch payment methods",
        });
    }
});
exports.default = router;
