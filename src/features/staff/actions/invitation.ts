"use server";

import { db } from "@/lib/db";
import { users, usersToRoles } from "@/lib/db/schema/users";
import { redis } from "@/lib/redis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { hashPassword } from "@/features/auth/lib/auth-utils";
import crypto, { randomUUID } from "crypto";
import { logger } from "@/lib/logger";
import { withWriteProtection } from "@/features/shared/lib/write-protection";
import { eq, and } from "drizzle-orm";

export const createInvitation = withWriteProtection(async function (
  email: string,
  name: string,
  roleId: string,
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.permissions.includes("settings:write")) {
    throw new Error("Unauthorized");
  }

  const tenantId = session.user.tenantId;
  const token = crypto.randomUUID();

  try {
    await redis.set(
      `invite_token:${token}`,
      JSON.stringify({ email, name, roleId, tenantId }),
      "EX",
      86400,
    );
  } catch (error) {
    logger.error({ error, email }, "Failed to set invitation token in Redis");
    throw new Error("Temporary cache allocation failed");
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return { success: true, link: `${baseUrl}/admin/invite?token=${token}` };
});

export async function getInvitationDetails(token: string) {
  const data = await redis.get(`invite_token:${token}`);
  if (!data) {
    throw new Error("Invitation expired or invalid");
  }
  const parsed = JSON.parse(data) as { email: string; name: string; tenantId: string };
  return { email: parsed.email, name: parsed.name, tenantId: parsed.tenantId };
}

export const acceptInvitation = withWriteProtection(async function (
  token: string,
  password: string,
) {
  const data = await redis.get(`invite_token:${token}`);
  if (!data) {
    throw new Error("Invitation expired or invalid");
  }

  const { email, name, roleId, tenantId } = JSON.parse(data) as {
    email: string;
    name: string;
    roleId: string;
    tenantId: string;
  };

  const hashedPassword = await hashPassword(password);
  const userId = `user-${randomUUID()}`;

  try {
    await db.transaction(async (tx) => {
      const existingUser = await tx
        .select()
        .from(users)
        .where(and(eq(users.email, email), eq(users.tenantId, tenantId)))
        .limit(1);

      if (existingUser.length > 0) {
        throw new Error("A user already exists with this email address");
      }

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
  } catch (error) {
    logger.error({ error, email }, "Database transaction failed during invitation acceptance");
    throw new Error(error instanceof Error ? error.message : "Failed to process transaction");
  }

  try {
    await redis.del(`invite_token:${token}`);
  } catch (error) {
    logger.error({ error, token }, "Failed to clear invitation token from Redis");
  }

  return { success: true };
});
