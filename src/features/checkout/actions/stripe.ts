"use server";

import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema/orders";
import { eq } from "drizzle-orm";

export async function createStripeSession(orderId: string, domain: string) {
  const orderResult = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (orderResult.length === 0) {
    throw new Error("Order not found");
  }
  const order = orderResult[0];

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Order #${order.id}`,
          },
          unit_amount: Math.round(parseFloat(order.totalAmount) * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${baseUrl}/${domain}/orders/${order.id}?status=success`,
    cancel_url: `${baseUrl}/${domain}/checkout?error=cancelled`,
    metadata: {
      orderId: order.id,
      tenantId: order.tenantId,
    },
  });

  return { url: session.url };
}
