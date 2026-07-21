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
    <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 dark:border-zinc-800/60 dark:bg-zinc-950 space-y-6 shadow-sm">
      <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Order Summary</h2>
      {couponElement}
      <div className="space-y-3.5 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="font-semibold text-zinc-950 dark:text-zinc-50">
            {formatCurrency(parseFloat(totals.subtotal))}
          </span>
        </div>
        {parseFloat(totals.discountAmount) > 0 && (
          <div className="flex items-center justify-between text-emerald-600">
            <span>Discount (incl. BOGO)</span>
            <span className="font-semibold">
              -{formatCurrency(parseFloat(totals.discountAmount))}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span>Tax</span>
          <span className="font-semibold text-zinc-950 dark:text-zinc-50">
            {formatCurrency(parseFloat(totals.taxAmount))}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 pt-4">
          <span>Shipping Estimate</span>
          <span className="font-semibold text-zinc-950 dark:text-zinc-50">
            {formatCurrency(parseFloat(totals.shippingAmount))}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 pt-4 text-sm font-extrabold text-zinc-950 dark:text-zinc-50">
          <span>Order Total</span>
          <span className="text-base font-extrabold">
            {formatCurrency(parseFloat(totals.total))}
          </span>
        </div>
      </div>
      <div className="pt-2">
        <Link
          href={`/${domain}/checkout`}
          className="block w-full rounded-full bg-zinc-950 py-3.5 text-center text-xs font-bold text-white shadow-lg transition-all duration-300 hover:bg-zinc-800 hover:scale-[1.005] active:scale-[0.99] dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Proceed to Secure Checkout
        </Link>
      </div>
    </div>
  );
}
