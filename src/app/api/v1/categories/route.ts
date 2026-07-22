import { NextResponse } from "next/server";
import { validateApiKey } from "@/features/api-keys/lib/auth";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema/products";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const tenantId = await validateApiKey(request);
    if (!tenantId) {
      return NextResponse.json({ error: "Invalid or expired API Key" }, { status: 401 });
    }

    const items = await db.select().from(categories).where(eq(categories.tenantId, tenantId));

    return NextResponse.json({ success: true, data: items });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
