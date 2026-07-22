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
    <form onSubmit={handleUpdate} className="flex items-center gap-2">
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
        className="w-16 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 focus:outline-none font-mono font-bold text-center"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-stone-950 px-3.5 py-1.5 text-[9px] font-black uppercase text-white dark:bg-zinc-50 dark:text-zinc-950 disabled:opacity-50 transition-all font-mono"
      >
        {isPending ? "..." : "Save"}
      </button>
    </form>
  );
}
