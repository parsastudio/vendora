"use client";

import { CartItem } from "../types/cart";
import { formatCurrency } from "@/features/shared/utils/format";

interface CartItemsListProps {
  items: CartItem[];
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
}

export function CartItemsList({ items, updateQuantity, removeItem }: CartItemsListProps) {
  return (
    <div className="rounded-3xl border border-stone-200/40 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 space-y-6">
      {items.map((item) => (
        <div
          key={item.variantId}
          className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 dark:border-zinc-900/50 pb-6 last:border-0 last:pb-0 gap-4"
        >
          <div className="space-y-1 font-semibold">
            <h3 className="text-xs font-bold text-stone-950 dark:text-zinc-50">{item.name}</h3>
            <p className="text-xs text-stone-400 font-mono">
              {formatCurrency(parseFloat(item.price))}
            </p>
            {(item.attributes.color === "black" || item.attributes.bogo === "true") && (
              <span className="inline-flex items-center rounded-lg bg-emerald-500/[0.06] px-2.5 py-1 text-[9px] font-black text-emerald-700 uppercase tracking-widest">
                BOGO Eligible
              </span>
            )}
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-6 font-semibold">
            <div className="flex items-center border border-stone-200 rounded-xl dark:border-zinc-800 overflow-hidden bg-stone-50 dark:bg-zinc-900/20">
              <button
                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                className="px-3.5 py-2 text-xs font-bold hover:bg-stone-250 dark:hover:bg-zinc-800"
              >
                -
              </button>
              <span className="px-2 text-xs font-extrabold font-mono text-stone-950 dark:text-zinc-50">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                className="px-3.5 py-2 text-xs font-bold hover:bg-stone-250 dark:hover:bg-zinc-800"
              >
                +
              </button>
            </div>
            <button
              onClick={() => removeItem(item.variantId)}
              className="text-xs font-bold text-rose-600 hover:text-rose-700"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
