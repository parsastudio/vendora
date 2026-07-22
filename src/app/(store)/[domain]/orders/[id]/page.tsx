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
    <div className="mx-auto max-w-3xl px-6 py-20 sm:px-8">
      <div className="rounded-3xl border border-stone-200/40 bg-white p-8 dark:border-zinc-900/40 dark:bg-zinc-950 space-y-12">
        <div className="text-center space-y-4">
          {order.status === "cancelled" ? (
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/[0.06] text-rose-600 font-black text-xl">
              ✗
            </span>
          ) : (
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/[0.06] text-emerald-600 font-black text-xl">
              ✓
            </span>
          )}
          <h1 className="text-3xl font-black text-stone-950 dark:text-zinc-50 tracking-tight">
            {order.status === "cancelled" ? "Order Cancelled" : "Order Confirmed"}
          </h1>
          <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">
            ID:{" "}
            <span className="font-mono font-bold text-stone-900 dark:text-zinc-100">
              {order.id}
            </span>
          </p>
        </div>

        {order.status !== "cancelled" && (
          <div className="border-t border-b border-stone-100 dark:border-zinc-900/50 py-10">
            <div className="flex justify-between items-center max-w-md mx-auto">
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                return (
                  <div
                    key={step}
                    className="flex flex-col items-center space-y-2 relative flex-1 last:flex-none"
                  >
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                        isCompleted
                          ? "bg-stone-950 text-white dark:bg-zinc-50 dark:text-zinc-950"
                          : "bg-stone-100 text-stone-400 dark:bg-zinc-900"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">
                      {step}
                    </span>
                    {idx < steps.length - 1 && (
                      <div
                        className={`absolute left-1/2 top-3 w-full h-[1px] -z-10 ${
                          idx < currentStepIndex
                            ? "bg-stone-950 dark:bg-zinc-50"
                            : "bg-stone-100 dark:bg-zinc-900"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-stone-100 dark:border-zinc-900/50 pb-10">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
              Shipping Address
            </h3>
            <div className="text-xs text-stone-500 dark:text-zinc-400 space-y-1.5 leading-relaxed bg-stone-50/50 dark:bg-zinc-900/10 p-6 rounded-2xl border border-stone-100 dark:border-zinc-900/50 font-semibold">
              <p className="font-black text-stone-950 dark:text-zinc-50">
                {order.shippingAddress.name}
              </p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p className="font-black uppercase tracking-widest text-[9px] mt-2 text-stone-400">
                {order.shippingAddress.country}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
              Status Metrics
            </h3>
            <div className="flex flex-col gap-3 p-6 rounded-2xl border border-stone-100 dark:border-zinc-900/50 bg-stone-50/50 dark:bg-zinc-900/10 font-semibold">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400">Order Progress</span>
                <OrderStatusBadge type="status" value={order.status} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400">Payment Audit</span>
                <OrderStatusBadge type="payment" value={order.paymentStatus} />
              </div>
              {order.trackingCode && (
                <div className="flex items-center justify-between text-xs pt-3 border-t border-dashed border-stone-200 dark:border-zinc-800">
                  <span className="text-stone-400">Tracking Ref</span>
                  <span className="font-mono font-bold text-stone-955 dark:text-zinc-50">
                    {order.trackingCode}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
            Ordered Items
          </h3>
          <div className="divide-y divide-stone-100 dark:divide-zinc-900/50">
            {itemsList.map((item) => (
              <div key={item.id} className="flex justify-between py-4 text-xs font-semibold">
                <div className="space-y-1">
                  <p className="font-bold text-stone-955 dark:text-zinc-50">
                    {item.productName || "Product Catalog Item"}
                  </p>
                  <p className="text-[9px] text-stone-400 font-mono">SKU: {item.sku || "N/A"}</p>
                  {item.attributes && (
                    <p className="text-[10px] text-stone-400">
                      {Object.entries(item.attributes as Record<string, string>)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")}
                    </p>
                  )}
                </div>
                <div className="text-right space-y-1 font-semibold">
                  <p className="font-bold text-stone-955 dark:text-zinc-50 font-mono">
                    {formatCurrency(parseFloat(item.price))}
                  </p>
                  <p className="text-stone-400">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {returnClaims.length > 0 && (
          <div className="border-t border-stone-100 dark:border-zinc-900 pt-8 space-y-6">
            <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
              Merchandise Returns Claims
            </h3>
            <div className="space-y-4">
              {returnClaims.map((claim) => {
                const item = itemsList.find((i) => i.variantId === claim.variantId);
                return (
                  <div
                    key={claim.id}
                    className="rounded-2xl border p-5 text-xs font-semibold space-y-3 bg-stone-50/20 dark:bg-zinc-900/10"
                  >
                    <div className="flex justify-between">
                      <span className="font-bold">
                        {item?.productName || "Catalog Item"} ({item?.sku})
                      </span>
                      <span className="font-mono uppercase font-black text-amber-600 dark:text-amber-500">
                        {claim.status}
                      </span>
                    </div>
                    <p className="text-stone-450 dark:text-zinc-400 font-medium leading-relaxed">
                      Reason: {claim.reason}
                    </p>
                    {claim.imageUrl && (
                      <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-stone-200/40">
                        <Image
                          src={claim.imageUrl}
                          alt="Verification metadata"
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

        <div className="border-t border-stone-100 dark:border-zinc-900/50 pt-8 space-y-3 text-xs text-stone-500 dark:text-zinc-400">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-stone-950 dark:text-zinc-50">
              {formatCurrency(parseFloat(order.subtotalAmount))}
            </span>
          </div>
          {parseFloat(order.discountAmount) > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Applied Discount</span>
              <span className="font-semibold">
                -{formatCurrency(parseFloat(order.discountAmount))}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Corporate Tax</span>
            <span className="font-semibold text-stone-950 dark:text-zinc-50">
              {formatCurrency(parseFloat(order.taxAmount))}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Logistics</span>
            <span className="font-semibold text-stone-950 dark:text-zinc-50">
              {formatCurrency(parseFloat(order.shippingAmount))}
            </span>
          </div>
          <div className="flex justify-between pt-4 border-t border-stone-100 dark:border-zinc-900/50 text-sm font-extrabold text-stone-950 dark:text-zinc-50">
            <span>Total Volume Paid</span>
            <span className="text-lg font-black font-mono">
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

        <div className="pt-8 text-center">
          <Link
            href={`/${domain}`}
            className="inline-block rounded-full bg-stone-950 px-10 py-4 text-xs font-bold text-white shadow-xl hover:bg-stone-850"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
