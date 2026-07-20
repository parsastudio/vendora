import { db } from "@/lib/db";
import { categories, products, productVariants } from "@/lib/db/schema/products";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { redirect, notFound } from "next/navigation";
import { EditProductForm } from "@/features/products/components/edit-product-form";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }
  const { id } = await params;
  const tenantId = session.user.tenantId;

  const productResult = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
    .limit(1);

  if (productResult.length === 0) {
    notFound();
  }

  const product = productResult[0];

  const variants = await db.select().from(productVariants).where(eq(productVariants.productId, id));

  const flatCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.tenantId, tenantId));

  const initialData = {
    ...product,
    variants: variants.map((v) => ({
      sku: v.sku,
      price: v.price,
      compareAtPrice: v.compareAtPrice || "",
      color: v.attributes.color || "",
      size: v.attributes.size || "",
    })),
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Edit Product
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Modify product metadata, pricing tiers, attributes, and stock variations.
        </p>
      </div>
      <EditProductForm categories={flatCategories} productId={id} initialData={initialData} />
    </div>
  );
}
