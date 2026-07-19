import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema/products";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createCategory, deleteCategory } from "@/lib/actions/category";
import { ReactNode } from "react";

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

  const renderTree = (nodes: CategoryNode[], depth = 0): ReactNode => {
    return (
      <ul className="space-y-2">
        {nodes.map((node) => (
          <li
            key={node.id}
            className="rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-900 dark:bg-zinc-950/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                {"—".repeat(depth)} {node.name}
              </span>
              <form action={deleteCategory.bind(null, node.id)}>
                <button
                  type="submit"
                  className="text-[10px] font-bold text-red-600 hover:underline"
                >
                  Delete
                </button>
              </form>
            </div>
            {node.children.length > 0 && (
              <div className="mt-2 pl-4 border-l border-zinc-200 dark:border-zinc-850">
                {renderTree(node.children, depth + 1)}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Categories
        </h1>
        <p className="text-xs text-zinc-500">Manage your hierarchical store categories.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 md:col-span-1">
          <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Add New Category</h3>
          <form
            action={async (formData: FormData) => {
              "use server";
              const name = formData.get("name") as string;
              const parentId = formData.get("parentId") as string;
              await createCategory(name, parentId || null);
            }}
            className="mt-4 space-y-4"
          >
            <div>
              <label className="block text-[10px] font-bold text-zinc-500">Name</label>
              <input
                type="text"
                name="name"
                required
                className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500">Parent Category</label>
              <select
                name="parentId"
                className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50"
              >
                <option value="">None (Top Level)</option>
                {flatCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full rounded bg-zinc-950 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Save Category
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 md:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Category Tree</h3>
          {tree.length === 0 ? (
            <p className="text-xs text-zinc-400">No categories added yet.</p>
          ) : (
            renderTree(tree)
          )}
        </div>
      </div>
    </div>
  );
}
