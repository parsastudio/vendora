import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { orders, transactions } from "@/lib/db/schema/orders";
import { auditLogs } from "@/lib/db/schema/workflows";
import { workflowEmitter } from "@/features/workflows/lib/event-emitter";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Stripe from "stripe";
import { StripePaymentSessionData } from "@/features/checkout/types/stripe";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "",
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook signature verification failed";
    return new NextResponse(message, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as unknown as StripePaymentSessionData;
    const { orderId, tenantId } = session.metadata;

    if (orderId && tenantId) {
      const orderResult = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

      if (orderResult.length > 0) {
        const amount = session.amount_total ? (session.amount_total / 100).toFixed(2) : "0.00";

        await db.transaction(async (tx) => {
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
              orderId: [orderId],
              amount: [amount],
              sessionId: [session.id],
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
