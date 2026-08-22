// backend/src/routes/authRoutes.ts
import express from "express";
import { register, login, getCurrentUser } from "../controller/authController";
import { authenticate } from "../middleware/auth.middleware";
import { validateRegister, validateLogin } from "../validators/auth.validator";

const router = express.Router();

// ✅ These need to be defined in authController.ts
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", authenticate, getCurrentUser);

export default router;