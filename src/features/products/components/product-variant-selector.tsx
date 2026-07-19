"use client";

import { useState } from "react";
import { useCartStore } from "../../cart/store/use-cart-store";
import { formatCurrency } from "../../shared/utils/format";

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
      <div>
        <p className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">
          {formatCurrency(parseFloat(selectedVariant.price))}
        </p>
        {selectedVariant.compareAtPrice && (
          <p className="text-sm text-zinc-400 line-through">
            {formatCurrency(parseFloat(selectedVariant.compareAtPrice))}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
          Available Variations
        </span>
        <div className="grid grid-cols-2 gap-2">
          {variants.map((v) => {
            const isSelected = selectedVariant.id === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariant(v)}
                className={`rounded-lg border p-3 text-left transition-all ${
                  isSelected
                    ? "border-zinc-950 bg-zinc-50 dark:border-zinc-50 dark:bg-zinc-900"
                    : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/40"
                }`}
              >
                <p className="text-xs font-bold text-zinc-950 dark:text-zinc-50">
                  {Object.entries(v.attributes)
                    .map(([key, val]) => `${key}: ${val}`)
                    .join(", ")}
                </p>
                <p className="mt-1 text-[10px] text-zinc-500">SKU: {v.sku}</p>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        className="w-full rounded-full bg-zinc-950 py-3.5 text-center text-xs font-bold text-white transition-all hover:bg-zinc-850 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        Add to Shopping Cart
      </button>
    </div>
  );
}
