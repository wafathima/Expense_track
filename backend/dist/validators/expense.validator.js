"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExpenseSchema = exports.createExpenseSchema = void 0;
const zod_1 = require("zod");
exports.createExpenseSchema = zod_1.z.object({
    user_id: zod_1.z.number().int().positive(),
    category_id: zod_1.z.number().int().positive(),
    payment_method_id: zod_1.z.number().int().positive(),
    title: zod_1.z.string().min(1, "Title is required").max(200),
    description: zod_1.z.string().optional().default(""),
    amount: zod_1.z.number().positive("Amount must be greater than 0"),
    expense_date: zod_1.z.string().datetime().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});
exports.updateExpenseSchema = exports.createExpenseSchema.partial();
