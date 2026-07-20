import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, transactions, discounts, shippingRates } from "@/lib/db/schema/orders";
import { inventory, productVariants } from "@/lib/db/schema/products";
import { auditLogs } from "@/lib/db/schema/workflows";
import { checkoutSchema } from "@/features/checkout/validation/checkout";
import { calculateCartTotals } from "@/features/cart/utils/cart-math";
import { workflowEmitter } from "@/features/workflows/lib/event-emitter";
import { eq, and, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = checkoutSchema.parse(body);
    const variantIds = validated.items.map((i) => i.variantId);

    const result = await db.transaction(async (tx) => {
      const dbVariants = await tx
        .select()
        .from(productVariants)
        .where(inArray(productVariants.id, variantIds));

      const dbInventory = await tx
        .select()
        .from(inventory)
        .where(inArray(inventory.variantId, variantIds))
        .for("update");

      const validatedItems = [];
      for (const item of validated.items) {
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

        let remainingDeduction = item.quantity;
        const matchedInvs = dbInventory.filter((inv) => inv.variantId === item.variantId);

        for (const inv of matchedInvs) {
          if (remainingDeduction <= 0) break;
          const deduct = Math.min(inv.quantity, remainingDeduction);
          await tx
            .update(inventory)
            .set({ quantity: inv.quantity - deduct, updatedAt: new Date() })
            .where(eq(inventory.id, inv.id));

          await tx.insert(auditLogs).values({
            id: `log-${randomUUID()}`,
            tenantId: validated.tenantId,
            userId: null,
            action: "inventory.deduct",
            details: {
              variantId: [item.variantId],
              warehouseId: [inv.warehouseId],
              deductedAmount: [deduct.toString()],
              orderId: [orderId],
            },
            ipAddress: "127.0.0.1",
          });

          remainingDeduction -= deduct;
        }
      }

      if (couponId) {
        const updatedCoupon = await tx
          .select({ usageCount: discounts.usageCount })
          .from(discounts)
          .where(eq(discounts.id, couponId))
          .limit(1);

        const count = updatedCoupon[0]?.usageCount || 0;
        await tx
          .update(discounts)
          .set({ usageCount: count + 1 })
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

      return { orderId, totalAmount: calculation.total };
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
