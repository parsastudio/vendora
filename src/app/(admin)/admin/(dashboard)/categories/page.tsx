import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema/products";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { redirect } from "next/navigation";
import { CategoryCreationForm } from "@/features/products/components/category-creation-form";
import { RecursiveCategoryTree } from "@/features/products/components/recursive-category-tree";
import { buildCategoryTree } from "@/features/products/utils/taxonomy";

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  const tenantId = session.user.tenantId;

  const flatCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.tenantId, tenantId));

  const tree = buildCategoryTree(flatCategories);

  return (
    <div className="space-y-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-stone-950 dark:text-zinc-50">
          Categories Taxonomy
        </h1>
        <p className="text-xs text-stone-400 dark:text-zinc-500 font-medium">
          Create and orchestrate infinite levels of parent-child category structures.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <CategoryCreationForm flatCategories={flatCategories} />

        <div className="rounded-3xl border border-stone-200/40 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 md:col-span-2 space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-zinc-100 font-mono">
            Category Tree
          </h3>
          {tree.length === 0 ? (
            <p className="text-xs text-stone-400 dark:text-zinc-500 font-semibold py-4">
              No categories declared in context.
            </p>
          ) : (
            <RecursiveCategoryTree tree={tree} />
          )}
        </div>
      </div>
    </div>
  );
}
