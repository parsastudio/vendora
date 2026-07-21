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
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-5">
      <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Shipping Details</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Address Line 1
          </label>
          <input
            type="text"
            required
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            className="mt-1.5 block w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Address Line 2 (Optional)
          </label>
          <input
            type="text"
            value={line2}
            onChange={(e) => setLine2(e.target.value)}
            className="mt-1.5 block w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            City
          </label>
          <input
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1.5 block w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            State / Region
          </label>
          <input
            type="text"
            required
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="mt-1.5 block w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Postal / ZIP Code
          </label>
          <input
            type="text"
            required
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className="mt-1.5 block w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Country
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-1.5 block w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50"
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
