import { randomBytes } from "node:crypto";
import prisma from "../../config/prisma.js";
import { AppError } from "../../common/errors/AppErrors.js";

interface UploadFileInput {
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  publicUrl: string;
  taskId: string;
  userId: string;
}

export const uploadFiles = async (data: UploadFileInput[]) => {
  if (data.length === 0) {
    throw new AppError("No files provided", 400);
  }

  // Safely extract the first element to satisfy noUncheckedIndexedAccess
  const firstFile = data[0];
  if (!firstFile) {
    throw new AppError("Invalid file data", 400);
  }

  const taskPublicId = firstFile.taskId;
  const userId = firstFile.userId;

  const task = await prisma.task.findFirst({
    where: { publicId: taskPublicId, ownerId: userId, isDeleted: false },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  const createdFiles = await Promise.all(
    data.map(async (file) => {
      const publicId = "FILE-" + randomBytes(3).toString("hex").toUpperCase();

      const createdFile = await prisma.file.create({
        data: {
          publicId,
          originalName: file.originalName,
          storageKey: file.storageKey,
          publicUrl: file.publicUrl,
          mimeType: file.mimeType,
          size: BigInt(file.size),
          uploadedById: userId,
          taskId: task.id,
        },
      });

      return {
        ...createdFile,
        size: createdFile.size.toString(),
      };
    }),
  );

  return createdFiles;
};
