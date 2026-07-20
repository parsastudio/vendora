"use server";

import { db } from "@/lib/db";
import { users, usersToRoles } from "@/lib/db/schema/users";
import { redis } from "@/lib/redis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { hashPassword } from "@/features/auth/lib/auth-utils";
import crypto from "crypto";

export async function createInvitation(email: string, name: string, roleId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.permissions.includes("settings:write")) {
    throw new Error("Unauthorized");
  }

  const tenantId = session.user.tenantId;
  const token = crypto.randomUUID();

  await redis.set(
    `invite_token:${token}`,
    JSON.stringify({ email, name, roleId, tenantId }),
    "EX",
    86400,
  );

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return { success: true, link: `${baseUrl}/admin/invite?token=${token}` };
}

export async function getInvitationDetails(token: string) {
  const data = await redis.get(`invite_token:${token}`);
  if (!data) {
    throw new Error("Invitation expired or invalid");
  }
  const parsed = JSON.parse(data);
  return { email: parsed.email, name: parsed.name, tenantId: parsed.tenantId };
}

export async function acceptInvitation(token: string, password: string) {
  const data = await redis.get(`invite_token:${token}`);
  if (!data) {
    throw new Error("Invitation expired or invalid");
  }

  const { email, name, roleId, tenantId } = JSON.parse(data);
  const hashedPassword = await hashPassword(password);
  const userId = `user-${Date.now()}`;

  await db.transaction(async (tx) => {
    await tx.insert(users).values({
      id: userId,
      tenantId,
      name,
      email,
      passwordHash: hashedPassword,
    });

    await tx.insert(usersToRoles).values({
      userId,
      roleId,
    });
  });

  await redis.del(`invite_token:${token}`);
  return { success: true };
}
