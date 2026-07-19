import { z } from "zod";

export const productVariantSchema = z.object({
  sku: z.string().min(1),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  compareAtPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional()
    .nullable(),
  attributes: z.record(z.string(), z.string()),
});

export const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  seoMetadata: z
    .object({
      title: z.string(),
      description: z.string(),
      keywords: z.array(z.string()),
    })
    .optional(),
  variants: z.array(productVariantSchema).min(1),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
