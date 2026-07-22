import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { products, productVariants } from "@/lib/db/schema/products";
import { tenants } from "@/lib/db/schema/tenants";
import { eq, and } from "drizzle-orm";
import { ProductVariantSelector } from "@/features/products/components/product-variant-selector";
import Image from "next/image";
import Link from "next/link";

interface ProductPageProps {
  params: Promise<{ domain: string; slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const { domain, slug } = resolvedParams;

  const tenantResult = await db
    .select()
    .from(tenants)
    .where(eq(tenants.subdomain, domain))
    .limit(1);

  if (tenantResult.length === 0) {
    notFound();
  }

  const tenant = tenantResult[0];

  const productResult = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      imageUrl: products.imageUrl,
      tenantId: products.tenantId,
      status: products.status,
    })
    .from(products)
    .where(
      and(eq(products.slug, slug), eq(products.tenantId, tenant.id), eq(products.status, "active")),
    )
    .limit(1);

  if (productResult.length === 0) {
    notFound();
  }

  const product = productResult[0];

  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, product.id));

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
      <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-12 lg:gap-x-16">
        <div className="lg:col-span-7">
          <div className="sticky top-28 aspect-[4/3] w-full overflow-hidden rounded-3xl border border-stone-200/40 bg-stone-50 dark:border-zinc-900 dark:bg-zinc-900/20">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={1000}
                height={750}
                unoptimized
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-widest font-black text-stone-400">
                Premium Asset Space
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-between lg:col-span-5">
          <div className="space-y-8">
            <nav className="flex items-center space-x-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              <Link href={`/${domain}`} className="hover:text-stone-950 dark:hover:text-zinc-50">
                Catalog
              </Link>
              <span>/</span>
              <span className="text-stone-900 dark:text-zinc-50">{product.name}</span>
            </nav>

            <div className="space-y-4">
              <h1 className="text-3xl font-black tracking-tight text-stone-950 dark:text-zinc-50 sm:text-4xl">
                {product.name}
              </h1>
              <p className="text-xs text-stone-500 dark:text-zinc-400 leading-relaxed font-medium">
                {product.description}
              </p>
            </div>

            <div className="border-t border-stone-200/40 pt-8 dark:border-zinc-900/50">
              {variants.length === 0 ? (
                <p className="text-xs font-black uppercase tracking-widest text-rose-500">
                  Currently Out of Stock
                </p>
              ) : (
                <ProductVariantSelector productName={product.name} variants={variants} />
              )}
            </div>

            <div className="border-t border-stone-200/40 pt-8 dark:border-zinc-900/50 space-y-4">
              <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                Specifications
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="rounded-2xl border border-stone-200/40 bg-white p-4 dark:border-zinc-900 dark:bg-zinc-950">
                  <p className="text-stone-400">Carbon Footprint</p>
                  <p className="font-extrabold text-stone-900 dark:text-zinc-100 mt-1">
                    100% Offset
                  </p>
                </div>
                <div className="rounded-2xl border border-stone-200/40 bg-white p-4 dark:border-zinc-900 dark:bg-zinc-950">
                  <p className="text-stone-400">Warranty Protection</p>
                  <p className="font-extrabold text-stone-900 dark:text-zinc-100 mt-1">
                    2-Year Limited
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-stone-200/40 pt-8 dark:border-zinc-900/50 space-y-4 text-xs font-semibold text-stone-500 dark:text-zinc-400">
              <div className="flex items-center gap-4">
                <span className="text-lg">🛡️</span>
                <div>
                  <p className="font-black text-stone-900 dark:text-zinc-50">Protected Checkout</p>
                  <p className="text-[11px] text-stone-400">
                    Secure transactions validated by Stripe servers.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg">📦</span>
                <div>
                  <p className="font-black text-stone-900 dark:text-zinc-50">Premium Logistics</p>
                  <p className="text-[11px] text-stone-400">
                    Individually packaged inside custom carbon-neutral boxes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
