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
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
      <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Delivery Method</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {shippingRates.map((rate) => (
          <button
            key={rate.id}
            type="button"
            onClick={() => onRateSelect(rate.id)}
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
  );
}
