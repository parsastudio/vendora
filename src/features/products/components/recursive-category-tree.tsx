"use client";

import { ReactNode } from "react";
import { deleteCategory } from "@/features/products/actions/category";

interface CategoryNode {
  id: string;
  name: string;
  parentId: string | null;
  children: CategoryNode[];
}

interface RecursiveCategoryTreeProps {
  tree: CategoryNode[];
}

export function RecursiveCategoryTree({ tree }: RecursiveCategoryTreeProps) {
  const handleDelete = async (id: string) => {
    await deleteCategory(id);
  };

  const renderTree = (nodes: CategoryNode[], depth = 0): ReactNode => {
    return (
      <ul className="space-y-3">
        {nodes.map((node) => (
          <li
            key={node.id}
            className="rounded-2xl border border-stone-100 bg-stone-50/50 p-4 dark:border-zinc-900 dark:bg-zinc-900/10"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-950 dark:text-zinc-50 flex items-center gap-3">
                <span className="font-mono text-stone-300 dark:text-zinc-700">
                  {"—".repeat(depth)}
                </span>{" "}
                {node.name}
              </span>
              <form action={handleDelete.bind(null, node.id)}>
                <button
                  type="submit"
                  className="text-[9px] font-black uppercase tracking-widest text-rose-600 hover:text-rose-700"
                >
                  Delete
                </button>
              </form>
            </div>
            {node.children.length > 0 && (
              <div className="mt-3 pl-4 border-l border-stone-200/50 dark:border-zinc-800">
                {renderTree(node.children, depth + 1)}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return renderTree(tree);
}
