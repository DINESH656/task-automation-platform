import { randomBytes } from "node:crypto";

import prisma from "../../config/prisma.js";
import { AppError } from "../../common/errors/AppErrors.js";
import { taskQueue } from "./task.queue.js"; // <-- Import the queue

interface CreateTaskInput {
  title: string;
  description: string | null;
  scheduledAt: Date | null;
}

export const createTask = async (userId: string, data: CreateTaskInput) => {
  const publicId = "TSK-" + randomBytes(3).toString("hex").toUpperCase();

  const task = await prisma.task.create({
    data: {
      publicId,
      title: data.title,
      description: data.description,
      scheduledAt: data.scheduledAt,
      ownerId: userId,
    },
  });

  // Push job to BullMQ Queue
  await taskQueue.add("process-task", {
    taskId: task.id,
  });

  return task;
};