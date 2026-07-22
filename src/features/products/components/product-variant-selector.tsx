"use client";

import { useState } from "react";
import { useCartStore } from "@/features/cart/store/use-cart-store";
import { formatCurrency } from "@/features/shared/utils/format";

interface Variant {
  id: string;
  sku: string;
  price: string;
  compareAtPrice: string | null;
  attributes: Record<string, string>;
}

interface ProductVariantSelectorProps {
  productName: string;
  variants: Variant[];
}

export function ProductVariantSelector({ productName, variants }: ProductVariantSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant>(variants[0]);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      variantId: selectedVariant.id,
      sku: selectedVariant.sku,
      name: `${productName} (${Object.values(selectedVariant.attributes).join(" / ")})`,
      price: selectedVariant.price,
      quantity: 1,
      attributes: selectedVariant.attributes,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-baseline space-x-3">
        <p className="text-3xl font-black text-stone-950 dark:text-zinc-50 font-mono">
          {formatCurrency(parseFloat(selectedVariant.price))}
        </p>
        {selectedVariant.compareAtPrice && (
          <p className="text-sm text-stone-400 line-through font-mono">
            {formatCurrency(parseFloat(selectedVariant.compareAtPrice))}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
          Select Variation
        </span>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {variants.map((v) => {
            const isSelected = selectedVariant.id === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariant(v)}
                className={`rounded-2xl border p-5 text-left transition-all ${
                  isSelected
                    ? "border-stone-950 bg-stone-50 dark:border-zinc-50 dark:bg-zinc-900/40 ring-1 ring-stone-950 dark:ring-zinc-50"
                    : "border-stone-200/60 bg-white hover:border-stone-400 dark:border-zinc-900 dark:bg-zinc-950 dark:hover:border-zinc-700"
                }`}
              >
                <p className="text-xs font-extrabold text-stone-950 dark:text-zinc-50 uppercase tracking-tight">
                  {Object.entries(v.attributes)
                    .map(([key, val]) => `${key}: ${val}`)
                    .join(", ")}
                </p>
                <p className="mt-1 text-[9px] text-stone-400 dark:text-zinc-505 font-mono">
                  SKU: {v.sku}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        className="w-full rounded-full bg-stone-950 py-4 text-center text-xs font-bold text-white shadow-xl hover:bg-stone-850 active:scale-[0.99] dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        Add to Shopping Cart
      </button>
    </div>
  );
}
