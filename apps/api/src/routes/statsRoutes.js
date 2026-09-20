import { Router } from "express";
import * as statsController from "../controllers/statsController.js";
import { protect } from "../middelware/auth.js";

const router = Router();

router.use(protect);

router.get("/overview", statsController.getOverviewStats);

export default router;
