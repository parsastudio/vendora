import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { orders, orderItems, transactions, discounts } from "@/lib/db/schema/orders";
import { auditLogs } from "@/lib/db/schema/workflows";
import { workflowEmitter } from "@/features/workflows/lib/event-emitter";
import { allocateInventory } from "@/features/inventory/services/allocation";
import { eq, sql } from "drizzle-orm";
import Stripe from "stripe";
import { StripePaymentSessionData } from "@/features/checkout/types/stripe";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing signature", { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new NextResponse("Webhook secret is not configured", { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook signature verification failed";
    return new NextResponse(message, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as unknown as StripePaymentSessionData;
    const { orderId, tenantId, couponId } = session.metadata;

    if (orderId && tenantId) {
      const existingTx = await db
        .select()
        .from(transactions)
        .where(eq(transactions.referenceId, session.id))
        .limit(1);

      if (existingTx.length > 0) {
        return new NextResponse(JSON.stringify({ received: true, duplicate: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      const orderResult = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

      if (orderResult.length > 0) {
        const amount = session.amount_total ? (session.amount_total / 100).toFixed(2) : "0.00";

        await db.transaction(async (tx) => {
          const items = await tx
            .select({
              variantId: orderItems.variantId,
              quantity: orderItems.quantity,
            })
            .from(orderItems)
            .where(eq(orderItems.orderId, orderId));

          const validItems = items.filter(
            (i): i is { variantId: string; quantity: number } => i.variantId !== null,
          );

          if (validItems.length > 0) {
            await allocateInventory(tx, tenantId, orderId, validItems, true);
          }

          if (couponId) {
            await tx
              .update(discounts)
              .set({ usageCount: sql`${discounts.usageCount} + 1` })
              .where(eq(discounts.id, couponId));
          }

          await tx
            .update(orders)
            .set({
              paymentStatus: "paid",
              status: "processing",
              updatedAt: new Date(),
            })
            .where(eq(orders.id, orderId));

          await tx.insert(transactions).values({
            id: `tx-${randomUUID()}`,
            tenantId,
            orderId,
            provider: "stripe",
            referenceId: session.id,
            amount,
            status: "success",
          });

          await tx.insert(auditLogs).values({
            id: `log-${randomUUID()}`,
            tenantId,
            userId: null,
            action: "payment.stripe_success",
            details: {
              orderId,
              amount,
              sessionId: session.id,
            },
            ipAddress: "127.0.0.1",
          });
        });

        await workflowEmitter.emitEvent("order.paid", tenantId, {
          orderId,
          total: amount,
          currency: "USD",
        });
      }
    }
  }

  return new NextResponse(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
