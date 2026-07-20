import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/features/auth/lib/auth";
import { db } from "@/lib/db";
import { carts, cartItems } from "@/lib/db/schema/orders";
import { productVariants, products } from "@/lib/db/schema/products";
import { eq } from "drizzle-orm";
import { z } from "zod";

const guestItemValidator = z.object({
  variantId: z.string(),
  sku: z.string(),
  name: z.string(),
  price: z.string(),
  quantity: z.number().min(1),
  attributes: z.record(z.string(), z.string()),
});

const mergeCartSchema = z.object({
  guestItems: z.array(guestItemValidator),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = mergeCartSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    const { guestItems } = parsed.data;
    const tenantId = session.user.tenantId;
    const customerId = session.user.id;

    const cartResult = await db
      .select()
      .from(carts)
      .where(eq(carts.customerId, customerId))
      .limit(1);

    let cartId = "";
    if (cartResult.length === 0) {
      cartId = `cart-${Date.now()}`;
      await db.insert(carts).values({
        id: cartId,
        tenantId,
        customerId,
      });
    } else {
      cartId = cartResult[0].id;
    }

    const dbItems = await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));

    for (const guestItem of guestItems) {
      const matched = dbItems.find((di) => di.variantId === guestItem.variantId);
      if (matched) {
        await db
          .update(cartItems)
          .set({
            quantity: matched.quantity + guestItem.quantity,
            updatedAt: new Date(),
          })
          .where(eq(cartItems.id, matched.id));
      } else {
        await db.insert(cartItems).values({
          id: `ci-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          cartId,
          variantId: guestItem.variantId,
          quantity: guestItem.quantity,
        });
      }
    }

    const finalDbItems = await db
      .select({
        variantId: cartItems.variantId,
        quantity: cartItems.quantity,
        sku: productVariants.sku,
        price: productVariants.price,
        attributes: productVariants.attributes,
        name: products.name,
      })
      .from(cartItems)
      .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
      .innerJoin(products, eq(productVariants.productId, products.id))
      .where(eq(cartItems.cartId, cartId));

    return NextResponse.json({ success: true, data: finalDbItems });
  } catch {
    return NextResponse.json({ error: "Cart merging process failed" }, { status: 500 });
  }
}
