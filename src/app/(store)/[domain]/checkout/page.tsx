import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema/tenants";
import { eq } from "drizzle-orm";
import { CheckoutForm } from "@/features/checkout/components/checkout-form";
import Link from "next/link";

interface CheckoutPageProps {
  params: Promise<{ domain: string }>;
}

export default async function StorefrontCheckoutPage({ params }: CheckoutPageProps) {
  const resolvedParams = await params;
  const tenantResult = await db
    .select()
    .from(tenants)
    .where(eq(tenants.subdomain, resolvedParams.domain))
    .limit(1);

  if (tenantResult.length === 0) {
    notFound();
  }

  const tenant = tenantResult[0];

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
      <div className="border-b border-zinc-200/50 dark:border-zinc-900/30 pb-10 space-y-4">
        <nav className="flex items-center space-x-2 text-xs text-zinc-400">
          <Link
            href={`/${tenant.subdomain}`}
            className="hover:text-zinc-900 dark:hover:text-zinc-150"
          >
            {tenant.name}
          </Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-50 font-semibold">Checkout</span>
        </nav>
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
          Secure Checkout
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Review your delivery details and choose a payment gateway to finalize your order with{" "}
          {tenant.name}.
        </p>
      </div>
      <CheckoutForm tenantId={tenant.id} domain={tenant.subdomain} />
    </div>
  );
}
