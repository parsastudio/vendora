import Redis from "ioredis";
import { logger } from "@/lib/logger";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

interface GlobalRedis {
  redis?: Redis;
}

const globalForRedis = global as unknown as GlobalRedis;

export const redis =
  globalForRedis.redis ??
  new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

redis.on("error", (error: Error) => {
  logger.error({ error }, "Redis connection error occurred");
});

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
