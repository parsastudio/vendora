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

interface EditProductFormProps {
  categories: DbCategory[];
  productId: string;
  initialData: {
    name: string;
    slug: string;
    description: string | null;
    categoryId: string | null;
    imageUrl?: string | null;
    variants: VariantFormState[];
  };
}

export function EditProductForm({ categories, productId, initialData }: EditProductFormProps) {
  const [name, setName] = useState(initialData.name);
  const [slug, setSlug] = useState(initialData.slug);
  const [description, setDescription] = useState(initialData.description || "");
  const [categoryId, setCategoryId] = useState(initialData.categoryId || "");
  const [imageUrl, setImageUrl] = useState(initialData.imageUrl || "");
  const [variants, setVariants] = useState<VariantFormState[]>(initialData.variants);
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

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
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

      <ProductImageUploader
        imageUrl={imageUrl}
        onImageUpload={setImageUrl}
        onRemoveImage={() => setImageUrl("")}
      />

      <VariantsFormManager variants={variants} onVariantsChange={setVariants} productName={name} />

      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-zinc-950 px-6 py-3 text-xs font-bold text-white shadow-sm transition-all duration-300 hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          {isPending ? "Updating..." : "Update Product"}
        </button>
      </div>
    </form>
  );
}
