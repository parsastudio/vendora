import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/features/auth/lib/auth";
import { db } from "@/lib/db";
import { carts, cartItems } from "@/lib/db/schema/orders";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { randomUUID } from "crypto";

const syncItemValidator = z.object({
  variantId: z.string(),
  quantity: z.number().min(1),
});

const syncCartSchema = z.object({
  items: z.array(syncItemValidator),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: true });
  }

  try {
    const body = await request.json();
    const parsed = syncCartSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    const { items } = parsed.data;
    const tenantId = session.user.tenantId;
    const customerId = session.user.id;

    const cartResult = await db
      .select()
      .from(carts)
      .where(eq(carts.customerId, customerId))
      .limit(1);

    let cartId = "";
    if (cartResult.length === 0) {
      cartId = `cart-${randomUUID()}`;
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
        id: `ci-${randomUUID()}`,
        cartId,
        variantId: item.variantId,
        quantity: item.quantity,
      }));
      await db.insert(cartItems).values(itemsToInsert);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Cart sync failed" }, { status: 500 });
  }
}
