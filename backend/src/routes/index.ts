import { Router } from "express";
import healthRoutes from "../modules/health/health.routes.js";
import authRoutes from "../modules/auth/auth.routes.js"; // <-- Add this import
import taskRoutes from "../modules/tasks/task.routes.js";
const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes); // <-- Mount it here
router.use("/tasks", taskRoutes);

export default router;
