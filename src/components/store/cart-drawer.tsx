"use client";

import { useCartStore } from "@/features/store/store/use-cart-store";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils/format";

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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white p-6 shadow-xl dark:bg-zinc-950">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Your Cart</h2>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-700">
              Close
            </button>
          </div>

          <div className="mt-6 flex-1 overflow-y-auto space-y-4 max-h-[50vh]">
            {items.length === 0 ? (
              <p className="text-center text-sm text-zinc-500 py-12">Your cart is empty.</p>
            ) : (
              items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                      {item.name}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      {formatCurrency(parseFloat(item.price))}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-bold dark:bg-zinc-800"
                    >
                      -
                    </button>
                    <span className="text-xs font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-bold dark:bg-zinc-800"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="ml-2 text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 border-t pt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Promo Code
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="block w-full rounded-md border border-zinc-300 px-3 py-1.5 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                  placeholder="Enter code"
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

            <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(parseFloat(totals.subtotal))}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-{formatCurrency(parseFloat(totals.discountAmount))}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(parseFloat(totals.taxAmount))}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatCurrency(parseFloat(totals.shippingAmount))}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-sm font-bold text-zinc-950 dark:text-zinc-50">
                <span>Total</span>
                <span>{formatCurrency(parseFloat(totals.total))}</span>
              </div>
            </div>

            <button
              disabled={items.length === 0}
              className="w-full rounded-md bg-zinc-950 py-2.5 text-center text-xs font-semibold text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950"
            >
              Checkout Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
