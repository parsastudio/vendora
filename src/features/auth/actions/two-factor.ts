"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { generateTOTPSecret, verifyTOTPToken } from "../lib/totp";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";

export async function setupTwoFactor() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const secret = generateTOTPSecret();
  return { secret };
}

export async function activateTwoFactor(secret: string, token: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const isValid = verifyTOTPToken(secret, token);
  if (!isValid) {
    throw new Error("Invalid verification code");
  }

  try {
    await db
      .update(users)
      .set({
        twoFactorSecret: secret,
        twoFactorEnabled: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));
  } catch (error) {
    logger.error(
      { error, userId: session.user.id },
      "Failed to update 2FA configuration in database",
    );
    throw new Error("Database transaction failed");
  }

  revalidatePath("/admin/settings/security");
  return { success: true };
}

export async function disableTwoFactor() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    await db
      .update(users)
      .set({
        twoFactorSecret: null,
        twoFactorEnabled: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));
  } catch (error) {
    logger.error(
      { error, userId: session.user.id },
      "Failed to disable 2FA configuration in database",
    );
    throw new Error("Database transaction failed");
  }

  revalidatePath("/admin/settings/security");
  return { success: true };
}
