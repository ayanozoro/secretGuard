import { Router } from "express";
import * as scanController from "../controllers/scanController.js";
import { protect } from "../middelware/auth.js";
import { validateObjectIdParam } from "../middelware/validator.js";

const router = Router();

router.use(protect);

router.post("/trigger", scanController.triggerScan);
router.get("/", scanController.listScans);
router.get("/:id", validateObjectIdParam("id"), scanController.getScanById);

export default router;
