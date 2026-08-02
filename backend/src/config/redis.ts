import {Redis} from "ioredis";
import { env } from "./env.js";

// BullMQ requires maxRetriesPerRequest to be null
export const redisConnection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});
