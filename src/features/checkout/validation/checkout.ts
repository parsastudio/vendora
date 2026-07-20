import { z } from "zod";

export const checkoutSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
  line1: z.string().min(1),
  line2: z.string().optional().nullable(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  couponCode: z.string().optional().nullable(),
  tenantId: z.string().min(1),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().min(1),
      }),
    )
    .min(1),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
