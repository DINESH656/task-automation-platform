import { Queue } from "bullmq";
import { redisConnection } from "../../config/redis.js";

export const taskQueue = new Queue("task-queue", {
  connection: redisConnection,
});
