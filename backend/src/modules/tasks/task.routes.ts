import { Router } from "express";

import {
  createTaskController,
  getTasksController,
  updateTaskController,
  deleteTaskController,
  retryTaskController,
} from "./task.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

// Protect all task routes
router.use(authenticate);

router.post("/", createTaskController);

router.get("/", getTasksController);

router.patch("/:publicId", updateTaskController);
router.delete("/:publicId", deleteTaskController);

router.post("/:publicId/retry", retryTaskController);

export default router;
