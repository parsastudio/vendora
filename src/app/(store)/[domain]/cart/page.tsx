import { CartPageContent } from "@/features/cart/components/cart-page-content";
import { getStorefrontTenant } from "@/features/tenant/lib/resolve-tenant";

interface CartPageProps {
  params: Promise<{ domain: string }>;
}

export default async function CartPage({ params }: CartPageProps) {
  const resolvedParams = await params;
  const tenant = await getStorefrontTenant(resolvedParams.domain);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Shopping Cart
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Review your chosen items from {tenant.name} before checking out.
        </p>
      </div>
      <CartPageContent tenantId={tenant.id} domain={tenant.subdomain} />
    </div>
  );
}
