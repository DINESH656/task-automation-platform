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

    try {
      // 2. Simulate async work
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Fake failure condition for testing: if title contains "fail"
      if (task.title.toLowerCase().includes("fail")) {
        throw new Error("Simulated processing error");
      }

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
    } catch (error) {
      // 4. Handle Failure: Update to FAILED & save history
      await prisma.task.update({
        where: { id: taskId },
        data: { status: "FAILED" },
      });

      await prisma.taskHistory.create({
        data: {
          taskId,
          action: "STATUS_CHANGED",
          previousStatus: "PROCESSING",
          currentStatus: "FAILED",
          performedById: task.ownerId,
        },
      });

      throw error; // Re-throw so BullMQ also knows it failed
    }

    return { success: true };
  },
  { connection: redisConnection },
);

taskWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed with error ${err.message}`);
});
