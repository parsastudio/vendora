"use client";

import { generateSKU } from "../utils/sku-generator";

interface VariantFormState {
  sku: string;
  price: string;
  compareAtPrice: string;
  color: string;
  size: string;
}

interface VariantsFormManagerProps {
  variants: VariantFormState[];
  onVariantsChange: (variants: VariantFormState[]) => void;
  productName: string;
}

export function VariantsFormManager({
  variants,
  onVariantsChange,
  productName,
}: VariantsFormManagerProps) {
  const addVariant = () => {
    onVariantsChange([
      ...variants,
      {
        sku: "",
        price: "0.00",
        compareAtPrice: "",
        color: "",
        size: "",
      },
    ]);
  };

  const updateVariant = (index: number, key: keyof VariantFormState, value: string) => {
    const updated = [...variants];
    updated[index][key] = value;
    onVariantsChange(updated);
  };

  const handleAutoGenerateSKU = (index: number) => {
    const variant = variants[index];
    const generated = generateSKU(productName || "PRD", {
      color: variant.color || "NA",
      size: variant.size || "NA",
    });
    updateVariant(index, "sku", generated);
  };

  const removeVariant = (index: number) => {
    onVariantsChange(variants.filter((_, i) => i !== index));
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800/40 dark:bg-zinc-950 space-y-6">
      <div className="flex items-center justify-between border-b pb-4 dark:border-zinc-900/40">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Product Variants</h2>
        <button
          type="button"
          onClick={addVariant}
          className="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Add Variant
        </button>
      </div>

      <div className="space-y-4">
        {variants.map((v, index) => (
          <div
            key={index}
            className="grid grid-cols-1 gap-4 rounded-xl border border-zinc-200/60 p-5 dark:border-zinc-900 bg-zinc-50/20 dark:bg-zinc-900/10 sm:grid-cols-5 items-end"
          >
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Color
              </label>
              <input
                type="text"
                value={v.color}
                onChange={(e) => updateVariant(index, "color", e.target.value)}
                className="block w-full rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Size
              </label>
              <input
                type="text"
                value={v.size}
                onChange={(e) => updateVariant(index, "size", e.target.value)}
                className="block w-full rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Price ($)
              </label>
              <input
                type="text"
                required
                value={v.price}
                onChange={(e) => updateVariant(index, "price", e.target.value)}
                className="block w-full rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                SKU Code
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  required
                  value={v.sku}
                  onChange={(e) => updateVariant(index, "sku", e.target.value)}
                  className="block w-full rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleAutoGenerateSKU(index)}
                  className="rounded-xl bg-zinc-150 px-3 py-1.5 text-[10px] font-bold text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Auto
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => removeVariant(index)}
                className="rounded-xl bg-rose-100 px-4 py-2 text-[10px] font-bold text-rose-600 hover:bg-rose-200 dark:bg-rose-950/20"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
