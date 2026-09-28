import { db } from "@/lib/db";
import { products, productVariants } from "@/lib/db/schema/products";
import { eq, and, inArray } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/features/shared/utils/format";
import { getStorefrontTenant } from "@/features/tenant/lib/resolve-tenant";

interface StorefrontProps {
  params: Promise<{ domain: string }>;
}

export default async function StorefrontPage({ params }: StorefrontProps) {
  const resolvedParams = await params;
  const tenant = await getStorefrontTenant(resolvedParams.domain);
  const tenantDomain = tenant.subdomain;

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
    <div className="space-y-24 pb-32">
      <div className="relative overflow-hidden bg-stone-50/50 py-32 dark:bg-zinc-950/20 border-b border-stone-200/30 dark:border-zinc-900/30">
        <div className="mx-auto max-w-5xl px-6 text-center space-y-6">
          <span className="inline-flex items-center rounded-full bg-stone-950 px-3.5 py-1 text-[9px] font-black uppercase tracking-widest text-white dark:bg-white dark:text-zinc-950">
            Selected Collection
          </span>
          <h1 className="text-4xl font-black tracking-tight text-stone-950 dark:text-zinc-50 sm:text-6xl max-w-3xl mx-auto leading-none">
            The Art of Fine Living
          </h1>
          <p className="mx-auto max-w-lg text-sm text-stone-500 dark:text-zinc-400 leading-relaxed font-medium">
            Discover carefully curated and beautifully constructed catalog items engineered with
            outstanding craftsmanship for {tenant.name}.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="flex items-center justify-between border-b border-stone-200/50 pb-6 dark:border-zinc-900/30">
          <h2 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-zinc-100">
            Featured Catalogue
          </h2>
          <span className="text-xs text-stone-400 dark:text-zinc-500 font-semibold font-mono">
            {productsWithPricing.length} items
          </span>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-y-16 gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
          {productsWithPricing.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col rounded-3xl border border-stone-200/40 bg-white p-4 hover:border-stone-300 dark:border-zinc-900 dark:bg-zinc-950 transition-colors"
            >
              <div className="aspect-square w-full overflow-hidden rounded-2xl bg-stone-50 dark:bg-zinc-900/30">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={400}
                    height={400}
                    unoptimized
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-stone-50 text-[10px] uppercase tracking-widest font-black text-stone-400 dark:bg-zinc-900/10">
                    No Asset Available
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-1 flex-col justify-between space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-stone-950 dark:text-zinc-50 tracking-tight">
                    {product.name}
                  </h3>
                  <p className="text-xs text-stone-400 dark:text-zinc-500 font-medium line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-baseline space-x-1.5">
                    {product.startingPrice !== null ? (
                      <>
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                          From
                        </span>
                        <span className="text-sm font-extrabold text-stone-950 dark:text-zinc-50 font-mono">
                          {formatCurrency(product.startingPrice)}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-xs text-stone-400 line-through font-mono ml-2">
                            {formatCurrency(product.compareAtPrice)}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[10px] text-red-500 font-black uppercase tracking-widest">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/${tenantDomain}/product/${product.slug}`}
                    className="block w-full rounded-full bg-stone-950 py-3 text-center text-xs font-bold text-white hover:bg-stone-850 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
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
