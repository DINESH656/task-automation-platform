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

  // 1. Build dynamic where clause
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

  // 2. Build dynamic sort clause (default to createdAt)
  const validSortFields = ["createdAt", "updatedAt", "title", "status"];
  const sortField = validSortFields.includes(sort || "") ? sort : "createdAt";

  const orderBy: Prisma.TaskOrderByWithRelationInput = {
    [sortField as string]: order || "desc",
  };

  // 3. Execute findMany and count in parallel for performance
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
