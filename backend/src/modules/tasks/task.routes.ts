import { Router } from "express";

import { createTaskController } from "./task.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

// Protect all task routes
router.use(authenticate);

router.post("/", createTaskController);

export default router;
