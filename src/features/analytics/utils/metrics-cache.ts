import { redis } from "@/lib/redis";

export async function getOrSetMetricsCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 300,
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }
  const freshData = await fn();
  await redis.set(key, JSON.stringify(freshData), "EX", ttlSeconds);
  return freshData;
}
