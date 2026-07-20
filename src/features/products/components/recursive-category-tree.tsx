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
              <form action={handleDelete.bind(null, node.id)}>
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

  return renderTree(tree);
}
