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
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-5">
      <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Contact Information</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 block w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 block w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Phone Number
          </label>
          <input
            type="text"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1.5 block w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
      </div>
    </div>
  );
}
