import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema/tenants";
import { eq } from "drizzle-orm";
import { formatCurrency } from "@/lib/utils/format";

interface CartPageProps {
  params: Promise<{ domain: string }>;
}

export default async function CartPage({ params }: CartPageProps) {
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
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="border-b border-zinc-200 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Shopping Cart
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Review your chosen items from {tenant.name} before checking out.
        </p>
      </div>

      <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
        <section className="lg:col-span-7">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-center text-sm text-zinc-500 py-12">
              Your cart options are loading dynamically in the client drawer.
            </p>
          </div>
        </section>

        <section className="mt-16 rounded-lg border border-zinc-200 bg-white px-4 py-6 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6 lg:col-span-5 lg:mt-0">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Order summary</h2>
          <div className="mt-6 space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-zinc-950 dark:text-zinc-50">
                {formatCurrency(0)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-200 pt-4">
              <span>Shipping estimate</span>
              <span className="font-medium text-zinc-950 dark:text-zinc-50">
                {formatCurrency(0)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-200 pt-4 text-base font-bold text-zinc-900 dark:text-zinc-50">
              <span>Order total</span>
              <span>{formatCurrency(0)}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
