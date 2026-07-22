import { redis } from "@/lib/redis";
import { logger } from "@/lib/logger";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000);
  const clearBefore = now - windowSeconds;
  const multi = redis.multi();

  multi.zremrangebyscore(key, 0, clearBefore);
  multi.zcard(key);
  multi.zadd(key, now, `${now}-${Math.random()}`);
  multi.expire(key, windowSeconds);

  try {
    const results = await multi.exec();
    if (!results) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: now + windowSeconds,
      };
    }

    const zcardResult = results[1];
    if (!zcardResult) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: now + windowSeconds,
      };
    }

    const [, cardValue] = zcardResult as [unknown, unknown];
    const count = typeof cardValue === "number" ? cardValue : 0;
    const success = count < limit;

    return {
      success,
      limit,
      remaining: Math.max(0, limit - count),
      reset: now + windowSeconds,
    };
  } catch (error: unknown) {
    logger.error({ error, key }, "Failed to execute rate limiter redis commands");
    return {
      success: true,
      limit,
      remaining: 1,
      reset: now + windowSeconds,
    };
  }
}
