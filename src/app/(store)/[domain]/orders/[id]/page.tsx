import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { orders, orderItems, orderReturns } from "@/lib/db/schema/orders";
import { productVariants, products } from "@/lib/db/schema/products";
import { eq } from "drizzle-orm";
import { formatCurrency } from "@/features/shared/utils/format";
import { CustomerOrderActions } from "@/features/orders/components/customer-order-actions";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import Image from "next/image";
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
      variantId: orderItems.variantId,
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

  const returnClaims = await db
    .select()
    .from(orderReturns)
    .where(eq(orderReturns.orderId, order.id));

  const steps = ["pending", "processing", "shipped", "delivered"];
  const currentStepIndex = steps.indexOf(order.status.toLowerCase());

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8 lg:px-12">
      <div className="rounded-2xl border border-zinc-200/60 bg-white p-8 dark:border-zinc-800/60 dark:bg-zinc-950 space-y-10 shadow-sm">
        <div className="text-center space-y-3">
          {order.status === "cancelled" ? (
            <span className="inline-flex h-14 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/20">
              ✗
            </span>
          ) : (
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20">
              ✓
            </span>
          )}
          <h1 className="text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
            {order.status === "cancelled" ? "Order Cancelled" : "Order Confirmed"}
          </h1>
          <p className="text-xs text-zinc-400">
            Order ID{" "}
            <span className="font-mono text-zinc-900 dark:text-zinc-100 font-bold bg-zinc-50 dark:bg-zinc-900 px-2 py-1 rounded">
              {order.id}
            </span>
          </p>
        </div>

        {order.status !== "cancelled" && (
          <div className="border-t border-b border-zinc-100 dark:border-zinc-900 py-8">
            <div className="flex justify-between items-center max-w-md mx-auto">
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                return (
                  <div
                    key={step}
                    className="flex flex-col items-center space-y-2 relative flex-1 last:flex-none"
                  >
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCompleted
                          ? "bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950"
                          : "bg-zinc-100 text-zinc-400 dark:bg-zinc-900"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {step}
                    </span>
                    {idx < steps.length - 1 && (
                      <div
                        className={`absolute left-1/2 top-3 w-full h-[1px] -z-10 ${
                          idx < currentStepIndex
                            ? "bg-zinc-950 dark:bg-zinc-50"
                            : "bg-zinc-100 dark:bg-zinc-900"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-zinc-100 dark:border-zinc-900 pb-8">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Shipping Details
            </h3>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1 leading-relaxed bg-zinc-50/50 dark:bg-zinc-900/30 p-4 rounded-xl border">
              <p className="font-bold text-zinc-950 dark:text-zinc-50">
                {order.shippingAddress.name}
              </p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p className="font-bold uppercase tracking-wider text-[9px] mt-1 text-zinc-950 dark:text-zinc-50">
                {order.shippingAddress.country}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Order Status
            </h3>
            <div className="flex flex-col gap-2 p-4 rounded-xl border bg-zinc-50/50 dark:bg-zinc-900/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Order Progress</span>
                <OrderStatusBadge type="status" value={order.status} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Payment Status</span>
                <OrderStatusBadge type="payment" value={order.paymentStatus} />
              </div>
              {order.trackingCode && (
                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-dashed">
                  <span className="text-zinc-500">Tracking Code</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border">
                    {order.trackingCode}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Ordered Items
          </h3>
          <div className="divide-y divide-zinc-150 dark:divide-zinc-850">
            {itemsList.map((item) => (
              <div key={item.id} className="flex justify-between py-4 text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-zinc-950 dark:text-zinc-50">
                    {item.productName || "Product Catalog Item"}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-mono">SKU: {item.sku || "N/A"}</p>
                  {item.attributes && (
                    <p className="text-[10px] text-zinc-400">
                      {Object.entries(item.attributes as Record<string, string>)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")}
                    </p>
                  )}
                </div>
                <div className="text-right space-y-0.5">
                  <p className="font-bold text-zinc-950 dark:text-zinc-50">
                    {formatCurrency(parseFloat(item.price))}
                  </p>
                  <p className="text-zinc-400">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {returnClaims.length > 0 && (
          <div className="border-t border-zinc-100 dark:border-zinc-900 pt-6 space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest text-red-600">
              Return Claims Submitted
            </h3>
            <div className="space-y-3">
              {returnClaims.map((claim) => {
                const item = itemsList.find((i) => i.variantId === claim.variantId);
                return (
                  <div
                    key={claim.id}
                    className="rounded-xl border p-4 text-xs space-y-3 bg-red-50/5 dark:bg-red-950/5"
                  >
                    <div className="flex justify-between">
                      <span className="font-bold">
                        {item?.productName || "Catalog Item"} ({item?.sku})
                      </span>
                      <span className="font-mono uppercase font-bold text-amber-600">
                        {claim.status}
                      </span>
                    </div>
                    <p className="text-zinc-500 leading-relaxed">Reason: {claim.reason}</p>
                    {claim.imageUrl && (
                      <div className="relative h-16 w-16 overflow-hidden rounded-lg border">
                        <Image
                          src={claim.imageUrl}
                          alt="Defect proof"
                          width={64}
                          height={64}
                          unoptimized
                          className="object-cover h-full w-full"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="border-t border-zinc-100 dark:border-zinc-900 pt-6 space-y-2.5 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(parseFloat(order.subtotalAmount))}
            </span>
          </div>
          {parseFloat(order.discountAmount) > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span className="font-semibold">
                -{formatCurrency(parseFloat(order.discountAmount))}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tax</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(parseFloat(order.taxAmount))}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(parseFloat(order.shippingAmount))}
            </span>
          </div>
          <div className="flex justify-between pt-3 border-t text-sm font-extrabold text-zinc-950 dark:text-zinc-50">
            <span>Total Amount Paid</span>
            <span className="text-base font-extrabold">
              {formatCurrency(parseFloat(order.totalAmount))}
            </span>
          </div>
        </div>

        <CustomerOrderActions
          orderId={order.id}
          status={order.status}
          domain={domain}
          items={itemsList.map((i) => ({
            variantId: i.variantId,
            sku: i.sku,
            productName: i.productName,
          }))}
        />

        <div className="pt-6 text-center">
          <Link
            href={`/${domain}`}
            className="inline-block rounded-full bg-zinc-950 px-8 py-3.5 text-xs font-bold text-white shadow-lg transition-all duration-300 hover:bg-zinc-800"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
