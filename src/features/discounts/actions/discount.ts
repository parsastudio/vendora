"use server";

import "server-only";
import { db } from "@/lib/db";
import { discounts } from "@/lib/db/schema/orders";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { withWriteProtection } from "@/features/shared/lib/write-protection";

export const createDiscount = withWriteProtection(async function (
  code: string,
  type: "percentage" | "fixed",
  value: string,
  minPurchaseAmount: string | null,
  usageLimit: number | null,
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.permissions.includes("settings:write")) {
    throw new Error("Unauthorized");
  }

  const parsedValue = parseFloat(value);
  if (isNaN(parsedValue) || parsedValue <= 0) {
    throw new Error("Discount value must be a positive number");
  }

  if (type === "percentage" && parsedValue > 100) {
    throw new Error("Percentage discount cannot exceed 100%");
  }

  const tenantId = session.user.tenantId;
  const sanitizedCode = code
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]/g, "");

  if (!sanitizedCode) {
    throw new Error("Discount code must contain alphanumeric characters only");
  }

  try {
    await db.insert(discounts).values({
      id: `disc-${randomUUID()}`,
      tenantId,
      code: sanitizedCode,
      type,
      value: parsedValue.toFixed(2),
      minPurchaseAmount: minPurchaseAmount ? parseFloat(minPurchaseAmount).toFixed(2) : null,
      usageLimit,
      usageCount: 0,
    });
  } catch (error: unknown) {
    const errorString = error instanceof Error ? error.message : "";
    if (errorString.includes("unique") || errorString.includes("duplicate")) {
      throw new Error("This discount promo code is already registered in the system");
    }
    throw new Error("Failed to configure coupon settings");
  }

  revalidatePath("/admin/discounts");
  return { success: true };
});

export const deleteDiscount = withWriteProtection(async function (id: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.permissions.includes("settings:write")) {
    throw new Error("Unauthorized");
  }

  const tenantId = session.user.tenantId;

  await db.delete(discounts).where(and(eq(discounts.id, id), eq(discounts.tenantId, tenantId)));

  revalidatePath("/admin/discounts");
  return { success: true };
});
