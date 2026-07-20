import { db } from "@/lib/db";
import { orders, orderItems, transactions, orderReturns } from "@/lib/db/schema/orders";
import { productVariants, products } from "@/lib/db/schema/products";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { redirect, notFound } from "next/navigation";
import { formatCurrency, formatDateTime } from "@/features/shared/utils/format";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { OrderReceiptButton } from "@/features/orders/components/order-receipt-button";
import { updateReturnRequestStatus } from "@/features/orders/actions/customer-order";
import Image from "next/image";
import {
  updateOrderStatus,
  updateOrderPaymentStatus,
  updateOrderTracking,
} from "@/features/orders/actions/order";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const tenantId = session.user.tenantId;

  const orderResult = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.tenantId, tenantId)))
    .limit(1);

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

  const txnList = await db.select().from(transactions).where(eq(transactions.orderId, order.id));

  const returnClaims = await db
    .select()
    .from(orderReturns)
    .where(eq(orderReturns.orderId, order.id));

  const handleStatusUpdate = async (formData: FormData) => {
    "use server";
    const status = formData.get("status") as string;
    await updateOrderStatus(id, status);
  };

  const handlePaymentUpdate = async (formData: FormData) => {
    "use server";
    const status = formData.get("paymentStatus") as string;
    await updateOrderPaymentStatus(id, status);
  };

  const handleTrackingUpdate = async (formData: FormData) => {
    "use server";
    const code = formData.get("trackingCode") as string;
    await updateOrderTracking(id, code);
  };

  const handleReturnClaim = async (returnId: string, status: string) => {
    "use server";
    await updateReturnRequestStatus(returnId, status, id);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              Order {order.id}
            </h1>
            <OrderStatusBadge type="status" value={order.status} />
            <OrderStatusBadge type="payment" value={order.paymentStatus} />
          </div>
          <p className="text-xs text-zinc-500">Received on {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <OrderReceiptButton orderId={order.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
              Ordered Catalog Items
            </h3>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {itemsList.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between py-4 text-xs first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-semibold text-zinc-950 dark:text-zinc-50">
                      {item.productName || "Product Catalog Item"}
                    </p>
                    <p className="text-zinc-400">SKU: {item.sku || "N/A"}</p>
                    {item.attributes && (
                      <p className="text-[10px] text-zinc-400">
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

          {returnClaims.length > 0 && (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
              <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 text-red-600">
                Merchandise Return Claims Filed
              </h3>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 space-y-4 pt-2">
                {returnClaims.map((claim) => {
                  const targetItem = itemsList.find((i) => i.variantId === claim.variantId);
                  return (
                    <div key={claim.id} className="text-xs space-y-3 pt-4 first:pt-0">
                      <div className="flex justify-between">
                        <span className="font-semibold">
                          {targetItem?.productName || "Item"} ({targetItem?.sku})
                        </span>
                        <span className="font-mono uppercase font-bold text-amber-600">
                          {claim.status}
                        </span>
                      </div>
                      <p className="text-zinc-500">Reason: {claim.reason}</p>
                      {claim.imageUrl && (
                        <div className="relative h-20 w-24 overflow-hidden rounded border">
                          <Image
                            src={claim.imageUrl}
                            alt="Proof"
                            width={96}
                            height={80}
                            unoptimized
                            className="object-cover h-full w-full"
                          />
                        </div>
                      )}
                      {claim.status === "pending" && (
                        <div className="flex gap-2">
                          <form action={handleReturnClaim.bind(null, claim.id, "approved")}>
                            <button
                              type="submit"
                              className="rounded bg-emerald-600 px-3 py-1 font-bold text-white text-[10px]"
                            >
                              Approve return
                            </button>
                          </form>
                          <form action={handleReturnClaim.bind(null, claim.id, "rejected")}>
                            <button
                              type="submit"
                              className="rounded bg-red-600 px-3 py-1 font-bold text-white text-[10px]"
                            >
                              Reject return
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
              Audited Financial History
            </h3>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              {txnList.map((tx) => (
                <div key={tx.id} className="flex justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <span className="font-mono font-bold">{tx.id}</span>
                    <p className="text-zinc-400 uppercase text-[10px]">
                      Method: {tx.provider} | Ref: {tx.referenceId}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">{formatCurrency(parseFloat(tx.amount))}</span>
                    <p className="text-emerald-600 text-[10px] uppercase font-bold">{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
              Operational Actions
            </h3>

            <form action={handleStatusUpdate} className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">
                Change Order Status
              </label>
              <div className="flex gap-2">
                <select
                  name="status"
                  defaultValue={order.status}
                  className="flex-1 rounded-md border border-zinc-300 bg-zinc-50 px-2 py-1.5 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  type="submit"
                  className="rounded bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950"
                >
                  Apply
                </button>
              </div>
            </form>

            <form
              action={handlePaymentUpdate}
              className="space-y-1.5 pt-2 border-t border-zinc-150 dark:border-zinc-850"
            >
              <label className="text-[10px] font-bold text-zinc-400 uppercase">
                Change Payment Status
              </label>
              <div className="flex gap-2">
                <select
                  name="paymentStatus"
                  defaultValue={order.paymentStatus}
                  className="flex-1 rounded-md border border-zinc-300 bg-zinc-50 px-2 py-1.5 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
                <input type="hidden" name="orderId" value={order.id} />
                <button
                  type="submit"
                  className="rounded bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950"
                >
                  Apply
                </button>
              </div>
            </form>

            <form
              action={handleTrackingUpdate}
              className="space-y-1.5 pt-2 border-t border-zinc-150 dark:border-zinc-850"
            >
              <label className="text-[10px] font-bold text-zinc-400 uppercase">
                Fulfillment Tracking Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="trackingCode"
                  defaultValue={order.trackingCode || ""}
                  placeholder="e.g. USPS-94001000..."
                  className="flex-1 rounded-md border border-zinc-300 bg-zinc-50 px-2 py-1.5 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
                <button
                  type="submit"
                  className="rounded bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950"
                >
                  Save
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-3">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Delivery Address</h3>
            <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
              <p className="font-bold text-zinc-950 dark:text-zinc-50">
                {order.shippingAddress.name}
              </p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p className="font-semibold text-[10px] uppercase tracking-wider">
                {order.shippingAddress.country}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
