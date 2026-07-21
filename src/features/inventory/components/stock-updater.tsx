"use client";

import { useState, useTransition } from "react";
import { updateStock } from "@/features/inventory/actions/inventory";

interface StockUpdaterProps {
  variantId: string;
  warehouseId: string;
  initialQuantity: number;
}

export function StockUpdater({ variantId, warehouseId, initialQuantity }: StockUpdaterProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateStock(variantId, warehouseId, quantity);
      } catch (err) {
        console.error(err);
      }
    });
  };

  return (
    <form onSubmit={handleUpdate} className="flex items-center gap-1.5">
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
        className="w-16 rounded border border-zinc-300 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 focus:outline-none"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-zinc-950 px-2.5 py-1 text-[10px] font-semibold text-white dark:bg-zinc-50 dark:text-zinc-950 hover:opacity-80 disabled:opacity-50 transition-all font-mono"
      >
        {isPending ? "..." : "Update"}
      </button>
    </form>
  );
}
