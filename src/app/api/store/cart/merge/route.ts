import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/features/auth/lib/auth";
import { db } from "@/lib/db";
import { carts, cartItems } from "@/lib/db/schema/orders";
import { eq } from "drizzle-orm";
import { CartItem } from "@/features/cart/types/cart";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { guestItems } = body as { guestItems: CartItem[] };

    if (!guestItems || !Array.isArray(guestItems)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

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

    const finalDbItems = await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));

    return NextResponse.json({ success: true, data: finalDbItems });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Cart merging process failed" }, { status: 500 });
  }
}
