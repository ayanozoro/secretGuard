import { Router } from "express";
import * as repositoryController from "../controllers/repositoryController.js";
import { protect, roleBasedAuth } from "../middelware/auth.js";
import { validateObjectIdParam } from "../middelware/validator.js";

const router = Router();

router.use(protect);

router.post("/", repositoryController.createRepository);
router.get("/", repositoryController.listRepositories);
router.get("/:id", validateObjectIdParam("id"), repositoryController.getRepositoryById);
router.delete("/:id", validateObjectIdParam("id"), roleBasedAuth(["ADMIN", "SECURITY_ENGINEER"]), repositoryController.deleteRepository);

export default router;
