import { Router } from "express";
import { upload } from "../../config/multer.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { uploadFileController } from "./files.controller.js";

const router = Router();

// Attach a file to a specific task
router.post(
  "/tasks/:publicId/files",
  authenticate,
  upload.array("files", 10), // Multer middleware to expect a single file under 'file' key
  uploadFileController,
);

export default router;
