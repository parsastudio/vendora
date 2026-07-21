import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { products, productVariants } from "@/lib/db/schema/products";
import { tenants } from "@/lib/db/schema/tenants";
import { eq, and, inArray } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/features/shared/utils/format";

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
      imageUrl: products.imageUrl,
    })
    .from(products)
    .where(and(eq(products.tenantId, tenant.id), eq(products.status, "active")));

  const productIds = tenantProducts.map((p) => p.id);

  const variants =
    productIds.length > 0
      ? await db
          .select()
          .from(productVariants)
          .where(inArray(productVariants.productId, productIds))
      : [];

  const productsWithPricing = tenantProducts.map((product) => {
    const productVariantsList = variants.filter((v) => v.productId === product.id);
    const prices = productVariantsList.map((v) => parseFloat(v.price));
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    const comparePrice = productVariantsList.find((v) => v.compareAtPrice)?.compareAtPrice;

    return {
      ...product,
      startingPrice: minPrice,
      compareAtPrice: comparePrice ? parseFloat(comparePrice) : null,
    };
  });

  return (
    <div className="space-y-20 pb-24">
      <div className="relative overflow-hidden bg-zinc-50 py-24 dark:bg-zinc-950/40 border-b border-zinc-200/50 dark:border-zinc-900/30">
        <div className="mx-auto max-w-7xl px-6 text-center sm:px-8 lg:px-12 space-y-6">
          <span className="inline-flex items-center rounded-full bg-zinc-900 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white dark:bg-white dark:text-zinc-950">
            Exclusive Collection
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-6xl">
            The Art of Refined Essentials
          </h1>
          <p className="mx-auto max-w-xl text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Discover a curated selection of premium catalog items crafted specifically with highest
            quality materials for {tenant.name}.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between border-b border-zinc-200/50 pb-5 dark:border-zinc-900/30">
          <h2 className="text-lg font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Featured Catalog
          </h2>
          <span className="text-xs text-zinc-400 font-medium">
            Showing {productsWithPricing.length} items
          </span>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
          {productsWithPricing.map((product) => (
            <div
              key={product.id}
              className="group relative flex flex-col rounded-2xl border border-zinc-200/60 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-zinc-300 dark:border-zinc-800/60 dark:bg-zinc-950"
            >
              <div className="aspect-square w-full overflow-hidden rounded-xl bg-zinc-50 dark:bg-zinc-900/40">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={350}
                    height={350}
                    unoptimized
                    className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-50 text-zinc-400 dark:bg-zinc-900/30">
                    No Image Available
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-1 flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 group-hover:text-zinc-800 dark:group-hover:text-zinc-200">
                    {product.name}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2">{product.description}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-baseline space-x-2">
                    {product.startingPrice !== null ? (
                      <>
                        <span className="text-xs text-zinc-400 font-medium">From</span>
                        <span className="text-sm font-extrabold text-zinc-950 dark:text-zinc-50">
                          {formatCurrency(product.startingPrice)}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-xs text-zinc-400 line-through">
                            {formatCurrency(product.compareAtPrice)}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-red-500 font-medium">Out of Stock</span>
                    )}
                  </div>

                  <Link
                    href={`/${tenantDomain}/product/${product.slug}`}
                    className="block w-full rounded-full bg-zinc-950 py-2.5 text-center text-xs font-bold text-white shadow-sm transition-all duration-300 hover:bg-zinc-850 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
