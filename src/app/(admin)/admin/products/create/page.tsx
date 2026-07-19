import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema/products";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateProductForm } from "@/components/admin/create-product-form";

export default async function CreateProductPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  const tenantId = session.user.tenantId;

  const flatCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.tenantId, tenantId));

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Create Product
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Deploy a new product with multiple catalog variations and variants.
        </p>
      </div>
      <CreateProductForm categories={flatCategories} />
    </div>
  );
}
