"use client";

import { CategoryPicker } from "./category-picker";

interface DbCategory {
  id: string;
  name: string;
  parentId: string | null;
}

interface ProductBasicsSectionProps {
  name: string;
  onNameChange: (val: string) => void;
  slug: string;
  onSlugChange: (val: string) => void;
  description: string;
  onDescriptionChange: (val: string) => void;
  categoryId: string;
  onCategoryIdChange: (val: string) => void;
  categories: DbCategory[];
}

export function ProductBasicsSection({
  name,
  onNameChange,
  slug,
  onSlugChange,
  description,
  onDescriptionChange,
  categoryId,
  onCategoryIdChange,
  categories,
}: ProductBasicsSectionProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800/40 dark:bg-zinc-950">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Product Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="block w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Slug (SEO Friendly URL)
          </label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            className="block w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 font-mono"
          />
        </div>

        <div className="sm:col-span-2">
          <CategoryPicker
            categories={categories}
            value={categoryId}
            onChange={onCategoryIdChange}
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Rich Description
          </label>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="block w-full min-h-[100px] rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
