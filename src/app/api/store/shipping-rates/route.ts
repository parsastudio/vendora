import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shippingRates } from "@/lib/db/schema/orders";
import { getActiveTenant } from "@/features/tenant/lib/tenant";
import { eq } from "drizzle-orm";

export async function GET() {
  const tenant = await getActiveTenant();
  if (!tenant) {
    return NextResponse.json({ error: "Active tenant not identified" }, { status: 404 });
  }

  try {
    const rates = await db
      .select()
      .from(shippingRates)
      .where(eq(shippingRates.tenantId, tenant.id));

    return NextResponse.json({ success: true, data: rates });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
