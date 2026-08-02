import { randomBytes } from "node:crypto";
import prisma from "../../config/prisma.js";
import { AppError } from "../../common/errors/AppErrors.js";

interface UploadFileInput {
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string; // The generated filename on disk
  publicUrl: string; // The URL to access it
  taskId: string;
  userId: string;
}

export const uploadFile = async (data: UploadFileInput) => {
  // Verify task exists and belongs to user
  const task = await prisma.task.findFirst({
    where: { publicId: data.taskId, ownerId: data.userId, isDeleted: false },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  const publicId = "FILE-" + randomBytes(3).toString("hex").toUpperCase();

  const file = await prisma.file.create({
    data: {
      publicId,
      originalName: data.originalName,
      storageKey: data.storageKey,
      publicUrl: data.publicUrl,
      mimeType: data.mimeType,
      size: BigInt(data.size),
      uploadedById: data.userId,
      taskId: task.id,
    },
  });

  // Convert BigInt to string for JSON response
  return {
    ...file,
    size: file.size.toString(),
  };
};
