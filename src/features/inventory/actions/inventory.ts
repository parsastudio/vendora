"use server";

import "server-only";
import { db } from "@/lib/db";
import { warehouses, inventory } from "@/lib/db/schema/products";
import { auditLogs } from "@/lib/db/schema/workflows";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function createWarehouse(name: string, location: string | null) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const tenantId = session.user.tenantId;

  await db.insert(warehouses).values({
    id: `wh-${randomUUID()}`,
    tenantId,
    name,
    location,
  });

  revalidatePath("/admin/inventory");
  return { success: true };
}

export async function updateStock(variantId: string, warehouseId: string, quantity: number) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const tenantId = session.user.tenantId;

  await db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(inventory)
      .where(and(eq(inventory.variantId, variantId), eq(inventory.warehouseId, warehouseId)))
      .limit(1)
      .for("update");

    let oldQty = 0;

    if (existing.length > 0) {
      oldQty = existing[0].quantity;
      await tx
        .update(inventory)
        .set({ quantity, updatedAt: new Date() })
        .where(eq(inventory.id, existing[0].id));
    } else {
      await tx.insert(inventory).values({
        id: `inv-${randomUUID()}`,
        variantId,
        warehouseId,
        quantity,
      });
    }

    await tx.insert(auditLogs).values({
      id: `log-${randomUUID()}`,
      tenantId,
      userId: session.user.id,
      action: "inventory.update",
      details: {
        variantId: [variantId],
        warehouseId: [warehouseId],
        previousQuantity: [oldQty.toString()],
        newQuantity: [quantity.toString()],
      },
      ipAddress: "127.0.0.1",
    });
  });

  revalidatePath("/admin/inventory");
  return { success: true };
}
