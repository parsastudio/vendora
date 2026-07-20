import { redis } from "@/lib/redis";

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
  const results = await multi.exec();
  if (!results) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: now + windowSeconds,
    };
  }
  const cardResult = results[1][1];
  const count = typeof cardResult === "number" ? cardResult : 0;
  const success = count < limit;
  return {
    success,
    limit,
    remaining: Math.max(0, limit - count),
    reset: now + windowSeconds,
  };
}
