import { db } from "@/lib/db";
import { warehouses, inventory } from "@/lib/db/schema/products";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createWarehouse(name: string, location: string | null) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const tenantId = session.user.tenantId;

  await db.insert(warehouses).values({
    id: `wh-${Date.now()}`,
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

  const existing = await db
    .select()
    .from(inventory)
    .where(and(eq(inventory.variantId, variantId), eq(inventory.warehouseId, warehouseId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(inventory)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(inventory.id, existing[0].id));
  } else {
    await db.insert(inventory).values({
      id: `inv-${Date.now()}`,
      variantId,
      warehouseId,
      quantity,
    });
  }

  revalidatePath("/admin/inventory");
  return { success: true };
}
