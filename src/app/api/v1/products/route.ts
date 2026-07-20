import { NextResponse } from "next/server";
import { validateApiKey } from "@/features/api-keys/lib/auth";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema/products";
import { eq, and } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const tenantId = await validateApiKey(request);
    if (!tenantId) {
      return NextResponse.json({ error: "Invalid or expired API Key" }, { status: 401 });
    }

    const items = await db
      .select()
      .from(products)
      .where(and(eq(products.tenantId, tenantId), eq(products.status, "active")));

    return NextResponse.json({ success: true, data: items });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
