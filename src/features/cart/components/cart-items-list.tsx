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
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-6">
      {items.map((item) => (
        <div
          key={item.variantId}
          className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4 last:border-0 last:pb-0"
        >
          <div>
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{item.name}</h3>
            <p className="text-xs text-zinc-500">{formatCurrency(parseFloat(item.price))}</p>
            {(item.attributes.color === "black" || item.attributes.bogo === "true") && (
              <span className="inline-block mt-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">
                BOGO Eligible
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
              className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-bold dark:bg-zinc-800 text-zinc-950"
            >
              -
            </button>
            <span className="text-xs font-medium text-zinc-950 dark:text-zinc-50">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
              className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-bold dark:bg-zinc-800 text-zinc-950"
            >
              +
            </button>
            <button
              onClick={() => removeItem(item.variantId)}
              className="ml-4 text-xs font-semibold text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
