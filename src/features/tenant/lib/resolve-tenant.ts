import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema/tenants";
import { eq, or } from "drizzle-orm";
import { notFound } from "next/navigation";

export const getStorefrontTenant = cache(async (domain: string) => {
  const result = await db
    .select()
    .from(tenants)
    .where(or(eq(tenants.subdomain, domain), eq(tenants.customDomain, domain)))
    .limit(1);

  if (!result || result.length === 0) {
    notFound();
  }

  return result[0];
});
