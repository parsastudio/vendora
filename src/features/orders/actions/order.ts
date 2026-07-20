"use server";

import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema/orders";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { workflowEmitter } from "@/features/workflows/lib/event-emitter";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, status: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), eq(orders.tenantId, session.user.tenantId)));

  const orderResult = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.tenantId, session.user.tenantId)))
    .limit(1);

  if (orderResult.length > 0) {
    const currentOrder = orderResult[0];
    await workflowEmitter.emitEvent(`order.${status}`, session.user.tenantId, {
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
  if (!session) {
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
  if (!session) {
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
