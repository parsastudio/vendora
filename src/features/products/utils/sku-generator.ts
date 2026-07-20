import { randomInt } from "crypto";

export function generateSKU(productName: string, attributes: Record<string, string>): string {
  const prefix = "VEN";
  const productCode = productName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4);

  const attributeString = Object.values(attributes)
    .map((val) =>
      val
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 3),
    )
    .join("-");

  const randomSuffix = randomInt(100, 1000).toString();

  return attributeString
    ? `${prefix}-${productCode}-${attributeString}-${randomSuffix}`
    : `${prefix}-${productCode}-${randomSuffix}`;
}
