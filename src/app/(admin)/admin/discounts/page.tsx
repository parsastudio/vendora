import { db } from "@/lib/db";
import { discounts } from "@/lib/db/schema/orders";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createDiscount, deleteDiscount } from "@/lib/actions/discount";
import { formatCurrency } from "@/lib/utils/format";

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Promo Codes &amp; Coupons
        </h1>
        <p className="text-xs text-zinc-500">
          Create and manage discounts to drive store conversion rates.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 md:col-span-1">
          <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Add Promo Code</h3>
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
            className="mt-4 space-y-4"
          >
            <div>
              <label className="block text-[10px] font-bold text-zinc-500">Coupon Code</label>
              <input
                type="text"
                name="code"
                required
                placeholder="SUMMER20"
                className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500">Type</label>
              <select
                name="type"
                className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500">Value</label>
              <input
                type="text"
                name="value"
                required
                placeholder="15.00"
                className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500">
                Minimum Purchase Amount ($)
              </label>
              <input
                type="text"
                name="minPurchase"
                placeholder="50.00"
                className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500">
                Usage Limit (Times)
              </label>
              <input
                type="number"
                name="limit"
                placeholder="100"
                className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded bg-zinc-950 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Save Promo Code
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 md:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Active Coupons</h3>
          {discountsList.length === 0 ? (
            <p className="text-xs text-zinc-400">No active promo codes available.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-zinc-100 dark:border-zinc-900">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-900">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-500 uppercase">
                      Code
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-500 uppercase">
                      Value
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-500 uppercase">
                      Usage Count
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-zinc-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {discountsList.map((disc) => (
                    <tr key={disc.id}>
                      <td className="whitespace-nowrap px-4 py-2 text-xs font-semibold text-zinc-950 dark:text-zinc-50">
                        {disc.code}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-xs text-zinc-500">
                        {disc.type === "percentage"
                          ? `${disc.value}%`
                          : formatCurrency(parseFloat(disc.value))}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-xs text-zinc-500">
                        {disc.usageCount} / {disc.usageLimit || "∞"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-right text-xs">
                        <form action={handleDelete.bind(null, disc.id)}>
                          <button
                            type="submit"
                            className="text-xs font-semibold text-red-600 hover:underline"
                          >
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
