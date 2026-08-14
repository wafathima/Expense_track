"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../config/db"));
const router = (0, express_1.Router)();
router.get("/", async (_req, res) => {
    try {
        const result = await db_1.default.query(`
      SELECT id, name
      FROM categories
      ORDER BY name ASC;
    `);
        res.json(result.rows);
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({
            message: "Failed to fetch categories",
        });
    }
});
exports.default = router;
