"use client";

import { useState, useTransition, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FileUpload } from "../../shared/components/ui/file-upload";
import { CategoryPicker } from "./category-picker";
import { generateSKU } from "../utils/sku-generator";
import Image from "next/image";

interface DbCategory {
  id: string;
  name: string;
  parentId: string | null;
}

interface VariantFormState {
  sku: string;
  price: string;
  compareAtPrice: string;
  color: string;
  size: string;
}

interface CreateProductFormProps {
  categories: DbCategory[];
}

export function CreateProductForm({ categories }: CreateProductFormProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [variants, setVariants] = useState<VariantFormState[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, ""),
    );
  };

  const addVariant = () => {
    setVariants([
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
    setVariants(updated);
  };

  const handleAutoGenerateSKU = (index: number) => {
    const variant = variants[index];
    const generated = generateSKU(name || "PRD", {
      color: variant.color || "NA",
      size: variant.size || "NA",
    });
    updateVariant(index, "sku", generated);
  };

  const handleImageUpload = async (url: string) => {
    setImageUrl(url);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      const formattedVariants = variants.map((v) => ({
        sku: v.sku,
        price: v.price,
        compareAtPrice: v.compareAtPrice || null,
        attributes: {
          color: v.color,
          size: v.size,
        },
      }));

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description,
          categoryId: categoryId || null,
          seoMetadata: {
            title: name,
            description,
            keywords: [name.toLowerCase()],
          },
          variants: formattedVariants,
        }),
      });

      const result = await response.json();
      if (result.success) {
        router.push("/admin/products");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Product Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Slug (SEO Friendly URL)
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div className="sm:col-span-2">
            <CategoryPicker categories={categories} value={categoryId} onChange={setCategoryId} />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Rich Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full min-h-[100px] rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Product Image</h2>
        <div className="mt-4">
          {imageUrl ? (
            <div className="relative h-40 w-40 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              <Image
                src={imageUrl}
                alt="Uploaded S3 asset"
                width={160}
                height={160}
                unoptimized
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <FileUpload onUploadSuccess={handleImageUpload} />
          )}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Product Variants
          </h2>
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

      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          {isPending ? "Deploying..." : "Save Product"}
        </button>
      </div>
    </form>
  );
}
