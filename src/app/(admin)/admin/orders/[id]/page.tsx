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
import { AdminOrderReturns } from "@/features/orders/components/admin-order-returns";
import { AdminOrderFinancials } from "@/features/orders/components/admin-order-financials";
import { AdminOrderOperations } from "@/features/orders/components/admin-order-operations";

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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 font-mono">
              Order {order.id}
            </h1>
            <OrderStatusBadge type="status" value={order.status} />
            <OrderStatusBadge type="payment" value={order.paymentStatus} />
          </div>
          <p className="text-xs text-zinc-400 font-medium">
            Received on {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <OrderReceiptButton orderId={order.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800/40 dark:bg-zinc-950 space-y-6">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
              Ordered Catalog Items
            </h3>
            <div className="divide-y divide-zinc-150 dark:divide-zinc-850">
              {itemsList.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between py-4 first:pt-0 last:pb-0 text-xs font-semibold"
                >
                  <div className="space-y-1">
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
                  <div className="text-right space-y-1">
                    <p className="font-bold text-zinc-950 dark:text-zinc-50 font-mono">
                      {formatCurrency(parseFloat(item.price))}
                    </p>
                    <p className="text-zinc-400">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {returnClaims.length > 0 && (
            <AdminOrderReturns
              orderId={order.id}
              returnClaims={returnClaims}
              itemsList={itemsList}
            />
          )}

          <AdminOrderFinancials txnList={txnList} />
        </div>

        <div className="space-y-6 lg:col-span-1">
          <AdminOrderOperations
            orderId={order.id}
            status={order.status}
            paymentStatus={order.paymentStatus}
            trackingCode={order.trackingCode}
          />

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800/40 dark:bg-zinc-950 space-y-4">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Delivery Address</h3>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1 leading-relaxed">
              <p className="font-bold text-zinc-950 dark:text-zinc-50 mb-2">
                {order.shippingAddress.name}
              </p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p className="font-bold text-[9px] uppercase tracking-widest text-zinc-900 dark:text-zinc-100 mt-2">
                {order.shippingAddress.country}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
