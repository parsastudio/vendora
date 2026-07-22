import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { discounts, shippingRates } from "@/lib/db/schema/orders";
import { productVariants, inventory } from "@/lib/db/schema/products";
import { eq, and, inArray } from "drizzle-orm";
import { CartItem } from "@/features/cart/types/cart";
import { calculateCartTotals } from "@/features/cart/utils/cart-math";
import { z } from "zod";

const cartItemValidator = z.object({
  variantId: z.string(),
  sku: z.string(),
  name: z.string(),
  price: z.string(),
  quantity: z.number().min(1),
  attributes: z.record(z.string(), z.string()),
});

const cartValidateSchema = z.object({
  items: z.array(cartItemValidator),
  couponCode: z.string().nullable(),
  tenantId: z.string(),
  shippingRateId: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = cartValidateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload format" }, { status: 400 });
    }

    const { items, couponCode, tenantId, shippingRateId } = parsed.data;

    const variantIds = items.map((i) => i.variantId);
    if (variantIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: calculateCartTotals([], null, null),
      });
    }

    const dbVariants = await db
      .select()
      .from(productVariants)
      .where(inArray(productVariants.id, variantIds));

    const dbInventory = await db
      .select()
      .from(inventory)
      .where(inArray(inventory.variantId, variantIds));

    const validatedItems: CartItem[] = [];
    const stockIssues: { variantId: string; available: number }[] = [];

    for (const item of items) {
      const dbVar = dbVariants.find((v) => v.id === item.variantId);
      if (!dbVar) continue;

      const totalStock = dbInventory
        .filter((inv) => inv.variantId === item.variantId)
        .reduce((acc, curr) => acc + curr.quantity, 0);

      const resolvedQuantity = Math.min(item.quantity, totalStock);
      if (resolvedQuantity < item.quantity) {
        stockIssues.push({ variantId: item.variantId, available: totalStock });
      }

      if (resolvedQuantity > 0) {
        validatedItems.push({
          ...item,
          price: dbVar.price,
          quantity: resolvedQuantity,
        });
      }
    }

    let couponType: "percentage" | "fixed" | null = null;
    let couponValue: string | null = null;
    let couponError: string | undefined = undefined;

    if (couponCode) {
      const dbCoupon = await db
        .select()
        .from(discounts)
        .where(and(eq(discounts.tenantId, tenantId), eq(discounts.code, couponCode)))
        .limit(1);

      if (dbCoupon.length === 0) {
        couponError = "Invalid promo code.";
      } else {
        const coupon = dbCoupon[0];
        const now = new Date();
        const startValid = !coupon.startsAt || new Date(coupon.startsAt) <= now;
        const endValid = !coupon.endsAt || new Date(coupon.endsAt) >= now;
        const usageLimitValid = !coupon.usageLimit || coupon.usageCount < coupon.usageLimit;

        if (startValid && endValid && usageLimitValid) {
          couponType = coupon.type as "percentage" | "fixed";
          couponValue = coupon.value;
        } else {
          couponError = "Promo code has expired or is fully redeemed.";
        }
      }
    }

    let shippingPrice = "10.00";
    if (shippingRateId) {
      const rate = await db
        .select()
        .from(shippingRates)
        .where(eq(shippingRates.id, shippingRateId))
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

    return NextResponse.json({
      success: true,
      data: {
        calculation,
        stockIssues,
        coupon: {
          code: couponCode,
          valid: !couponError && !!couponType,
          error: couponError,
        },
      },
    });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Validation process failed" }, { status: 500 });
  }
}
