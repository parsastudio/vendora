"use client";

import { ReactNode } from "react";

interface DbCategory {
  id: string;
  name: string;
  parentId: string | null;
}

import { buildCategoryTree, type CategoryNode } from "@/features/products/utils/taxonomy";

interface CategoryPickerProps {
  categories: DbCategory[];
  value: string;
  onChange: (val: string) => void;
}

export function CategoryPicker({ categories, value, onChange }: CategoryPickerProps) {
  const tree = buildCategoryTree(categories);

  const renderOptions = (nodes: CategoryNode[], depth = 0): ReactNode[] => {
    return nodes.flatMap((node) => [
      <option key={node.id} value={node.id}>
        {"\u00A0\u00A0".repeat(depth)}
        {depth > 0 ? "└─ " : ""}
        {node.name}
      </option>,
      ...renderOptions(node.children, depth + 1),
    ]);
  };

  return (
    <div>
      <label className="text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
        Product Category
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:border-stone-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 text-stone-955 dark:text-zinc-50 font-bold"
      >
        <option value="">Uncategorized</option>
        {renderOptions(tree)}
      </select>
    </div>
  );
}
