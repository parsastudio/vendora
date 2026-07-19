import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema/products";
import { tenants } from "@/lib/db/schema/tenants";
import { eq } from "drizzle-orm";
import Link from "next/link";

interface StorefrontProps {
  params: Promise<{ domain: string }>;
}

export default async function StorefrontPage({ params }: StorefrontProps) {
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

  const tenantProducts = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
    })
    .from(products)
    .where(eq(products.tenantId, tenant.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
          Welcome to {tenant.name}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-zinc-500 dark:text-zinc-400">
          Discover our premium catalog crafted specifically with highest quality materials.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        {tenantProducts.map((product) => (
          <div
            key={product.id}
            className="group relative flex flex-col rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-zinc-100 group-hover:opacity-75 lg:aspect-none lg:h-80">
              <div className="flex h-full w-full items-center justify-center bg-zinc-50 text-zinc-400 dark:bg-zinc-900">
                No Image
              </div>
            </div>
            <div className="mt-4 flex flex-1 flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  {product.name}
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {product.description}
                </p>
              </div>
              <div className="mt-4">
                <Link
                  href={`/${tenantDomain}/product/${product.slug}`}
                  className="block w-full rounded-md bg-zinc-950 px-3 py-2 text-center text-xs font-semibold text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
