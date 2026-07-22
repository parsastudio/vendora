import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema/products";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { redirect } from "next/navigation";
import { CreateProductForm } from "@/features/products/components/create-product-form";

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
      <div className="space-y-1">
        <h1 className="text-2xl font-black tracking-tight text-stone-950 dark:text-zinc-50">
          Create Product
        </h1>
        <p className="text-xs text-stone-400 dark:text-zinc-500 font-medium">
          Deploy a new product entry inside your centralized catalog inventory.
        </p>
      </div>
      <CreateProductForm categories={flatCategories} />
    </div>
  );
}
