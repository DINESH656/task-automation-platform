import { Worker } from "bullmq";
import { redisConnection } from "../../config/redis.js";
import prisma from "../../config/prisma.js";

export const taskWorker = new Worker(
  "task-queue",
  async (job) => {
    const { taskId } = job.data;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new Error("Task not found");

    // 1. Update to PROCESSING & save history
    await prisma.task.update({
      where: { id: taskId },
      data: { status: "PROCESSING" },
    });

    await prisma.taskHistory.create({
      data: {
        taskId,
        action: "STATUS_CHANGED",
        previousStatus: task.status,
        currentStatus: "PROCESSING",
        performedById: task.ownerId,
      },
    });

    // 2. Simulate async work (e.g., transcoding video, generating report)
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 3. Update to COMPLETED & save history
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    await prisma.taskHistory.create({
      data: {
        taskId,
        action: "STATUS_CHANGED",
        previousStatus: "PROCESSING",
        currentStatus: "COMPLETED",
        performedById: task.ownerId,
      },
    });

    return { success: true };
  },
  { connection: redisConnection },
);

// Optional: Log worker errors
taskWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed with error ${err.message}`);
});
