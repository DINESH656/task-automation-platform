import { Router } from "express";

import { createTaskController, getTasksController } from "./task.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

// Protect all task routes
router.use(authenticate);

router.post("/", createTaskController);

router.get("/", getTasksController);

export default router;
