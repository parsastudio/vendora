import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, transactions, discounts, shippingRates } from "@/lib/db/schema/orders";
import { allocateInventory } from "@/features/inventory/services/allocation";
import { checkoutSchema } from "@/features/checkout/validation/checkout";
import { calculateCartTotals } from "@/features/cart/utils/cart-math";
import { workflowEmitter } from "@/features/workflows/lib/event-emitter";
import { eq, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = checkoutSchema.parse(body);

    const result = await db.transaction(async (tx) => {
      const validatedItems = await allocateInventory(
        tx,
        validated.tenantId,
        `ord-temp-allocation`,
        validated.items,
      );

      let couponType: "percentage" | "fixed" | null = null;
      let couponValue: string | null = null;
      let couponId: string | null = null;

      if (validated.couponCode) {
        const dbCoupon = await tx
          .select()
          .from(discounts)
          .where(
            and(
              eq(discounts.tenantId, validated.tenantId),
              eq(discounts.code, validated.couponCode),
            ),
          )
          .limit(1)
          .for("update");

        if (dbCoupon.length > 0) {
          const coupon = dbCoupon[0];
          const now = new Date();
          const startValid = !coupon.startsAt || new Date(coupon.startsAt) <= now;
          const endValid = !coupon.endsAt || new Date(coupon.endsAt) >= now;
          const usageLimitValid = !coupon.usageLimit || coupon.usageCount < coupon.usageLimit;

          if (startValid && endValid && usageLimitValid) {
            couponType = coupon.type as "percentage" | "fixed";
            couponValue = coupon.value;
            couponId = coupon.id;
          }
        }
      }

      let shippingPrice = "10.00";
      if (validated.shippingRateId) {
        const rate = await tx
          .select()
          .from(shippingRates)
          .where(eq(shippingRates.id, validated.shippingRateId))
          .limit(1);

        if (rate.length > 0) {
          shippingPrice = rate[0].price;
        }
      }

      const calculation = calculateCartTotals(
        validatedItems,
        couponType,
        couponValue,
        5,
        shippingPrice,
      );
      const orderId = `ord-${randomUUID()}`;

      await tx.insert(orders).values({
        id: orderId,
        tenantId: validated.tenantId,
        customerId: null,
        status: "pending",
        paymentStatus: "unpaid",
        shippingAddress: {
          name: validated.name,
          line1: validated.line1,
          line2: validated.line2 || undefined,
          city: validated.city,
          state: validated.state,
          postalCode: validated.postalCode,
          country: validated.country,
        },
        totalAmount: calculation.total,
        subtotalAmount: calculation.subtotal,
        discountAmount: calculation.discountAmount,
        shippingAmount: calculation.shippingAmount,
        taxAmount: calculation.taxAmount,
      });

      for (const item of validatedItems) {
        await tx.insert(orderItems).values({
          id: `oi-${randomUUID()}`,
          orderId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
        });
      }

      if (couponId && deductImmediately) {
        await tx
          .update(discounts)
          .set({ usageCount: sql`${discounts.usageCount} + 1` })
          .where(eq(discounts.id, couponId));
      }

      await tx.insert(transactions).values({
        id: `tx-${randomUUID()}`,
        tenantId: validated.tenantId,
        orderId,
        provider: validated.paymentMethod || "cash",
        referenceId: `ref-${randomUUID()}`,
        amount: calculation.total,
        status: validated.paymentMethod === "stripe" ? "pending" : "success",
      });

      return { orderId, totalAmount: calculation.total, couponId };
    });

    await workflowEmitter.emitEvent("order.created", validated.tenantId, {
      orderId: result.orderId,
      total: result.totalAmount,
      currency: "USD",
      customer: {
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
      },
    });

    if (validated.paymentMethod === "cash") {
      await workflowEmitter.emitEvent("order.paid", validated.tenantId, {
        orderId: result.orderId,
        total: result.totalAmount,
        currency: "USD",
        customer: {
          name: validated.name,
          email: validated.email,
          phone: validated.phone,
        },
      });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Order creation failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
