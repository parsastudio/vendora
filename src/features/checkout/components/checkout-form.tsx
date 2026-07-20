"use client";

import { useState, useEffect, useTransition } from "react";
import { useCartStore } from "@/features/cart/store/use-cart-store";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/features/shared/utils/format";

interface CheckoutFormProps {
  tenantId: string;
  domain: string;
}

export function CheckoutForm({ tenantId, domain }: CheckoutFormProps) {
  const { items, couponCode, clearCart } = useCartStore();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("US");

  const [totals, setTotals] = useState({
    subtotal: "0.00",
    discountAmount: "0.00",
    taxAmount: "0.00",
    shippingAmount: "0.00",
    total: "0.00",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      router.push(`/${domain}/cart`);
      return;
    }

    const fetchCalculations = async () => {
      try {
        const response = await fetch("/api/store/cart/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items, couponCode, tenantId }),
        });
        const result = await response.json();
        if (result.success) {
          setTotals(result.data.calculation);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCalculations();
  }, [items, couponCode, tenantId, domain, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/store/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone,
            line1,
            line2: line2 || null,
            city,
            state,
            postalCode,
            country,
            couponCode: couponCode || null,
            tenantId,
            items: items.map((i) => ({
              variantId: i.variantId,
              quantity: i.quantity,
            })),
          }),
        });

        const result = await response.json();
        if (result.success) {
          clearCart();
          router.push(`/${domain}/orders/${result.data.orderId}`);
        } else {
          setError(result.error || "Failed to process transaction.");
        }
      } catch {
        setError("Network error occurred during checkout.");
      }
    });
  };

  return (
    <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16 items-start">
      <div className="lg:col-span-7">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded bg-red-50 p-4 text-xs text-red-600 dark:bg-red-950/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Shipping Details</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Address Line 1
                </label>
                <input
                  type="text"
                  required
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  State / Region
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Postal / ZIP Code
                </label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-zinc-950 py-4 text-center text-xs font-bold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {isPending ? "Processing Order..." : "Confirm & Pay (Cash on Delivery)"}
          </button>
        </form>
      </div>

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
    </div>
  );
}
