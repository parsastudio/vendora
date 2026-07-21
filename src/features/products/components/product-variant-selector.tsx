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
    <div className="space-y-6">
      <div className="flex items-baseline space-x-3">
        <p className="text-3xl font-extrabold text-zinc-950 dark:text-zinc-50">
          {formatCurrency(parseFloat(selectedVariant.price))}
        </p>
        {selectedVariant.compareAtPrice && (
          <p className="text-base text-zinc-400 line-through">
            {formatCurrency(parseFloat(selectedVariant.compareAtPrice))}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          Available Variations
        </span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {variants.map((v) => {
            const isSelected = selectedVariant.id === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariant(v)}
                className={`rounded-xl border p-4 text-left shadow-sm transition-all duration-300 ${
                  isSelected
                    ? "border-zinc-950 bg-zinc-50 dark:border-zinc-50 dark:bg-zinc-900/50 scale-[1.01] ring-1 ring-zinc-950 dark:ring-zinc-50"
                    : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/20"
                }`}
              >
                <p className="text-xs font-bold text-zinc-950 dark:text-zinc-50 uppercase">
                  {Object.entries(v.attributes)
                    .map(([key, val]) => `${key}: ${val}`)
                    .join(", ")}
                </p>
                <p className="mt-1 text-[10px] text-zinc-400 font-mono">SKU: {v.sku}</p>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        className="w-full rounded-full bg-zinc-950 py-4 text-center text-xs font-bold text-white shadow-lg transition-all duration-300 hover:bg-zinc-800 hover:scale-[1.005] active:scale-[0.99] dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        Add to Shopping Cart
      </button>
    </div>
  );
}
