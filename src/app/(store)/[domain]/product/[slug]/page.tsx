import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { products, productVariants } from "@/lib/db/schema/products";
import { tenants } from "@/lib/db/schema/tenants";
import { eq, and } from "drizzle-orm";
import { ProductVariantSelector } from "@/components/store/product-variant-selector";

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
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.tenantId, tenant.id)))
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
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-2 lg:gap-x-16">
        <div>
          <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900">
            <div className="flex h-[400px] w-full items-center justify-center text-zinc-450 dark:text-zinc-500">
              Product Catalog Asset
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <div className="space-y-4">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
              {product.name}
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="mt-8">
            {variants.length === 0 ? (
              <p className="text-xs text-red-500">
                This catalog item is currently out of variants.
              </p>
            ) : (
              <ProductVariantSelector productName={product.name} variants={variants} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
