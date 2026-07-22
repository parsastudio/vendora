"use client";

import { useCartStore } from "@/features/cart/store/use-cart-store";
import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { formatCurrency } from "@/features/shared/utils/format";
import Link from "next/link";
import { useParams } from "next/navigation";

interface CartDrawerProps {
  tenantId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ tenantId, isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, couponCode, setCouponCode } = useCartStore();
  const [couponInput, setCouponInput] = useState(couponCode || "");
  const [totals, setTotals] = useState({
    subtotal: "0.00",
    discountAmount: "0.00",
    taxAmount: "0.00",
    shippingAmount: "0.00",
    total: "0.00",
  });
  const [couponError, setCouponError] = useState<string | null>(null);
  const params = useParams();
  const domain = (params?.domain as string) || "";

  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
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
          if (result.data.stockIssues && result.data.stockIssues.length > 0) {
            for (const issue of result.data.stockIssues) {
              updateQuantity(issue.variantId, issue.available);
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    validateAndRecalculate();
  }, [items, couponCode, tenantId, updateQuantity]);

  if (!isOpen || !isClient) return null;

  const hasBogoActive = items.some(
    (item) => item.attributes.color === "black" || item.attributes.bogo === "true",
  );

  const drawerContent = (
    <div className="fixed inset-0 z-[100] overflow-hidden animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white p-8 shadow-2xl dark:bg-zinc-950 flex flex-col justify-between border-l border-stone-200/40 dark:border-zinc-900/30 animate-in slide-in-from-right duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-900/50 pb-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-zinc-50">
                Catalogue Cart
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2.5 hover:bg-stone-50 dark:hover:bg-zinc-900 text-stone-400 hover:text-stone-950 dark:hover:text-zinc-100"
              >
                Close
              </button>
            </div>

            <div className="mt-8 flex-1 overflow-y-auto space-y-6 pr-1 min-h-0">
              {hasBogoActive && (
                <div className="rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/20 p-4 text-[10px] text-emerald-800 dark:text-emerald-400 font-bold leading-relaxed">
                  🎁 Multi-Buy Automatic Discount applied: Buy 1 Get 1 Free on all selected Black
                  variants!
                </div>
              )}

              {items.length === 0 ? (
                <div className="text-center text-stone-400 dark:text-zinc-500 py-24 space-y-3">
                  <span className="text-3xl">🛒</span>
                  <p className="text-xs font-semibold uppercase tracking-wider">
                    Your cart is currently empty
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-900/50 pb-6"
                  >
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-stone-900 dark:text-zinc-50">
                        {item.name}
                      </h3>
                      <p className="text-xs text-stone-400 font-mono">
                        {formatCurrency(parseFloat(item.price))}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-stone-200 rounded-xl dark:border-zinc-800 overflow-hidden bg-stone-50 dark:bg-zinc-900/20">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="px-3 py-1.5 text-xs font-bold hover:bg-stone-200 dark:hover:bg-zinc-800"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-extrabold font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="px-3 py-1.5 text-xs font-bold hover:bg-stone-200 dark:hover:bg-zinc-800"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-stone-100 dark:border-zinc-900/50 pt-6 space-y-6 bg-white dark:bg-zinc-950">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">
                Promo Code
              </label>
              <div className="flex gap-2.5">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="block w-full rounded-xl border border-stone-200 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 text-stone-950 dark:text-zinc-50 font-mono"
                  placeholder="Enter code"
                />
                <button
                  onClick={() => setCouponCode(couponInput || null)}
                  className="rounded-xl bg-stone-950 px-5 py-3 text-xs font-semibold text-white dark:bg-zinc-50 dark:text-zinc-950"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="text-[10px] text-rose-500 font-bold">{couponError}</p>}
            </div>

            <div className="space-y-2.5 text-xs text-stone-500 dark:text-zinc-400 border-t border-b border-stone-100 dark:border-zinc-900/50 py-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900 dark:text-zinc-50">
                  {formatCurrency(parseFloat(totals.subtotal))}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span className="font-semibold">
                  -{formatCurrency(parseFloat(totals.discountAmount))}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax Estimate</span>
                <span className="font-semibold text-stone-900 dark:text-zinc-50">
                  {formatCurrency(parseFloat(totals.taxAmount))}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Logistics</span>
                <span className="font-semibold text-stone-900 dark:text-zinc-50">
                  {formatCurrency(parseFloat(totals.shippingAmount))}
                </span>
              </div>
              <div className="flex justify-between border-t border-stone-100 dark:border-zinc-900/50 pt-3.5 text-sm font-extrabold text-stone-950 dark:text-zinc-50">
                <span>Grand Total</span>
                <span className="font-mono">{formatCurrency(parseFloat(totals.total))}</span>
              </div>
            </div>

            {items.length > 0 ? (
              <Link
                href={`/${domain}/checkout`}
                onClick={onClose}
                className="block w-full rounded-full bg-stone-950 py-4 text-center text-xs font-bold text-white shadow-xl hover:bg-stone-850 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                Proceed to Checkout
              </Link>
            ) : (
              <button
                disabled
                className="w-full rounded-full bg-stone-950 py-4 text-center text-xs font-bold text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950"
              >
                Proceed to Checkout
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
}
