import type { Request, Response } from "express";
import { AsyncHandler } from "../../common/errors/AsyncHandler.js";
import { AppError } from "../../common/errors/AppErrors.js";
import { uploadFile } from "./files.service.js";

export const uploadFileController = AsyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError("No file uploaded", 400);
    }

    const publicId = Array.isArray(req.params.publicId)
      ? req.params.publicId[0]
      : req.params.publicId;

    if (!publicId) {
      throw new AppError("Task publicId is required", 400);
    }

    // Construct the public URL (in production, this would be S3 bucket URL)
    const publicUrl = `/uploads/${req.file.filename}`;

    const file = await uploadFile({
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      storageKey: req.file.filename,
      publicUrl,
      taskId: publicId,
      userId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: file,
    });
  },
);
