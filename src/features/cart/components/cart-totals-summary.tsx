"use client";

import { formatCurrency } from "@/features/shared/utils/format";
import Link from "next/link";

interface CartTotalsSummaryProps {
  totals: {
    subtotal: string;
    discountAmount: string;
    taxAmount: string;
    shippingAmount: string;
    total: string;
  };
  domain: string;
  couponElement: React.ReactNode;
}

export function CartTotalsSummary({ totals, domain, couponElement }: CartTotalsSummaryProps) {
  return (
    <div className="rounded-3xl border border-stone-200/40 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 space-y-6">
      <h2 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-zinc-100">
        Order Summary
      </h2>
      {couponElement}
      <div className="space-y-4 text-xs text-stone-500 dark:text-zinc-400">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="font-semibold text-stone-950 dark:text-zinc-50 font-mono">
            {formatCurrency(parseFloat(totals.subtotal))}
          </span>
        </div>
        {parseFloat(totals.discountAmount) > 0 && (
          <div className="flex items-center justify-between text-emerald-600">
            <span>Discount (incl. BOGO)</span>
            <span className="font-semibold font-mono">
              -{formatCurrency(parseFloat(totals.discountAmount))}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span>Tax</span>
          <span className="font-semibold text-stone-950 dark:text-zinc-50 font-mono">
            {formatCurrency(parseFloat(totals.taxAmount))}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-stone-100 dark:border-zinc-900 pt-4">
          <span>Shipping Logistics</span>
          <span className="font-semibold text-stone-950 dark:text-zinc-50 font-mono">
            {formatCurrency(parseFloat(totals.shippingAmount))}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-stone-100 dark:border-zinc-900 pt-4 text-sm font-extrabold text-stone-950 dark:text-zinc-50">
          <span>Order Total</span>
          <span className="text-base font-black font-mono">
            {formatCurrency(parseFloat(totals.total))}
          </span>
        </div>
      </div>
      <div className="pt-2">
        <Link
          href={`/${domain}/checkout`}
          className="block w-full rounded-full bg-stone-950 py-4 text-center text-xs font-bold text-white shadow-xl hover:bg-stone-850"
        >
          Proceed to Secure Checkout
        </Link>
      </div>
    </div>
  );
}
