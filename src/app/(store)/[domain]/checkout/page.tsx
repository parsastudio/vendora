import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema/tenants";
import { eq } from "drizzle-orm";
import { CheckoutForm } from "@/features/checkout/components/checkout-form";

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
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center pb-10 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Secure Checkout
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Fill in your delivery options to complete your purchase with {tenant.name}.
        </p>
      </div>
      <CheckoutForm tenantId={tenant.id} domain={tenant.subdomain} />
    </div>
  );
}
