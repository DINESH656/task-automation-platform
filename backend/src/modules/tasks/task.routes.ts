import { Router } from "express";

import {
  createTaskController,
  getTasksController,
  updateTaskController,
  deleteTaskController,
} from "./task.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

// Protect all task routes
router.use(authenticate);

router.post("/", createTaskController);

router.get("/", getTasksController);

router.patch("/:publicId", updateTaskController);
router.delete("/:publicId", deleteTaskController);

export default router;
