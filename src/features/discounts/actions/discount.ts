"use server";

import { db } from "@/lib/db";
import { discounts } from "@/lib/db/schema/orders";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createDiscount(
  code: string,
  type: "percentage" | "fixed",
  value: string,
  minPurchaseAmount: string | null,
  usageLimit: number | null,
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const tenantId = session.user.tenantId;

  await db.insert(discounts).values({
    id: `disc-${Date.now()}`,
    tenantId,
    code,
    type,
    value,
    minPurchaseAmount,
    usageLimit,
    usageCount: 0,
  });

  revalidatePath("/admin/discounts");
  return { success: true };
}

export async function deleteDiscount(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const tenantId = session.user.tenantId;

  await db.delete(discounts).where(and(eq(discounts.id, id), eq(discounts.tenantId, tenantId)));

  revalidatePath("/admin/discounts");
  return { success: true };
}
