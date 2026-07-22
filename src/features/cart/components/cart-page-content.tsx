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
  }, [items, couponCode, tenantId, isClient, updateQuantity]);

  if (!isClient) {
    return (
      <div className="mt-16 flex h-48 items-center justify-center text-xs text-stone-400 font-semibold font-mono animate-pulse">
        Loading shopping parameters...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center justify-center rounded-3xl border border-dashed border-stone-200 py-24 text-center space-y-4">
        <span className="text-4xl">🛒</span>
        <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">
          Your shopping cart is currently empty
        </p>
        <Link
          href={`/${domain}`}
          className="rounded-full bg-stone-950 px-8 py-3 text-xs font-bold text-white shadow-sm hover:bg-stone-850"
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
    <div className="mt-16 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
      <section className="lg:col-span-7 space-y-6">
        {hasBogoActive && (
          <div className="rounded-3xl border border-emerald-100 bg-emerald-500/[0.02] p-5">
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 leading-relaxed">
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
