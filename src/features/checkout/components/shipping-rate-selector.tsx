"use client";

interface ShippingRate {
  id: string;
  name: string;
  price: string;
}

interface ShippingRateSelectorProps {
  shippingRates: ShippingRate[];
  selectedRateId: string;
  onRateSelect: (id: string) => void;
}

export function ShippingRateSelector({
  shippingRates,
  selectedRateId,
  onRateSelect,
}: ShippingRateSelectorProps) {
  if (shippingRates.length === 0) return null;

  return (
    <div className="rounded-3xl border border-stone-200/40 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 space-y-6">
      <h3 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-zinc-50">
        Delivery Method
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {shippingRates.map((rate) => {
          const isSelected = selectedRateId === rate.id;
          return (
            <button
              key={rate.id}
              type="button"
              onClick={() => onRateSelect(rate.id)}
              className={`rounded-2xl border p-5 text-left transition-all ${
                isSelected
                  ? "border-stone-950 bg-stone-50 dark:border-zinc-50 dark:bg-zinc-900/40 ring-1 ring-stone-950 dark:ring-zinc-50"
                  : "border-stone-200/60 hover:border-stone-400 dark:border-zinc-900 dark:hover:border-zinc-700"
              }`}
            >
              <p className="text-xs font-black uppercase tracking-widest text-stone-950 dark:text-zinc-50">
                {rate.name}
              </p>
              <p className="mt-1 text-xs font-extrabold text-stone-400 dark:text-zinc-500 font-mono">
                ${rate.price}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
