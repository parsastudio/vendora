"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { useCartStore } from "@/features/cart/store/use-cart-store";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CartItemsList } from "./cart-items-list";
import { CouponPromoForm } from "./coupon-promo-form";
import { CartTotalsSummary } from "./cart-totals-summary";

interface CartPageContentProps {
  tenantId: string;
  domain: string;
}

export function CartPageContent({ tenantId, domain }: CartPageContentProps) {
  const { data: session } = useSession();
  const { items, updateQuantity, removeItem, couponCode, setCouponCode, mergeCart } =
    useCartStore();
  const [totals, setTotals] = useState({
    subtotal: "0.00",
    discountAmount: "0.00",
    taxAmount: "0.00",
    shippingAmount: "0.00",
    total: "0.00",
  });
  const [couponError, setCouponError] = useState<string | null>(null);
  const [hasMerged, setHasMerged] = useState(false);

  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!isClient || !session?.user || hasMerged || items.length === 0) return;

    const executeMerge = async () => {
      try {
        const response = await fetch("/api/store/cart/merge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guestItems: items }),
        });
        const result = await response.json();
        if (result.success) {
          const dbMergedItems = result.data.map(
            (item: {
              variantId: string;
              quantity: number;
              sku: string;
              name: string;
              price: string;
              attributes: Record<string, string>;
            }) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              sku: item.sku,
              name: item.name,
              price: item.price,
              attributes: item.attributes,
            }),
          );
          mergeCart(dbMergedItems);
          setHasMerged(true);
        }
      } catch (err) {
        console.error(err);
      }
    };

    executeMerge();
  }, [session, isClient, items, mergeCart, hasMerged]);

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
          href="/"
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
        <CartItemsList items={items} updateQuantity={updateQuantity} removeItem={removeItem} />
      </section>

      <section className="lg:col-span-5 mt-16 lg:mt-0">
        <CartTotalsSummary
          totals={totals}
          domain={domain}
          couponElement={
            <CouponPromoForm
              initialCouponCode={couponCode}
              onApply={setCouponCode}
              couponError={couponError}
            />
          }
        />
      </section>
    </div>
  );
}
