import { redis } from "@/lib/redis";

export async function getOrSetMetricsCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 300,
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch {
    return await fn();
  }
  const freshData = await fn();
  try {
    await redis.set(key, JSON.stringify(freshData), "EX", ttlSeconds);
  } catch {}
  return freshData;
}
