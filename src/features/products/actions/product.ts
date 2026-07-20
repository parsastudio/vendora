"use server";

import "server-only";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema/products";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { withWriteProtection } from "@/features/shared/lib/write-protection";

export const deleteProduct = withWriteProtection(async function (id: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.permissions.includes("products:write")) {
    throw new Error("Unauthorized");
  }

  await db
    .update(products)
    .set({ status: "deleted", updatedAt: new Date() })
    .where(and(eq(products.id, id), eq(products.tenantId, session.user.tenantId)));

  revalidatePath("/admin/products");
  return { success: true };
});
