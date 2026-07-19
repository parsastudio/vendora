import { redis } from "@/lib/redis";

interface RateLimitResult {
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
  const now = Date.now();
  const clearBefore = now - windowSeconds * 1000;
  const pipeline = redis.multi();
  pipeline.zremrangebyscore(key, 0, clearBefore);
  pipeline.zcard(key);
  pipeline.zadd(key, now, `${now}-${Math.random()}`);
  pipeline.pexpire(key, windowSeconds * 1000);
  const results = await pipeline.exec();
  if (!results) {
    return { success: false, limit, remaining: 0, reset: now + windowSeconds * 1000 };
  }
  const currentRequests = results[1][1] as number;
  const success = currentRequests < limit;
  if (!success) {
    return { success: false, limit, remaining: 0, reset: now + windowSeconds * 1000 };
  }
  return {
    success: true,
    limit,
    remaining: limit - currentRequests,
    reset: now + windowSeconds * 1000,
  };
}
