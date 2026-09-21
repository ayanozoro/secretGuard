import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { protect } from "../middelware/auth.js";
import { validate, validateRegister, validateLogin } from "../middelware/validator.js";

const router = Router();

router.post("/register", validate(validateRegister), authController.register);
router.post("/login", validate(validateLogin), authController.login);
router.get("/me", protect, authController.getMe);
router.post("/api-key", protect, authController.rotateApiKey);

export default router;
