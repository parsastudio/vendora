"use server";

import "server-only";
import { db } from "@/lib/db";
import { orders, orderItems, orderReturns } from "@/lib/db/schema/orders";
import { inventory } from "@/lib/db/schema/products";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function cancelOrderByCustomer(orderId: string, domain: string) {
  try {
    await db.transaction(async (tx) => {
      const orderResult = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1)
        .for("update");

      if (orderResult.length === 0) {
        throw new Error("Order not found");
      }

      const order = orderResult[0];

      if (order.status !== "pending" && order.status !== "processing") {
        throw new Error("Cannot cancel order at this stage");
      }

      const txns = await tx
        .select()
        .from(transactions)
        .where(eq(transactions.orderId, orderId));

      const wasDeducted =
        order.paymentStatus === "paid" || txns.some((t) => t.provider === "cash");

      await tx
        .update(orders)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(eq(orders.id, orderId));

      if (wasDeducted) {
        const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));

        for (const item of items) {
          if (item.variantId) {
            const invResult = await tx
              .select({ id: inventory.id, quantity: inventory.quantity })
              .from(inventory)
              .where(eq(inventory.variantId, item.variantId))
              .limit(1)
              .for("update");

            if (invResult.length > 0) {
              await tx
                .update(inventory)
                .set({
                  quantity: invResult[0].quantity + item.quantity,
                  updatedAt: new Date(),
                })
                .where(eq(inventory.id, invResult[0].id));
            }
          }
        }
      }
    });

    revalidatePath(`/${domain}/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel order",
    };
  }
}

export async function requestOrderReturn(
  orderId: string,
  variantId: string,
  reason: string,
  imageUrl: string | null,
  domain: string,
) {
  try {
    const orderResult = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

    if (orderResult.length === 0) {
      throw new Error("Order not found");
    }

    const order = orderResult[0];

    if (order.status !== "delivered") {
      throw new Error("Only delivered orders can be returned");
    }

    const verifiedItemResult = await db
      .select()
      .from(orderItems)
      .where(and(eq(orderItems.orderId, orderId), eq(orderItems.variantId, variantId)))
      .limit(1);

    if (verifiedItemResult.length === 0) {
      throw new Error("Invalid request metadata: purchased item mismatch");
    }

    const returnId = `ret-${Date.now()}`;

    await db.insert(orderReturns).values({
      id: returnId,
      orderId,
      variantId,
      reason,
      imageUrl,
      status: "pending",
    });

    revalidatePath(`/${domain}/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create return request",
    };
  }
}

export async function updateReturnRequestStatus(returnId: string, status: string, orderId: string) {
  try {
    await db.update(orderReturns).set({ status }).where(eq(orderReturns.id, returnId));

    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update status",
    };
  }
}
