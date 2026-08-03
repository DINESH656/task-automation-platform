import { z } from "zod";
import type { Request, Response } from "express";
import { AsyncHandler } from "../../common/errors/AsyncHandler.js";
import { AppError } from "../../common/errors/AppErrors.js";
import { uploadFiles } from "./files.service.js";

const publicIdSchema = z.object({
  publicId: z.string().min(1),
});

export const uploadFileController = AsyncHandler(
  async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new AppError("No files uploaded", 400);
    }

    // 1. Validate the route parameter safely
    const { publicId } = publicIdSchema.parse(req.params);

    const filesData = files.map((file) => ({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      storageKey: file.filename,
      publicUrl: `/uploads/${file.filename}`,
      taskId: publicId,
      userId: req.user.id,
    }));

    const uploadedFiles = await uploadFiles(filesData);

    return res.status(201).json({
      success: true,
      message: "Files uploaded successfully",
      data: uploadedFiles,
    });
  },
);
