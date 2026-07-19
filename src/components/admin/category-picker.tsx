"use client";

import { ReactNode } from "react";

interface DbCategory {
  id: string;
  name: string;
  parentId: string | null;
}

interface CategoryPickerProps {
  categories: DbCategory[];
  value: string;
  onChange: (val: string) => void;
}

interface PickerNode {
  id: string;
  name: string;
  parentId: string | null;
  children: PickerNode[];
}

export function CategoryPicker({ categories, value, onChange }: CategoryPickerProps) {
  const buildTree = (list: DbCategory[], parentId: string | null = null): PickerNode[] => {
    return list
      .filter((item) => item.parentId === parentId)
      .map((item) => ({
        id: item.id,
        name: item.name,
        parentId: item.parentId,
        children: buildTree(list, item.id),
      }));
  };

  const tree = buildTree(categories);

  const renderOptions = (nodes: PickerNode[], depth = 0): ReactNode[] => {
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
      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
        Product Category
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50"
      >
        <option value="">Uncategorized</option>
        {renderOptions(tree)}
      </select>
    </div>
  );
}
