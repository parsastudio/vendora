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
    <div className="rounded-3xl border border-stone-200/40 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 md:col-span-1 space-y-6">
      <h3 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-zinc-100">
        Register Category
      </h3>
      <form
        action={async (formData: FormData) => {
          const name = formData.get("name") as string;
          const parentId = formData.get("parentId") as string;
          await createCategory(name, parentId || null);
        }}
        className="space-y-5"
      >
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
            Name
          </label>
          <input
            type="text"
            name="name"
            required
            className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 text-stone-955 dark:text-zinc-50"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
            Parent Category
          </label>
          <select
            name="parentId"
            className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 text-stone-955 dark:text-zinc-50"
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
          className="w-full rounded-xl bg-stone-950 py-3.5 text-xs font-semibold text-white hover:bg-stone-850 dark:bg-zinc-50 dark:text-zinc-955 h-11"
        >
          Save Category
        </button>
      </form>
    </div>
  );
}
