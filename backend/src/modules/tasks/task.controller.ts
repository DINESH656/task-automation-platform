import { z } from "zod";
import type { Request, Response } from "express";

import { AsyncHandler } from "../../common/errors/AsyncHandler.js";
import { createTask } from "./task.service.js";

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
  }
);