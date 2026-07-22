"use server";

import "server-only";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema/products";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { withWriteProtection } from "@/features/shared/lib/write-protection";

export const createCategory = withWriteProtection(async function (
  name: string,
  parentId: string | null,
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.permissions.includes("settings:write")) {
    throw new Error("Unauthorized");
  }

  const tenantId = session.user.tenantId;

  if (parentId) {
    const parentCheck = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, parentId), eq(categories.tenantId, tenantId)))
      .limit(1);

    if (parentCheck.length === 0) {
      throw new Error("The specified parent category does not exist");
    }
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  await db.insert(categories).values({
    id: `cat-${randomUUID()}`,
    tenantId,
    parentId,
    name,
    slug,
  });

  revalidatePath("/admin/categories");
  return { success: true };
});

export const deleteCategory = withWriteProtection(async function (id: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.permissions.includes("settings:write")) {
    throw new Error("Unauthorized");
  }

  const tenantId = session.user.tenantId;

  await db.delete(categories).where(and(eq(categories.id, id), eq(categories.tenantId, tenantId)));

  revalidatePath("/admin/categories");
  return { success: true };
});
