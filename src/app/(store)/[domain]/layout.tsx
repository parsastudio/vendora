import { type ReactNode, type CSSProperties } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema/tenants";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
import { StoreHeader } from "@/features/tenant/components/store-header";

interface StorefrontLayoutProps {
  children: ReactNode;
  params: Promise<{ domain: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const tenantDomain = resolvedParams.domain;

  const tenantResult = await db
    .select()
    .from(tenants)
    .where(eq(tenants.subdomain, tenantDomain))
    .limit(1);

  if (!tenantResult || tenantResult.length === 0) {
    return {
      title: "Store Not Found",
    };
  }

  const tenant = tenantResult[0];

  return {
    title: `${tenant.name} - Vendora`,
    description: `Official store for ${tenant.name}`,
  };
}

export default async function StorefrontLayout({ children, params }: StorefrontLayoutProps) {
  const resolvedParams = await params;
  const tenantDomain = resolvedParams.domain;

  const tenantResult = await db
    .select()
    .from(tenants)
    .where(eq(tenants.subdomain, tenantDomain))
    .limit(1);

  if (!tenantResult || tenantResult.length === 0) {
    notFound();
  }

  const tenant = tenantResult[0];
  const themeSettings = tenant.themeSettings;

  const customStyles = {
    "--primary": themeSettings.primaryColor,
    "--secondary": themeSettings.secondaryColor,
  } as CSSProperties;

  return (
    <div style={customStyles} className="flex-1">
      <StoreHeader tenantId={tenant.id} tenantName={tenant.name} />
      {children}
    </div>
  );
}
