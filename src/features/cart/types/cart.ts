export interface CartItem {
  variantId: string;
  sku: string;
  name: string;
  price: string;
  quantity: number;
  attributes: Record<string, string>;
}

export interface DiscountValidation {
  valid: boolean;
  code?: string;
  type?: "percentage" | "fixed";
  value?: string;
  error?: string;
}

export interface CartCalculationResult {
  subtotal: string;
  discountAmount: string;
  taxAmount: string;
  shippingAmount: string;
  total: string;
  items: {
    variantId: string;
    price: string;
    quantity: number;
    subtotal: string;
  }[];
}
