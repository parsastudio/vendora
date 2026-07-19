import Decimal from "decimal.js";
import { CartItem, CartCalculationResult } from "../types/cart";

export function calculateCartTotals(
  items: CartItem[],
  discountType: "percentage" | "fixed" | null,
  discountValue: string | null,
  taxRatePercent: number = 5,
  shippingFlatRate: string = "10.00",
): CartCalculationResult {
  let subtotalDec = new Decimal("0.00");
  const calculatedItems = items.map((item) => {
    const priceDec = new Decimal(item.price);
    const itemSubtotal = priceDec.mul(item.quantity);
    subtotalDec = subtotalDec.add(itemSubtotal);
    return {
      variantId: item.variantId,
      price: priceDec.toFixed(2),
      quantity: item.quantity,
      subtotal: itemSubtotal.toFixed(2),
    };
  });

  let discountDec = new Decimal("0.00");
  if (discountType && discountValue && subtotalDec.gt(0)) {
    if (discountType === "percentage") {
      const rate = new Decimal(discountValue).div(100);
      discountDec = subtotalDec.mul(rate);
    } else {
      discountDec = new Decimal(discountValue);
    }
  }

  if (discountDec.gt(subtotalDec)) {
    discountDec = subtotalDec;
  }

  const netSubtotal = subtotalDec.sub(discountDec);
  const taxRateDec = new Decimal(taxRatePercent).div(100);
  const taxDec = netSubtotal.mul(taxRateDec);

  const shippingDec = subtotalDec.gt(0) ? new Decimal(shippingFlatRate) : new Decimal("0.00");
  const totalDec = netSubtotal.add(taxDec).add(shippingDec);

  return {
    subtotal: subtotalDec.toFixed(2),
    discountAmount: discountDec.toFixed(2),
    taxAmount: taxDec.toFixed(2),
    shippingAmount: shippingDec.toFixed(2),
    total: Decimal.max(0, totalDec).toFixed(2),
    items: calculatedItems,
  };
}
