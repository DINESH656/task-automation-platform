import { Router } from "express";
import healthRoutes from "../modules/health/health.routes.js";
import authRoutes from "../modules/auth/auth.routes.js";
import taskRoutes from "../modules/tasks/task.routes.js";
import filesRoutes from "../modules/files/files.routes.js";
const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes);
router.use("/", filesRoutes);

export default router;
