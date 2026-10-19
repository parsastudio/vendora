import "server-only";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema/tenants";
import { eq, or } from "drizzle-orm";

export async function getActiveTenant() {
  const headerList = await headers();
  const tenantDomain = headerList.get("x-tenant-domain") || "default";

  if (tenantDomain === "default") {
    return null;
  }

  const result = await db
    .select()
    .from(tenants)
    .where(or(eq(tenants.subdomain, tenantDomain), eq(tenants.customDomain, tenantDomain)))
    .limit(1);

  if (!result || result.length === 0) {
    return null;
  }

  return result[0];
}
