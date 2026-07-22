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
    <div className="rounded-3xl border border-stone-200/40 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 space-y-6">
      <h3 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-zinc-50">
        Payment Method
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setPaymentMethod("cash")}
          className={`rounded-2xl border p-5 text-left transition-all ${
            isCash
              ? "border-stone-950 bg-stone-50 dark:border-zinc-50 dark:bg-zinc-900/40 ring-1 ring-stone-950 dark:ring-zinc-50"
              : "border-stone-200/60 hover:border-stone-400 dark:border-zinc-900 dark:hover:border-zinc-700"
          }`}
        >
          <p className="text-xs font-black uppercase tracking-widest text-stone-950 dark:text-zinc-50">
            Cash on Delivery
          </p>
          <p className="mt-1.5 text-[10px] text-stone-400 dark:text-zinc-500 font-semibold leading-relaxed">
            Pay cash when your order arrives at your door
          </p>
        </button>
        <button
          type="button"
          onClick={() => setPaymentMethod("stripe")}
          className={`rounded-2xl border p-5 text-left transition-all ${
            isStripe
              ? "border-stone-950 bg-stone-50 dark:border-zinc-50 dark:bg-zinc-900/40 ring-1 ring-stone-950 dark:ring-zinc-50"
              : "border-stone-200/60 hover:border-stone-400 dark:border-zinc-900 dark:hover:border-zinc-700"
          }`}
        >
          <p className="text-xs font-black uppercase tracking-widest text-stone-950 dark:text-zinc-50">
            Credit / Debit Card
          </p>
          <p className="mt-1.5 text-[10px] text-stone-400 dark:text-zinc-500 font-semibold leading-relaxed">
            Pay securely via industry-standard Stripe gateway
          </p>
        </button>
      </div>
    </div>
  );
}
