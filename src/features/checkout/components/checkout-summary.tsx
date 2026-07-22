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
    <div className="mt-16 lg:col-span-5 lg:mt-0 rounded-3xl border border-stone-200/50 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 space-y-6">
      <h2 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-zinc-100">
        Order Summary
      </h2>
      <div className="divide-y divide-stone-100 dark:divide-zinc-900">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex items-center justify-between py-4 text-xs first:pt-0 last:pb-0 font-semibold"
          >
            <div className="space-y-1">
              <span className="text-stone-950 dark:text-zinc-50">{item.name}</span>
              <p className="text-stone-400 font-medium">Qty: {item.quantity}</p>
            </div>
            <span className="font-mono text-stone-950 dark:text-zinc-50">
              {formatCurrency(parseFloat(item.price) * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-stone-100 dark:border-zinc-900 pt-5 space-y-3.5 text-xs text-stone-500 dark:text-zinc-400">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-semibold text-stone-950 dark:text-zinc-50">
            {formatCurrency(parseFloat(totals.subtotal))}
          </span>
        </div>
        {parseFloat(totals.discountAmount) > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Discount</span>
            <span className="font-semibold">
              -{formatCurrency(parseFloat(totals.discountAmount))}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Tax</span>
          <span className="font-semibold text-stone-950 dark:text-zinc-50">
            {formatCurrency(parseFloat(totals.taxAmount))}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Shipping Logistics</span>
          <span className="font-semibold text-stone-950 dark:text-zinc-50">
            {formatCurrency(parseFloat(totals.shippingAmount))}
          </span>
        </div>
        <div className="flex justify-between border-t border-stone-100 dark:border-zinc-900/50 pt-4 text-sm font-extrabold text-stone-950 dark:text-zinc-50">
          <span>Total Amount</span>
          <span className="text-base font-mono font-black">
            {formatCurrency(parseFloat(totals.total))}
          </span>
        </div>
      </div>
    </div>
  );
}
