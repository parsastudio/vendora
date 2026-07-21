"use client";

import { useCartStore } from "@/features/cart/store/use-cart-store";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/features/shared/utils/format";

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
        }
      } catch (err) {
        console.error(err);
      }
    };

    validateAndRecalculate();
  }, [items, couponCode, tenantId]);

  if (!isOpen) return null;

  const hasBogoActive = items.some(
    (item) => item.attributes.color === "black" || item.attributes.bogo === "true",
  );

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white p-6 shadow-2xl dark:bg-zinc-950 flex flex-col justify-between border-l border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Your Cart</h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-700"
              >
                Close
              </button>
            </div>

            <div className="mt-6 overflow-y-auto space-y-4 max-h-[40vh] pr-1">
              {hasBogoActive && (
                <div className="rounded-xl bg-emerald-50/50 border border-emerald-100 p-3.5 text-[10px] text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400 font-semibold leading-relaxed">
                  🎁 Multi-Buy Automatic Discount applied: Buy 1 Get 1 Free on all selected Black
                  variants!
                </div>
              )}

              {items.length === 0 ? (
                <div className="text-center text-zinc-400 py-16">
                  <span className="text-3xl">🛒</span>
                  <p className="mt-3 text-xs">Your cart is empty.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-4"
                  >
                    <div>
                      <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
                        {item.name}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {formatCurrency(parseFloat(item.price))}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-zinc-200 rounded-lg dark:border-zinc-800 overflow-hidden bg-zinc-50 dark:bg-zinc-900/30">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="px-2.5 py-1 text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-800"
                        >
                          -
                        </button>
                        <span className="px-1 text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="px-2.5 py-1 text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-800"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="text-xs font-semibold text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-850 pt-4 space-y-4 bg-white dark:bg-zinc-950">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Promo Code
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="block w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                  placeholder="Enter coupon code"
                />
                <button
                  onClick={() => setCouponCode(couponInput || null)}
                  className="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white dark:bg-zinc-50 dark:text-zinc-950"
                >
                  Apply
                </button>
              </div>
              {couponError && (
                <p className="mt-1 text-[10px] text-red-500 font-semibold">{couponError}</p>
              )}
            </div>

            <div className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
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
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(parseFloat(totals.taxAmount))}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(parseFloat(totals.shippingAmount))}
                </span>
              </div>
              <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-850 pt-3 text-sm font-extrabold text-zinc-950 dark:text-zinc-50">
                <span>Total</span>
                <span>{formatCurrency(parseFloat(totals.total))}</span>
              </div>
            </div>

            <button
              disabled={items.length === 0}
              className="w-full rounded-full bg-zinc-950 py-3.5 text-center text-xs font-bold text-white disabled:opacity-50 transition-all hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950"
            >
              Checkout Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
