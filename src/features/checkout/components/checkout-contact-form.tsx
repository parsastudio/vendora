interface CheckoutContactFormProps {
  name: string;
  setName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
}

export function CheckoutContactForm({
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
}: CheckoutContactFormProps) {
  return (
    <div className="rounded-3xl border border-stone-200/40 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 space-y-6">
      <h3 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-zinc-50">
        Contact Information
      </h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1.5">
          <label className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
            Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
            Phone Number
          </label>
          <input
            type="text"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
      </div>
    </div>
  );
}
