interface CheckoutShippingFormProps {
  line1: string;
  setLine1: (val: string) => void;
  line2: string;
  setLine2: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  state: string;
  setState: (val: string) => void;
  postalCode: string;
  setPostalCode: (val: string) => void;
  country: string;
  setCountry: (val: string) => void;
}

export function CheckoutShippingForm({
  line1,
  setLine1,
  line2,
  setLine2,
  city,
  setCity,
  state,
  setState,
  postalCode,
  setPostalCode,
  country,
  setCountry,
}: CheckoutShippingFormProps) {
  return (
    <div className="rounded-3xl border border-stone-200/40 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 space-y-6">
      <h3 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-zinc-50">
        Shipping address
      </h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1.5">
          <label
            htmlFor="shipping-line1"
            className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest"
          >
            Address Line 1
          </label>
          <input
            id="shipping-line1"
            type="text"
            required
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 text-stone-900 dark:text-zinc-100"
          />
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <label
            htmlFor="shipping-line2"
            className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest"
          >
            Address Line 2 (Optional)
          </label>
          <input
            id="shipping-line2"
            type="text"
            value={line2}
            onChange={(e) => setLine2(e.target.value)}
            className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 text-stone-900 dark:text-zinc-100"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="shipping-city"
            className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest"
          >
            City
          </label>
          <input
            id="shipping-city"
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 text-stone-900 dark:text-zinc-100"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="shipping-state"
            className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest"
          >
            State / Region
          </label>
          <input
            id="shipping-state"
            type="text"
            required
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 text-stone-900 dark:text-zinc-100"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="shipping-postal"
            className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest"
          >
            Postal / ZIP Code
          </label>
          <input
            id="shipping-postal"
            type="text"
            required
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 text-stone-900 dark:text-zinc-100"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="shipping-country"
            className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest"
          >
            Country
          </label>
          <select
            id="shipping-country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 font-bold"
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
  );
}
