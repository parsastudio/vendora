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
    <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 dark:border-zinc-800/60 dark:bg-zinc-950 space-y-6">
      {items.map((item) => (
        <div
          key={item.variantId}
          className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-6 last:border-0 last:pb-0 gap-4"
        >
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">{item.name}</h3>
            <p className="text-xs text-zinc-400">{formatCurrency(parseFloat(item.price))}</p>
            {(item.attributes.color === "black" || item.attributes.bogo === "true") && (
              <span className="inline-flex items-center rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 uppercase tracking-wider">
                BOGO Eligible
              </span>
            )}
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4">
            <div className="flex items-center border border-zinc-200 rounded-lg dark:border-zinc-800 overflow-hidden bg-zinc-50 dark:bg-zinc-900/30">
              <button
                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                className="px-3 py-1.5 text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-800"
              >
                -
              </button>
              <span className="px-1 text-xs font-bold text-zinc-950 dark:text-zinc-50">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                className="px-3 py-1.5 text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-800"
              >
                +
              </button>
            </div>
            <button
              onClick={() => removeItem(item.variantId)}
              className="text-xs font-bold text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
