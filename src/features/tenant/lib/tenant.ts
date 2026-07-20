import "server-only";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema/tenants";
import { eq } from "drizzle-orm";

export async function getActiveTenant() {
  const headerList = await headers();
  const tenantDomain = headerList.get("x-tenant-domain") || "default";

  const result = await db
    .select()
    .from(tenants)
    .where(eq(tenants.subdomain, tenantDomain))
    .limit(1);

  if (!result || result.length === 0) {
    return null;
  }

  return result[0];
}
