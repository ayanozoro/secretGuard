import { Router } from "express";
import * as findingController from "../controllers/findingController.js";
import { protect } from "../middelware/auth.js";
import { validateObjectIdParam } from "../middelware/validator.js";

const router = Router();

router.use(protect);

router.get("/", findingController.listFindings);
router.get("/:id", validateObjectIdParam("id"), findingController.getFindingById);
router.patch("/:id/status", validateObjectIdParam("id"), findingController.updateFindingStatus);

export default router;
