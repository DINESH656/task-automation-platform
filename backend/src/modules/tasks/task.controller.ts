import { z } from "zod";
import type { Request, Response } from "express";

import { AsyncHandler } from "../../common/errors/AsyncHandler.js";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from "./task.service.js";
import { AppError } from "../../common/errors/AppErrors.js";

const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().optional(),
  scheduledAt: z.string().datetime().optional(),
});

export const createTaskController = AsyncHandler(
  async (req: Request, res: Response) => {
    const data = createTaskSchema.parse(req.body);

    // Map to our service input, converting undefined to null for Prisma
    const payload = {
      title: data.title,
      description: data.description ?? null,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
    };

    const task = await createTask(req.user.id, payload);

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  },
);

const getTasksSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]).optional(),
  search: z.string().trim().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export const getTasksController = AsyncHandler(
  async (req: Request, res: Response) => {
    const parsedQuery = getTasksSchema.parse(req.query);

    const result = await getTasks({
      userId: req.user.id,
      ...parsedQuery,
    });

    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  },
);

const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().nullable().optional(),
});

export const updateTaskController = AsyncHandler(
  async (req: Request, res: Response) => {
    const publicId = Array.isArray(req.params.publicId)
      ? req.params.publicId[0]
      : req.params.publicId;

    if (!publicId) {
      throw new AppError("task publicId is required", 400);
    }

    const data = updateTaskSchema.parse(req.body);

    const task = await updateTask(req.user.id, publicId, data);

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  },
);

export const deleteTaskController = AsyncHandler(
  async (req: Request, res: Response) => {
    const publicId = Array.isArray(req.params.publicId)
      ? req.params.publicId[0]
      : req.params.publicId;

    if (!publicId) {
      throw new AppError("task publicId is required", 400);
    }

    await deleteTask(req.user.id, publicId);

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  },
);
