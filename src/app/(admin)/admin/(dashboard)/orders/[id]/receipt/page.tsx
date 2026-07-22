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
    <div className="min-h-screen bg-stone-50 p-8 text-stone-900 font-sans antialiased">
      <div className="max-w-2xl mx-auto space-y-8 bg-white border border-stone-200 p-8 rounded-3xl">
        <div className="flex justify-between items-start border-b border-stone-150 pb-6">
          <div className="space-y-1">
            <h1 className="text-sm font-black uppercase tracking-widest">VENDORA TAX INVOICE</h1>
            <p className="text-[10px] text-stone-400 font-mono font-bold">
              WORKSPACE ID: {order.tenantId}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase text-stone-400 tracking-widest">
              Order Ref
            </p>
            <p className="text-xs font-mono font-black text-stone-900">{order.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
          <div className="space-y-1.5">
            <p className="font-black text-stone-400 uppercase tracking-widest text-[9px]">
              Billing Details
            </p>
            <p className="font-black text-stone-900">{order.shippingAddress.name}</p>
            <p className="text-stone-500">{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && (
              <p className="text-stone-500">{order.shippingAddress.line2}</p>
            )}
            <p className="text-stone-500">
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
            </p>
            <p className="text-stone-900 uppercase font-black tracking-widest text-[9px] pt-1">
              {order.shippingAddress.country}
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="font-black text-stone-400 uppercase tracking-widest text-[9px] mb-1">
              Receipt Metadata
            </p>
            <p className="text-stone-500 font-mono">Date: {formatDateTime(order.createdAt)}</p>
            <p className="text-stone-500 font-black uppercase text-[10px]">
              Status: {order.status}
            </p>
            <p className="text-stone-500 font-black uppercase text-[10px]">
              Payment: {order.paymentStatus}
            </p>
          </div>
        </div>

        <div>
          <table className="min-w-full divide-y divide-stone-150 text-xs">
            <thead>
              <tr className="border-b border-stone-150">
                <th className="py-3 text-left font-black uppercase text-stone-400 text-[9px] tracking-widest">
                  Catalogue Product
                </th>
                <th className="py-3 text-center font-black uppercase text-stone-400 text-[9px] w-20 tracking-widest">
                  Qty
                </th>
                <th className="py-3 text-right font-black uppercase text-stone-400 text-[9px] w-32 tracking-widest">
                  Price
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-semibold">
              {itemsList.map((item) => (
                <tr key={item.id}>
                  <td className="py-4">
                    <p className="font-black text-stone-900">{item.productName}</p>
                    <p className="text-[9px] text-stone-400 font-mono">SKU: {item.sku || "N/A"}</p>
                    {item.attributes && (
                      <p className="text-[10px] text-stone-400 mt-1">
                        {Object.entries(item.attributes as Record<string, string>)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(", ")}
                      </p>
                    )}
                  </td>
                  <td className="py-4 text-center text-stone-500 font-mono">{item.quantity}</td>
                  <td className="py-4 text-right font-black text-stone-900 font-mono">
                    {formatCurrency(parseFloat(item.price))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-stone-150 pt-5 space-y-2.5 text-xs text-stone-500 font-semibold">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-mono text-stone-900">
              {formatCurrency(parseFloat(order.subtotalAmount))}
            </span>
          </div>
          {parseFloat(order.discountAmount) > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Applied Discount</span>
              <span className="font-mono">-{formatCurrency(parseFloat(order.discountAmount))}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Corporate Tax</span>
            <span className="font-mono text-stone-900">
              {formatCurrency(parseFloat(order.taxAmount))}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Logistics</span>
            <span className="font-mono text-stone-900">
              {formatCurrency(parseFloat(order.shippingAmount))}
            </span>
          </div>
          <div className="flex justify-between pt-4 border-t border-stone-150 text-sm font-extrabold text-stone-900">
            <span>Total Amount (USD)</span>
            <span className="font-mono font-black">
              {formatCurrency(parseFloat(order.totalAmount))}
            </span>
          </div>
        </div>

        <div className="border-t border-dashed border-stone-200 pt-6 text-center text-[9px] text-stone-400 font-black uppercase tracking-widest">
          Thank you for shopping with us
        </div>
      </div>
    </div>
  );
}
