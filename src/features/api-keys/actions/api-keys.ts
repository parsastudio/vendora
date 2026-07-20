"use server";

import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema/api-keys";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function generateApiKey(name: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const tenantId = session.user.tenantId;
  const secret = `vk_live_${crypto.randomBytes(24).toString("hex")}`;
  const preview = secret.slice(0, 12);
  const hash = crypto.createHash("sha256").update(secret).digest("hex");

  await db.insert(apiKeys).values({
    id: `key-${Date.now()}`,
    tenantId,
    name,
    keyHash: hash,
    preview,
  });

  revalidatePath("/admin/settings/api-keys");

  return { success: true, secret };
}

export async function revokeApiKey(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  await db
    .delete(apiKeys)
    .where(and(eq(apiKeys.id, id), eq(apiKeys.tenantId, session.user.tenantId)));

  revalidatePath("/admin/settings/api-keys");

  return { success: true };
}
