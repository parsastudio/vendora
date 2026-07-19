"use server";

import { db } from "../../../lib/db";
import { categories } from "../../../lib/db/schema/products";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/lib/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createCategory(name: string, parentId: string | null) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const tenantId = session.user.tenantId;
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  await db.insert(categories).values({
    id: `cat-${Date.now()}`,
    tenantId,
    parentId,
    name,
    slug,
  });

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const tenantId = session.user.tenantId;

  await db.delete(categories).where(and(eq(categories.id, id), eq(categories.tenantId, tenantId)));

  revalidatePath("/admin/categories");
  return { success: true };
}
