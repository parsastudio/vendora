import "server-only";
import { db } from "@/lib/db";
import { productVariants, inventory } from "@/lib/db/schema/products";
import { auditLogs } from "@/lib/db/schema/workflows";
import { eq, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

interface AllocationItem {
  variantId: string;
  quantity: number;
}

interface AllocationResult {
  variantId: string;
  sku: string;
  name: string;
  price: string;
  quantity: number;
  attributes: Record<string, string>;
}

export async function allocateInventory(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  tenantId: string,
  orderId: string,
  items: AllocationItem[],
  deduct: boolean = true,
): Promise<AllocationResult[]> {
  const variantIds = items.map((i) => i.variantId);

  const dbVariants = await tx
    .select()
    .from(productVariants)
    .where(inArray(productVariants.id, variantIds));

  const dbInventory = await tx
    .select()
    .from(inventory)
    .where(inArray(inventory.variantId, variantIds))
    .for("update");

  const validatedItems: AllocationResult[] = [];

  for (const item of items) {
    const dbVar = dbVariants.find((v) => v.id === item.variantId);
    if (!dbVar) {
      throw new Error(`Variant ${item.variantId} not found`);
    }

    const matchedInvList = dbInventory.filter((inv) => inv.variantId === item.variantId);
    const totalStock = matchedInvList.reduce((acc, curr) => acc + curr.quantity, 0);

    if (totalStock < item.quantity) {
      throw new Error(`Insufficient stock for variant ${dbVar.sku}`);
    }

    validatedItems.push({
      variantId: item.variantId,
      sku: dbVar.sku,
      name: dbVar.sku,
      price: dbVar.price,
      quantity: item.quantity,
      attributes: dbVar.attributes,
    });
  }

  if (!deduct) {
    return validatedItems;
  }

  for (const item of validatedItems) {
    let remainingDeduction = item.quantity;
    const matchedInvs = dbInventory.filter((inv) => inv.variantId === item.variantId);

    for (const inv of matchedInvs) {
      if (remainingDeduction <= 0) break;
      const deductAmount = Math.min(inv.quantity, remainingDeduction);
      inv.quantity -= deductAmount;

      await tx
        .update(inventory)
        .set({ quantity: inv.quantity, updatedAt: new Date() })
        .where(eq(inventory.id, inv.id));

      await tx.insert(auditLogs).values({
        id: `log-${randomUUID()}`,
        tenantId: tenantId,
        userId: null,
        action: "inventory.deduct",
        details: {
          variantId: item.variantId,
          warehouseId: inv.warehouseId,
          deductedAmount: deductAmount,
          orderId: orderId,
        },
        ipAddress: "127.0.0.1",
      });

      remainingDeduction -= deductAmount;
    }
  }

  return validatedItems;
}
