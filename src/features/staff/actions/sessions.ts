"use server";

import "server-only";
import { redis } from "@/lib/redis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";

export async function getActiveSessions() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const pattern = `active_session:${userId}:*`;
  const keys = await redis.keys(pattern);

  const list = [];
  for (const key of keys) {
    const val = await redis.get(key);
    if (val) {
      list.push(JSON.parse(val));
    }
  }

  return list;
}

export async function revokeSession(jti: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  await redis.del(`active_session:${userId}:${jti}`);
  return { success: true };
}
