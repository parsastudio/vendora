"use server";

import { redis } from "@/lib/redis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { withWriteProtection } from "@/features/shared/lib/write-protection";

export async function getActiveSessions() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const pattern = `active_session:${userId}:*`;

  let cursor = "0";
  const keys: string[] = [];

  do {
    const [nextCursor, foundKeys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
    cursor = nextCursor;
    keys.push(...foundKeys);
  } while (cursor !== "0");

  const list = [];
  for (const key of keys) {
    const val = await redis.get(key);
    if (val) {
      list.push(JSON.parse(val));
    }
  }

  return list;
}

export const revokeSession = withWriteProtection(async function (jti: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  await redis.del(`active_session:${userId}:${jti}`);
  return { success: true };
});
