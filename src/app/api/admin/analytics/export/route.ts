import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema/orders";
import { eq } from "drizzle-orm";

function escapeCsvField(val: string): string {
  let escaped = val.replace(/"/g, '""');
  if (
    escaped.startsWith("=") ||
    escaped.startsWith("+") ||
    escaped.startsWith("-") ||
    escaped.startsWith("@")
  ) {
    escaped = `'${escaped}`;
  }
  return `"${escaped}"`;
}

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
    const escapedId = escapeCsvField(o.id);
    const escapedName = escapeCsvField(o.shippingAddress.name);
    const escapedSubtotal = escapeCsvField(o.subtotalAmount);
    const escapedDiscount = escapeCsvField(o.discountAmount);
    const escapedTax = escapeCsvField(o.taxAmount);
    const escapedTotal = escapeCsvField(o.totalAmount);
    const escapedStatus = escapeCsvField(o.status);
    const escapedPayment = escapeCsvField(o.paymentStatus);
    const escapedDate = escapeCsvField(o.createdAt.toISOString());

    csvContent += `${escapedId},${escapedName},${escapedSubtotal},${escapedDiscount},${escapedTax},${escapedTotal},${escapedStatus},${escapedPayment},${escapedDate}\n`;
  }

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="vendora-orders-report-${tenantId}.csv"`,
    },
  });
}
