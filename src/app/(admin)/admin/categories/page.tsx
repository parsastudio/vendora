import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema/products";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { redirect } from "next/navigation";
import { CategoryCreationForm } from "@/features/products/components/category-creation-form";
import { RecursiveCategoryTree } from "@/features/products/components/recursive-category-tree";

interface DbCategory {
  id: string;
  tenantId: string;
  parentId: string | null;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryNode {
  id: string;
  name: string;
  parentId: string | null;
  children: CategoryNode[];
}

function buildCategoryTree(list: DbCategory[], parentId: string | null = null): CategoryNode[] {
  return list
    .filter((item) => item.parentId === parentId)
    .map((item) => ({
      id: item.id,
      name: item.name,
      parentId: item.parentId,
      children: buildCategoryTree(list, item.id),
    }));
}

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Categories
        </h1>
        <p className="text-xs text-zinc-500">Manage your hierarchical store categories.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <CategoryCreationForm flatCategories={flatCategories} />

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 md:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Category Tree</h3>
          {tree.length === 0 ? (
            <p className="text-xs text-zinc-400">No categories added yet.</p>
          ) : (
            <RecursiveCategoryTree tree={tree} />
          )}
        </div>
      </div>
    </div>
  );
}
