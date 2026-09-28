import { type ReactNode, type CSSProperties } from "react";
import { Metadata } from "next";
import { StoreHeader } from "@/features/tenant/components/store-header";
import { getStorefrontTenant } from "@/features/tenant/lib/resolve-tenant";

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
  const tenant = await getStorefrontTenant(resolvedParams.domain);

  return {
    title: `${tenant.name} - Vendora`,
    description: `Official store for ${tenant.name}`,
  };
}

export default async function StorefrontLayout({ children, params }: StorefrontLayoutProps) {
  const resolvedParams = await params;
  const tenant = await getStorefrontTenant(resolvedParams.domain);
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
