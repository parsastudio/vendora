import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema/orders";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const tenantId = session.user.tenantId;
  const orderList = await db.select().from(orders).where(eq(orders.tenantId, tenantId));

  let csvContent =
    "Order ID,Customer Name,Subtotal,Discount,Tax,Total,Order Status,Payment Status,Created Date\n";

  for (const o of orderList) {
    const clientName = o.shippingAddress.name.replace(/,/g, " ");
    csvContent += `${o.id},${clientName},${o.subtotalAmount},${o.discountAmount},${o.taxAmount},${o.totalAmount},${o.status},${o.paymentStatus},${o.createdAt.toISOString()}\n`;
  }

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="vendora-orders-report-${tenantId}.csv"`,
    },
  });
}
