"use client";

import { useState } from "react";

interface CouponPromoFormProps {
  initialCouponCode: string | null;
  onApply: (code: string | null) => void;
  couponError: string | null;
}

export function CouponPromoForm({ initialCouponCode, onApply, couponError }: CouponPromoFormProps) {
  const [couponInput, setCouponInput] = useState(initialCouponCode || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(couponInput.trim() || null);
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit}>
        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Promo Code
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            type="text"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            className="block w-full rounded-xl border border-zinc-300 px-3 py-1.5 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50"
            placeholder="SUMMER15"
          />
          <button
            type="submit"
            className="rounded-xl bg-zinc-950 px-4 py-1.5 text-xs font-bold text-white dark:bg-zinc-50 dark:text-zinc-950"
          >
            Apply
          </button>
        </div>
        {couponError && (
          <p className="mt-1 text-[10px] text-red-500 font-semibold">{couponError}</p>
        )}
      </form>
    </div>
  );
}
