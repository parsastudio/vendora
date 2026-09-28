import { CheckoutForm } from "@/features/checkout/components/checkout-form";
import { getStorefrontTenant } from "@/features/tenant/lib/resolve-tenant";
import Link from "next/link";

interface CheckoutPageProps {
  params: Promise<{ domain: string }>;
}

export default async function StorefrontCheckoutPage({ params }: CheckoutPageProps) {
  const resolvedParams = await params;
  const tenant = await getStorefrontTenant(resolvedParams.domain);

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
      <div className="border-b border-stone-200/50 dark:border-zinc-900/30 pb-10 space-y-4">
        <nav className="flex items-center space-x-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
          <Link
            href={`/${tenant.subdomain}`}
            className="hover:text-stone-900 dark:hover:text-zinc-100"
          >
            {tenant.name}
          </Link>
          <span>/</span>
          <span className="text-stone-900 dark:text-zinc-50">Checkout</span>
        </nav>
        <h1 className="text-3xl font-black tracking-tight text-stone-950 dark:text-zinc-50 sm:text-4xl">
          Secure Checkout
        </h1>
        <p className="text-xs text-stone-400 dark:text-zinc-500 font-medium max-w-xl leading-relaxed">
          Provide your shipping details and select a secure transactional gateway to finalize your
          order with {tenant.name}.
        </p>
      </div>
      <CheckoutForm tenantId={tenant.id} domain={tenant.subdomain} />
    </div>
  );
}
