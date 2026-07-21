interface CheckoutPaymentSelectorProps {
  paymentMethod: "cash" | "stripe";
  setPaymentMethod: (val: "cash" | "stripe") => void;
}

export function CheckoutPaymentSelector({
  paymentMethod,
  setPaymentMethod,
}: CheckoutPaymentSelectorProps) {
  const isCash = paymentMethod === "cash";
  const isStripe = paymentMethod === "stripe";

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-5">
      <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Payment Method</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setPaymentMethod("cash")}
          className={`rounded-xl border p-5 text-left transition-all duration-300 ${
            isCash
              ? "border-zinc-950 bg-zinc-50 dark:border-zinc-50 dark:bg-zinc-900/50 scale-[1.01] ring-1 ring-zinc-950 dark:ring-zinc-50"
              : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/20"
          }`}
        >
          <p className="text-xs font-bold text-zinc-950 dark:text-zinc-50 uppercase">
            Cash on Delivery
          </p>
          <p className="mt-1 text-[10px] text-zinc-400 font-semibold leading-relaxed">
            Pay cash when your order arrives at your door
          </p>
        </button>
        <button
          type="button"
          onClick={() => setPaymentMethod("stripe")}
          className={`rounded-xl border p-5 text-left transition-all duration-300 ${
            isStripe
              ? "border-zinc-950 bg-zinc-50 dark:border-zinc-50 dark:bg-zinc-900/50 scale-[1.01] ring-1 ring-zinc-950 dark:ring-zinc-50"
              : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/20"
          }`}
        >
          <p className="text-xs font-bold text-zinc-950 dark:text-zinc-50 uppercase">
            Credit / Debit Card
          </p>
          <p className="mt-1 text-[10px] text-zinc-400 font-semibold leading-relaxed">
            Pay securely via industry-standard Stripe gateway
          </p>
        </button>
      </div>
    </div>
  );
}
