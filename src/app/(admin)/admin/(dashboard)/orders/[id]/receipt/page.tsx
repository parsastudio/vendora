import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema/orders";
import { productVariants, products } from "@/lib/db/schema/products";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { redirect, notFound } from "next/navigation";
import { formatCurrency, formatDateTime } from "@/features/shared/utils/format";

interface ReceiptPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderReceiptPage({ params }: ReceiptPageProps) {
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
    <div className="min-h-screen bg-white p-8 text-zinc-955 font-sans antialiased">
      <div className="max-w-2xl mx-auto space-y-8 border border-zinc-200 p-8 rounded-lg shadow-sm">
        <div className="flex justify-between items-start border-b pb-6">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight uppercase">
              VENDORA COMMERCIAL RECEIPT
            </h1>
            <p className="text-xs text-zinc-500 mt-1">Tenant ID Reference: {order.tenantId}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase text-zinc-400">Order Ref</p>
            <p className="text-sm font-mono font-bold text-zinc-900">{order.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="font-bold text-zinc-400 uppercase tracking-wider text-[9px] mb-1">
              Billing Details
            </p>
            <p className="font-bold text-zinc-900">{order.shippingAddress.name}</p>
            <p className="text-zinc-600">{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && (
              <p className="text-zinc-600">{order.shippingAddress.line2}</p>
            )}
            <p className="text-zinc-600">
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
            </p>
            <p className="text-zinc-900 uppercase font-semibold text-[9px] mt-1">
              {order.shippingAddress.country}
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="font-bold text-zinc-400 uppercase tracking-wider text-[9px]">
              Receipt Metadata
            </p>
            <p className="text-zinc-600">Created: {formatDateTime(order.createdAt)}</p>
            <p className="text-zinc-600 font-bold uppercase">Status: {order.status}</p>
            <p className="text-zinc-600 font-bold uppercase">Payment: {order.paymentStatus}</p>
          </div>
        </div>

        <div>
          <table className="min-w-full divide-y divide-zinc-200 text-xs">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left font-bold uppercase text-zinc-400 text-[9px]">
                  Product Catalog Item
                </th>
                <th className="py-2 text-center font-bold uppercase text-zinc-400 text-[9px] w-20">
                  Quantity
                </th>
                <th className="py-2 text-right font-bold uppercase text-zinc-400 text-[9px] w-32">
                  Unit Price
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150">
              {itemsList.map((item) => (
                <tr key={item.id}>
                  <td className="py-3">
                    <p className="font-bold text-zinc-900">{item.productName}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">SKU: {item.sku || "N/A"}</p>
                    {item.attributes && (
                      <p className="text-[9px] text-zinc-400">
                        {Object.entries(item.attributes as Record<string, string>)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(", ")}
                      </p>
                    )}
                  </td>
                  <td className="py-3 text-center text-zinc-600 font-mono">{item.quantity}</td>
                  <td className="py-3 text-right font-bold text-zinc-900">
                    {formatCurrency(parseFloat(item.price))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t pt-4 space-y-2 text-xs text-zinc-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(parseFloat(order.subtotalAmount))}</span>
          </div>
          {parseFloat(order.discountAmount) > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Applied Discount</span>
              <span>-{formatCurrency(parseFloat(order.discountAmount))}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Corporate Tax (5%)</span>
            <span>{formatCurrency(parseFloat(order.taxAmount))}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping &amp; Logistics</span>
            <span>{formatCurrency(parseFloat(order.shippingAmount))}</span>
          </div>
          <div className="flex justify-between pt-3 border-t text-sm font-extrabold text-zinc-900">
            <span>Grand Total Paid (USD)</span>
            <span>{formatCurrency(parseFloat(order.totalAmount))}</span>
          </div>
        </div>

        <div className="border-t border-dashed pt-6 text-center text-[10px] text-zinc-400 uppercase tracking-widest">
          Thank you for shopping with us
        </div>
      </div>
    </div>
  );
}
