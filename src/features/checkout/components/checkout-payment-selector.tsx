interface CheckoutPaymentSelectorProps {
  paymentMethod: "cash" | "stripe";
  setPaymentMethod: (val: "cash" | "stripe") => void;
}

export function CheckoutPaymentSelector({
  paymentMethod,
  setPaymentMethod,
}: CheckoutPaymentSelectorProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
      <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Payment Method</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setPaymentMethod("cash")}
          className={`rounded-lg border p-4 text-left transition-all ${
            paymentMethod === "cash"
              ? "border-zinc-950 bg-zinc-50 dark:border-zinc-50 dark:bg-zinc-900"
              : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/40"
          }`}
        >
          <p className="text-xs font-bold text-zinc-950 dark:text-zinc-50">Cash on Delivery</p>
          <p className="mt-1 text-[10px] text-zinc-500">Pay when your order arrives</p>
        </button>
        <button
          type="button"
          onClick={() => setPaymentMethod("stripe")}
          className={`rounded-lg border p-4 text-left transition-all ${
            paymentMethod === "stripe"
              ? "border-zinc-950 bg-zinc-50 dark:border-zinc-50 dark:bg-zinc-900"
              : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/40"
          }`}
        >
          <p className="text-xs font-bold text-zinc-950 dark:text-zinc-50">Credit / Debit Card</p>
          <p className="mt-1 text-[10px] text-zinc-500">Pay securely via Stripe gateway</p>
        </button>
      </div>
    </div>
  );
}
