import "server-only";
import Redis from "ioredis";
import { logger } from "@/lib/logger";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

interface GlobalRedis {
  redis?: Redis;
}

const globalForRedis = global as unknown as GlobalRedis;

const redisClient =
  globalForRedis.redis ??
  new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

redisClient.on("error", (error: Error) => {
  logger.error({ error }, "Redis connection error occurred");
});

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redisClient;
}

export const redis = redisClient;
