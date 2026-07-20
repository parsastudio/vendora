"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { useCartStore } from "@/features/cart/store/use-cart-store";
import { formatCurrency } from "@/features/shared/utils/format";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface CartPageContentProps {
  tenantId: string;
  domain: string;
}

export function CartPageContent({ tenantId, domain }: CartPageContentProps) {
  const { data: session } = useSession();
  const { items, updateQuantity, removeItem, couponCode, setCouponCode, mergeCart } =
    useCartStore();
  const [couponInput, setCouponInput] = useState(couponCode || "");
  const [totals, setTotals] = useState({
    subtotal: "0.00",
    discountAmount: "0.00",
    taxAmount: "0.00",
    shippingAmount: "0.00",
    total: "0.00",
  });
  const [couponError, setCouponError] = useState<string | null>(null);

  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!isClient || !session?.user) return;

    const executeMerge = async () => {
      if (items.length === 0) return;
      try {
        const response = await fetch("/api/store/cart/merge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guestItems: items }),
        });
        const result = await response.json();
        if (result.success) {
          const dbMergedItems = result.data.map(
            (item: { variantId: string; quantity: number }) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              sku: "",
              name: "Merged Store Item",
              price: "0.00",
              attributes: {},
            }),
          );
          mergeCart(dbMergedItems);
        }
      } catch (err) {
        console.error(err);
      }
    };

    executeMerge();
  }, [session, isClient]);

  useEffect(() => {
    if (!isClient) return;

    const validateAndRecalculate = async () => {
      if (items.length === 0) {
        setTotals({
          subtotal: "0.00",
          discountAmount: "0.00",
          taxAmount: "0.00",
          shippingAmount: "0.00",
          total: "0.00",
        });
        return;
      }

      try {
        const response = await fetch("/api/store/cart/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            couponCode: couponCode || null,
            tenantId,
          }),
        });
        const result = await response.json();
        if (result.success) {
          setTotals(result.data.calculation);
          if (result.data.coupon?.error) {
            setCouponError(result.data.coupon.error);
          } else {
            setCouponError(null);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    validateAndRecalculate();
  }, [items, couponCode, tenantId, isClient]);

  if (!isClient) {
    return (
      <div className="mt-12 flex h-40 items-center justify-center text-sm text-zinc-500">
        Loading shopping details...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16 dark:border-zinc-800 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Your shopping cart is currently empty.
        </p>
        <Link
          href={`/${domain}`}
          className="mt-4 rounded-full bg-zinc-950 px-5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Return to Storefront
        </Link>
      </div>
    );
  }

  const hasBogoActive = items.some(
    (item) => item.attributes.color === "black" || item.attributes.bogo === "true",
  );

  return (
    <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
      <section className="lg:col-span-7 space-y-6">
        {hasBogoActive && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 dark:border-emerald-950/20 dark:bg-emerald-950/5">
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
              🎁 Multi-Buy Automatic Discount applied: Buy 1 Get 1 Free on all selected Black
              variants!
            </p>
          </div>
        )}

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-6">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4 last:border-0 last:pb-0"
            >
              <div>
                <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  {item.name}
                </h3>
                <p className="text-xs text-zinc-500">{formatCurrency(parseFloat(item.price))}</p>
                {(item.attributes.color === "black" || item.attributes.bogo === "true") && (
                  <span className="inline-block mt-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">
                    BOGO Eligible
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                  className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-bold dark:bg-zinc-800 text-zinc-950"
                >
                  -
                </button>
                <span className="text-xs font-medium text-zinc-950 dark:text-zinc-50">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                  className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-bold dark:bg-zinc-800 text-zinc-950"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item.variantId)}
                  className="ml-4 text-xs font-semibold text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 lg:col-span-5 lg:mt-0 space-y-6">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Order summary</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Promo Code
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="block w-full rounded-md border border-zinc-300 px-3 py-1.5 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50"
                placeholder="SUMMER15"
              />
              <button
                onClick={() => setCouponCode(couponInput || null)}
                className="rounded bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white dark:bg-zinc-50 dark:text-zinc-950"
              >
                Apply
              </button>
            </div>
            {couponError && <p className="mt-1 text-[10px] text-red-500">{couponError}</p>}
          </div>
        </div>

        <div className="space-y-4 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-medium text-zinc-950 dark:text-zinc-50">
              {formatCurrency(parseFloat(totals.subtotal))}
            </span>
          </div>
          {parseFloat(totals.discountAmount) > 0 && (
            <div className="flex items-center justify-between text-emerald-600">
              <span>Discount (incl. BOGO)</span>
              <span>-{formatCurrency(parseFloat(totals.discountAmount))}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span>Tax</span>
            <span>{formatCurrency(parseFloat(totals.taxAmount))}</span>
          </div>
          <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <span>Shipping estimate</span>
            <span className="font-medium text-zinc-950 dark:text-zinc-50">
              {formatCurrency(parseFloat(totals.shippingAmount))}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4 text-base font-bold text-zinc-900 dark:text-zinc-50">
            <span>Order total</span>
            <span>{formatCurrency(parseFloat(totals.total))}</span>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href={`/${domain}/checkout`}
            className="block w-full rounded-full bg-zinc-950 py-3.5 text-center text-xs font-bold text-white hover:bg-zinc-850 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Proceed to Secure Checkout
          </Link>
        </div>
      </section>
    </div>
  );
}
