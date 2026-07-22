import { db } from "@/lib/db";
import { discounts } from "@/lib/db/schema/orders";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { redirect } from "next/navigation";
import { createDiscount, deleteDiscount } from "@/features/discounts/actions/discount";
import { formatCurrency } from "@/features/shared/utils/format";

export default async function DiscountsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  const tenantId = session.user.tenantId;

  const discountsList = await db.select().from(discounts).where(eq(discounts.tenantId, tenantId));

  const handleDelete = async (id: string) => {
    "use server";
    await deleteDiscount(id);
  };

  return (
    <div className="space-y-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-stone-955 dark:text-zinc-50">
          Promo Codes &amp; Coupons
        </h1>
        <p className="text-xs text-stone-400 dark:text-zinc-500 font-medium">
          Create and manage promotional campaign discounts and checkouts triggers.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="rounded-3xl border border-stone-200/40 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 md:col-span-1 space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-zinc-100">
            Add Code
          </h3>
          <form
            action={async (formData: FormData) => {
              "use server";
              const code = (formData.get("code") as string).toUpperCase();
              const type = formData.get("type") as "percentage" | "fixed";
              const value = formData.get("value") as string;
              const minPurchase = formData.get("minPurchase") as string;
              const limit = formData.get("limit") as string;

              await createDiscount(
                code,
                type,
                value,
                minPurchase || null,
                limit ? parseInt(limit) : null,
              );
            }}
            className="space-y-5"
          >
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                Coupon Code
              </label>
              <input
                type="text"
                name="code"
                required
                placeholder="SUMMER20"
                className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 text-stone-950"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                Type
              </label>
              <select
                name="type"
                className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-850 dark:bg-zinc-900 text-stone-955 dark:text-zinc-50"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                Value
              </label>
              <input
                type="text"
                name="value"
                required
                placeholder="15.00"
                className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 font-mono text-stone-950"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest font-sans">
                Minimum Purchase Amount ($)
              </label>
              <input
                type="text"
                name="minPurchase"
                placeholder="50.00"
                className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 font-mono text-stone-950"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest font-sans">
                Usage Limit (Times)
              </label>
              <input
                type="number"
                name="limit"
                placeholder="100"
                className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 font-mono text-stone-950"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-stone-950 py-3.5 text-xs font-semibold text-white hover:bg-stone-850 dark:bg-zinc-50 dark:text-zinc-955 h-11"
            >
              Save Code
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-stone-200/40 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 md:col-span-2 space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-zinc-100 font-mono">
            Active Campaigns
          </h3>
          {discountsList.length === 0 ? (
            <p className="text-xs text-stone-400 dark:text-zinc-500 font-semibold py-4">
              No coupons registered.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-stone-100 dark:border-zinc-900">
              <table className="min-w-full divide-y divide-stone-150 dark:divide-zinc-900">
                <thead className="bg-stone-50 dark:bg-zinc-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                      Code
                    </th>
                    <th className="px-6 py-4 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                      Rate
                    </th>
                    <th className="px-6 py-4 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                      Fulfillment
                    </th>
                    <th className="px-6 py-4 text-right text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-zinc-900/50 font-semibold text-xs">
                  {discountsList.map((disc) => (
                    <tr key={disc.id}>
                      <td className="whitespace-nowrap px-6 py-4.5 font-black text-stone-950 dark:text-zinc-55">
                        {disc.code}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4.5 text-stone-400 dark:text-zinc-500 font-mono">
                        {disc.type === "percentage"
                          ? `${disc.value}%`
                          : formatCurrency(parseFloat(disc.value))}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4.5 text-stone-400 dark:text-zinc-500 font-mono">
                        {disc.usageCount} / {disc.usageLimit || "∞"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4.5 text-right font-black">
                        <form action={handleDelete.bind(null, disc.id)}>
                          <button type="submit" className="text-rose-600 hover:text-rose-700">
                            Delete
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
