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
    <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
      <div className="grid grid-cols-1 gap-y-12 lg:grid-cols-12 lg:gap-x-16">
        <div className="lg:col-span-7">
          <div className="sticky top-24 aspect-4/3 w-full overflow-hidden rounded-2xl border border-zinc-200/60 bg-zinc-50 dark:border-zinc-800/60 dark:bg-zinc-900/40">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={800}
                height={600}
                unoptimized
                className="h-full w-full object-cover transition-all duration-500 hover:scale-105"
              />
            ) : (
              <div className="flex h-[500px] w-full items-center justify-center text-zinc-400 dark:text-zinc-505">
                Premium Catalog Asset
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-between lg:col-span-5">
          <div className="space-y-6">
            <nav className="flex items-center space-x-2 text-xs text-zinc-400">
              <Link
                href={`/${domain}`}
                className="hover:text-zinc-950 dark:hover:text-zinc-55 mt-0.5"
              >
                Catalog
              </Link>
              <span>/</span>
              <Link
                href={`/${domain}`}
                className="hover:text-zinc-950 dark:hover:text-zinc-55 mt-0.5"
              >
                {tenant.name}
              </Link>
              <span>/</span>
              <span className="text-zinc-900 dark:text-zinc-50 font-semibold">{product.name}</span>
            </nav>

            <div className="space-y-3">
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-955 dark:text-zinc-50">
                {product.name}
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="border-t border-zinc-200/60 pt-6 dark:border-zinc-800/60">
              {variants.length === 0 ? (
                <p className="text-xs text-red-500">
                  This catalog item is currently out of variants.
                </p>
              ) : (
                <ProductVariantSelector productName={product.name} variants={variants} />
              )}
            </div>

            <div className="border-t border-zinc-200/60 pt-6 dark:border-zinc-800/60 space-y-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Product Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl border border-zinc-200/60 bg-white p-3 dark:border-zinc-800/60 dark:bg-zinc-900/30">
                  <p className="text-zinc-400">Country of Origin</p>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50 mt-1">
                    United States
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-200/60 bg-white p-3 dark:border-zinc-800/60 dark:bg-zinc-900/30">
                  <p className="text-zinc-400">Warranty Protection</p>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50 mt-1">
                    2-Year Limited
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-200/60 bg-white p-3 dark:border-zinc-800/60 dark:bg-zinc-900/30">
                  <p className="text-zinc-400">Carbon Footprint</p>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50 mt-1">100% Offset</p>
                </div>
                <div className="rounded-xl border border-zinc-200/60 bg-white p-3 dark:border-zinc-800/60 dark:bg-zinc-900/30">
                  <p className="text-zinc-400">Care Instructions</p>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50 mt-1">Wipe Clean</p>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-200/60 pt-6 dark:border-zinc-800/60 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">🛡️</span>
                <div className="text-xs">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                    Secure Transactions
                  </p>
                  <p className="text-zinc-400">Encrypted payments processed through Stripe.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">📦</span>
                <div className="text-xs">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">Insured Delivery</p>
                  <p className="text-zinc-400">
                    Carefully packaged with high-durability sustainable padding.
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
