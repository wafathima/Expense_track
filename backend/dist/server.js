"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const expenseRoutes_1 = __importDefault(require("./routes/expenseRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const paymentMethodRoutes_1 = __importDefault(require("./routes/paymentMethodRoutes"));
const error_middleware_1 = require("./middleware/error.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/expenses", expenseRoutes_1.default);
app.use("/api/analytics", analyticsRoutes_1.default);
app.use("/api/categories", categoryRoutes_1.default);
app.use("/api/payment-methods", paymentMethodRoutes_1.default);
app.use(error_middleware_1.errorHandler);
app.get("/", (_req, res) => {
    res.json({
        message: "Expense Tracker API is running 🚀",
    });
});
app.get("/api/test-db", async (_req, res) => {
    try {
        const result = await db_1.default.query("SELECT NOW()");
        res.json({
            message: "PostgreSQL connected successfully ✅",
            time: result.rows[0].now,
        });
    }
    catch (error) {
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
