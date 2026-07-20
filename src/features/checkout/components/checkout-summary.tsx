import { formatCurrency } from "@/features/shared/utils/format";
import { CartItem } from "@/features/cart/types/cart";

interface CheckoutSummaryProps {
  items: CartItem[];
  totals: {
    subtotal: string;
    discountAmount: string;
    taxAmount: string;
    shippingAmount: string;
    total: string;
  };
}

export function CheckoutSummary({ items, totals }: CheckoutSummaryProps) {
  return (
    <div className="mt-16 lg:col-span-5 lg:mt-0 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-6">
      <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Order Summary</h2>
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {items.map((item) => (
          <div key={item.variantId} className="flex items-center justify-between py-4 text-xs">
            <div>
              <span className="font-semibold text-zinc-950 dark:text-zinc-50">{item.name}</span>
              <p className="text-zinc-400">Qty: {item.quantity}</p>
            </div>
            <span className="font-bold text-zinc-950 dark:text-zinc-50">
              {formatCurrency(parseFloat(item.price) * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(parseFloat(totals.subtotal))}</span>
        </div>
        {parseFloat(totals.discountAmount) > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Discount</span>
            <span>-{formatCurrency(parseFloat(totals.discountAmount))}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Tax</span>
          <span>{formatCurrency(parseFloat(totals.taxAmount))}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping estimate</span>
          <span>{formatCurrency(parseFloat(totals.shippingAmount))}</span>
        </div>
        <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-800 pt-3 text-sm font-bold text-zinc-900 dark:text-zinc-50">
          <span>Total</span>
          <span>{formatCurrency(parseFloat(totals.total))}</span>
        </div>
      </div>
    </div>
  );
}
