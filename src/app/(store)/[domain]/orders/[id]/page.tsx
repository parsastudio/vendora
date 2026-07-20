import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema/orders";
import { productVariants, products } from "@/lib/db/schema/products";
import { eq } from "drizzle-orm";
import { formatCurrency } from "@/features/shared/utils/format";
import Link from "next/link";

interface OrderSuccessPageProps {
  params: Promise<{ domain: string; id: string }>;
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const resolvedParams = await params;
  const { domain, id } = resolvedParams;

  const orderResult = await db.select().from(orders).where(eq(orders.id, id)).limit(1);

  if (orderResult.length === 0) {
    notFound();
  }

  const order = orderResult[0];

  const itemsList = await db
    .select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      price: orderItems.price,
      sku: productVariants.sku,
      productName: products.name,
      attributes: productVariants.attributes,
    })
    .from(orderItems)
    .leftJoin(productVariants, eq(orderItems.variantId, productVariants.id))
    .leftJoin(products, eq(productVariants.productId, products.id))
    .where(eq(orderItems.orderId, order.id));

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950 space-y-8 shadow-sm">
        <div className="text-center space-y-2">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400">
            ✓
          </span>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Thank you for your order!
          </h1>
          <p className="text-xs text-zinc-500">
            Your order{" "}
            <span className="font-mono text-zinc-700 dark:text-zinc-300 font-bold">{order.id}</span>{" "}
            has been processed.
          </p>
        </div>

        <div className="border-t border-b border-zinc-200 dark:border-zinc-800 py-6 space-y-4">
          <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Shipping Details</h3>
          <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
            <p className="font-semibold text-zinc-950 dark:text-zinc-50">
              {order.shippingAddress.name}
            </p>
            <p>{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Ordered Items</h3>
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {itemsList.map((item) => (
              <div key={item.id} className="flex justify-between py-4 text-xs">
                <div>
                  <p className="font-semibold text-zinc-950 dark:text-zinc-50">
                    {item.productName || "Product Catalog Item"}
                  </p>
                  <p className="text-zinc-400">SKU: {item.sku || "N/A"}</p>
                  {item.attributes && (
                    <p className="text-zinc-400">
                      {Object.entries(item.attributes as Record<string, string>)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-zinc-950 dark:text-zinc-50">
                    {formatCurrency(parseFloat(item.price))}
                  </p>
                  <p className="text-zinc-400">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(parseFloat(order.subtotalAmount))}</span>
          </div>
          {parseFloat(order.discountAmount) > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span>-{formatCurrency(parseFloat(order.discountAmount))}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tax</span>
            <span>{formatCurrency(parseFloat(order.taxAmount))}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{formatCurrency(parseFloat(order.shippingAmount))}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-950 dark:text-zinc-50">
            <span>Total Amount Paid</span>
            <span>{formatCurrency(parseFloat(order.totalAmount))}</span>
          </div>
        </div>

        <div className="pt-6 text-center">
          <Link
            href={`/${domain}`}
            className="inline-block rounded-full bg-zinc-950 px-6 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
