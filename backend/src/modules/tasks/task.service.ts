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

// Add this import at the very top if you don't have it:
import { Prisma } from "@prisma/client";

// Add to bottom of src/modules/tasks/task.service.ts

interface GetTasksInput {
  userId: string;
  page: number;
  limit: number;
  status?: string | undefined;
  search?: string | undefined;
  sort?: string | undefined;
  order?: "asc" | "desc" | undefined;
}

export const getTasks = async (data: GetTasksInput) => {
  const { userId, page, limit, status, search, sort, order } = data;

  const where: Prisma.TaskWhereInput = {
    ownerId: userId,
    isDeleted: false,
  };

  if (status) {
    where.status = status as any; // Cast to any to satisfy Prisma enum quickly
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const validSortFields = ["createdAt", "updatedAt", "title", "status"];
  const sortField = validSortFields.includes(sort || "") ? sort : "createdAt";

  const orderBy: Prisma.TaskOrderByWithRelationInput = {
    [sortField as string]: order || "desc",
  };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.task.count({ where }),
  ]);

  return {
    data: tasks,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

interface UpdateTaskInput {
  title?: string | undefined;
  description?: string | null | undefined;
}

export const updateTask = async (
  userId: string,
  publicId: string,
  data: UpdateTaskInput,
) => {
  const task = await prisma.task.findFirst({
    where: { publicId, ownerId: userId, isDeleted: false },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }
  const payload: { title?: string; description?: string | null } = {};
  if (data.title !== undefined) payload.title = data.title;
  if (data.description !== undefined) payload.description = data.description;

  const updatedTask = await prisma.task.update({
    where: { id: task.id },
    data: payload,
  });

  return updatedTask;
};

export const deleteTask = async (userId: string, publicId: string) => {
  const task = await prisma.task.findFirst({
    where: { publicId, ownerId: userId, isDeleted: false },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  // 1. Soft delete the task
  await prisma.task.update({
    where: { id: task.id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  // 2. Record in TaskHistory
  await prisma.taskHistory.create({
    data: {
      taskId: task.id,
      action: "DELETED",
      previousStatus: task.status,
      currentStatus: task.status,
      performedById: userId,
    },
  });
};

export const retryTask = async (userId: string, publicId: string) => {
  const task = await prisma.task.findFirst({
    where: { publicId, ownerId: userId, isDeleted: false },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  if (task.status !== "FAILED") {
    throw new AppError("Only failed tasks can be retried", 400);
  }

  if (task.retryCount >= task.maxRetries) {
    throw new AppError("Maximum retry limit reached", 400);
  }

  // 1. Increment retry count and reset status to PENDING
  const updatedTask = await prisma.task.update({
    where: { id: task.id },
    data: {
      status: "PENDING",
      retryCount: {
        increment: 1,
      },
      completedAt: null,
    },
  });

  // 2. Record in history
  await prisma.taskHistory.create({
    data: {
      taskId: task.id,
      action: "RETRIED",
      previousStatus: "FAILED",
      currentStatus: "PENDING",
      performedById: userId,
    },
  });

  // 3. Push back to the BullMQ queue
  await taskQueue.add("process-task", {
    taskId: task.id,
  });

  return updatedTask;
};
