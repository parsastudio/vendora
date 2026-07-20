"use client";

import { createCategory } from "@/features/products/actions/category";

interface DbCategory {
  id: string;
  name: string;
  parentId: string | null;
}

interface CategoryCreationFormProps {
  flatCategories: DbCategory[];
}

export function CategoryCreationForm({ flatCategories }: CategoryCreationFormProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 md:col-span-1">
      <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Add New Category</h3>
      <form
        action={async (formData: FormData) => {
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
  );
}
