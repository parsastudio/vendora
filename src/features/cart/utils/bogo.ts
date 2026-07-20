import Decimal from "decimal.js";
import { CartItem } from "../types/cart";

export interface BogoDiscountResult {
  discountAmount: string;
  appliedSkus: string[];
}

export function calculateBogoDiscount(items: CartItem[]): BogoDiscountResult {
  let discountDec = new Decimal("0.00");
  const appliedSkus: string[] = [];

  const bogoEligible = items.filter(
    (item) => item.attributes.color === "black" || item.attributes.bogo === "true",
  );

  if (bogoEligible.length < 2) {
    return { discountAmount: "0.00", appliedSkus };
  }

  const flattenedPrices: { price: Decimal; sku: string }[] = [];
  for (const item of bogoEligible) {
    const priceDec = new Decimal(item.price);
    for (let i = 0; i < item.quantity; i++) {
      flattenedPrices.push({ price: priceDec, sku: item.sku });
    }
  }

  flattenedPrices.sort((a, b) => b.price.sub(a.price).toNumber());

  const pairsCount = Math.floor(flattenedPrices.length / 2);
  for (let i = 0; i < pairsCount; i++) {
    const freeItemIndex = flattenedPrices.length - 1 - i;
    const freeItem = flattenedPrices[freeItemIndex];
    discountDec = discountDec.add(freeItem.price);
    if (!appliedSkus.includes(freeItem.sku)) {
      appliedSkus.push(freeItem.sku);
    }
  }

  return {
    discountAmount: discountDec.toFixed(2),
    appliedSkus,
  };
}
