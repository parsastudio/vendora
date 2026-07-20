"use client";

import { useState, useEffect, useTransition } from "react";
import { useCartStore } from "@/features/cart/store/use-cart-store";
import { useRouter } from "next/navigation";
import { createStripeSession } from "../actions/stripe";
import { CheckoutContactForm } from "./checkout-contact-form";
import { CheckoutShippingForm } from "./checkout-shipping-form";
import { CheckoutPaymentSelector } from "./checkout-payment-selector";
import { CheckoutSummary } from "./checkout-summary";

interface CheckoutFormProps {
  tenantId: string;
  domain: string;
}

interface ShippingRate {
  id: string;
  name: string;
  price: string;
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
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "stripe">("cash");

  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedRateId, setSelectedRateId] = useState<string>("");

  const [totals, setTotals] = useState({
    subtotal: "0.00",
    discountAmount: "0.00",
    taxAmount: "0.00",
    shippingAmount: "0.00",
    total: "0.00",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/store/shipping-rates")
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson.success && resJson.data.length > 0) {
          setShippingRates(resJson.data);
          setSelectedRateId(resJson.data[0].id);
        }
      })
      .catch(() => {});
  }, []);

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
          body: JSON.stringify({
            items,
            couponCode,
            tenantId,
            shippingRateId: selectedRateId || null,
          }),
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
  }, [items, couponCode, tenantId, domain, router, selectedRateId]);

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
            paymentMethod,
            shippingRateId: selectedRateId || null,
            items: items.map((i) => ({
              variantId: i.variantId,
              quantity: i.quantity,
            })),
          }),
        });

        const result = await response.json();
        if (result.success) {
          const createdOrderId = result.data.orderId;

          if (paymentMethod === "stripe") {
            const stripeSession = await createStripeSession(createdOrderId, domain);
            if (stripeSession.url) {
              clearCart();
              window.location.href = stripeSession.url;
            } else {
              setError("Failed to generate payment gateway link.");
            }
          } else {
            clearCart();
            router.push(`/${domain}/orders/${createdOrderId}`);
          }
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

          <CheckoutContactForm
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
          />

          <CheckoutShippingForm
            line1={line1}
            setLine1={setLine1}
            line2={line2}
            setLine2={setLine2}
            city={city}
            setCity={setCity}
            state={state}
            setState={setState}
            postalCode={postalCode}
            setPostalCode={setPostalCode}
            country={country}
            setCountry={setCountry}
          />

          {shippingRates.length > 0 && (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
              <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Delivery Method</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {shippingRates.map((rate) => (
                  <button
                    key={rate.id}
                    type="button"
                    onClick={() => setSelectedRateId(rate.id)}
                    className={`rounded-lg border p-4 text-left transition-all ${
                      selectedRateId === rate.id
                        ? "border-zinc-950 bg-zinc-50 dark:border-zinc-50 dark:bg-zinc-900"
                        : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/40"
                    }`}
                  >
                    <p className="text-xs font-bold text-zinc-950 dark:text-zinc-50">{rate.name}</p>
                    <p className="mt-1 text-[10px] text-zinc-500">${rate.price}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <CheckoutPaymentSelector
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-zinc-950 py-4 text-center text-xs font-bold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {isPending
              ? "Processing Order..."
              : paymentMethod === "stripe"
                ? "Proceed to Stripe Payment"
                : "Confirm & Pay (Cash on Delivery)"}
          </button>
        </form>
      </div>

      <CheckoutSummary items={items} totals={totals} />
    </div>
  );
}
