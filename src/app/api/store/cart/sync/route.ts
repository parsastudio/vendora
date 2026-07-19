import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { carts, cartItems } from "@/lib/db/schema/orders";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: true });
  }

  try {
    const body = await request.json();
    const { items } = body as { items: { variantId: string; quantity: number }[] };

    if (!items || !Array.isArray(items)) {
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

    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));

    if (items.length > 0) {
      const itemsToInsert = items.map((item) => ({
        id: `ci-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        cartId,
        variantId: item.variantId,
        quantity: item.quantity,
      }));
      await db.insert(cartItems).values(itemsToInsert);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Cart sync failed" }, { status: 500 });
  }
}
