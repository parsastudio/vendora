"use client";

import { useState, useTransition, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ProductBasicsSection } from "./product-basics-section";
import { ProductImageUploader } from "./product-image-uploader";
import { VariantsFormManager } from "./variants-form-manager";

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
          imageUrl: imageUrl || null,
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
      <ProductBasicsSection
        name={name}
        onNameChange={handleNameChange}
        slug={slug}
        onSlugChange={setSlug}
        description={description}
        onDescriptionChange={setDescription}
        categoryId={categoryId}
        onCategoryIdChange={setCategoryId}
        categories={categories}
      />

      <ProductImageUploader imageUrl={imageUrl} onImageUpload={setImageUrl} />

      <VariantsFormManager variants={variants} onVariantsChange={setVariants} productName={name} />

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
