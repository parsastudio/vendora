"use server";

import "server-only";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema/orders";
import { inventory } from "@/lib/db/schema/products";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { workflowEmitter } from "@/features/workflows/lib/event-emitter";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, status: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.permissions.includes("orders:read")) {
    throw new Error("Unauthorized");
  }

  const tenantId = session.user.tenantId;

  await db.transaction(async (tx) => {
    const orderResult = await tx
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.tenantId, tenantId)))
      .limit(1)
      .for("update");

    if (orderResult.length === 0) {
      throw new Error("Order not found");
    }

    const currentOrder = orderResult[0];

    if (currentOrder.status === "cancelled") {
      throw new Error("Cancelled orders cannot be altered");
    }

    await tx
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(orders.id, orderId), eq(orders.tenantId, tenantId)));

    if (status === "cancelled") {
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));

      for (const item of items) {
        if (item.variantId) {
          const invResult = await tx
            .select()
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

  const orderResult = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.tenantId, tenantId)))
    .limit(1);

  if (orderResult.length > 0) {
    const currentOrder = orderResult[0];
    await workflowEmitter.emitEvent(`order.${status}`, tenantId, {
      orderId,
      status,
      total: currentOrder.totalAmount,
      shippingAddress: currentOrder.shippingAddress,
    });
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { success: true };
}

export async function updateOrderPaymentStatus(orderId: string, paymentStatus: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.permissions.includes("orders:read")) {
    throw new Error("Unauthorized");
  }

  await db
    .update(orders)
    .set({ paymentStatus, updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), eq(orders.tenantId, session.user.tenantId)));

  const orderResult = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.tenantId, session.user.tenantId)))
    .limit(1);

  if (orderResult.length > 0 && paymentStatus === "paid") {
    const currentOrder = orderResult[0];
    await workflowEmitter.emitEvent("order.paid", session.user.tenantId, {
      orderId,
      total: currentOrder.totalAmount,
      paymentStatus,
    });
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { success: true };
}

export async function updateOrderTracking(orderId: string, trackingCode: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.permissions.includes("orders:read")) {
    throw new Error("Unauthorized");
  }

  await db
    .update(orders)
    .set({ trackingCode: trackingCode || null, updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), eq(orders.tenantId, session.user.tenantId)));

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { success: true };
}
