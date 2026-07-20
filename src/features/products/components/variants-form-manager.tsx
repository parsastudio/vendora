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
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Product Variants</h2>
        <button
          type="button"
          onClick={addVariant}
          className="rounded-md bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Add Variant
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {variants.map((v, index) => (
          <div
            key={index}
            className="grid grid-cols-1 gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:grid-cols-5"
          >
            <div>
              <label className="text-[10px] font-bold text-zinc-500">Color</label>
              <input
                type="text"
                value={v.color}
                onChange={(e) => updateVariant(index, "color", e.target.value)}
                className="block w-full rounded-md border border-zinc-300 bg-zinc-50 px-2 py-1 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-500">Size</label>
              <input
                type="text"
                value={v.size}
                onChange={(e) => updateVariant(index, "size", e.target.value)}
                className="block w-full rounded-md border border-zinc-300 bg-zinc-50 px-2 py-1 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-500">Price ($)</label>
              <input
                type="text"
                required
                value={v.price}
                onChange={(e) => updateVariant(index, "price", e.target.value)}
                className="block w-full rounded-md border border-zinc-300 bg-zinc-50 px-2 py-1 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-500">SKU Code</label>
              <div className="flex gap-1">
                <input
                  type="text"
                  required
                  value={v.sku}
                  onChange={(e) => updateVariant(index, "sku", e.target.value)}
                  className="block w-full rounded-md border border-zinc-300 bg-zinc-50 px-2 py-1 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                />
                <button
                  type="button"
                  onClick={() => handleAutoGenerateSKU(index)}
                  className="rounded bg-zinc-100 px-1.5 py-1 text-[9px] font-bold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  Auto
                </button>
              </div>
            </div>

            <div className="flex items-end justify-end">
              <button
                type="button"
                onClick={() => removeVariant(index)}
                className="rounded bg-red-100 px-2 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-200 dark:bg-red-950/20"
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
