import { formatCurrency } from "@/features/shared/utils/format";

interface AbandonedCartItem {
  id: string;
  customerName: string;
  itemsCount: number;
  lastUpdated: string;
}

interface AbandonedCartsProps {
  abandonedCount: number;
  estimatedLostRevenue: number;
  recentList: AbandonedCartItem[];
}

export function AbandonedCarts({
  abandonedCount,
  estimatedLostRevenue,
  recentList,
}: AbandonedCartsProps) {
  const leakRate =
    abandonedCount > 0 ? Math.round((abandonedCount / (abandonedCount + 5)) * 100) : 0;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
            Abandoned Carts Analysis
          </h3>
          <p className="text-[10px] text-zinc-500">
            Monitoring customer cart drop-offs and estimated leakage.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-zinc-500">Potential Revenue Recovery</span>
          <p className="text-lg font-extrabold text-rose-600">
            {formatCurrency(estimatedLostRevenue)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-rose-100 bg-rose-50/30 p-4 dark:border-rose-950/20 dark:bg-rose-950/5">
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
            Unrecovered Carts Count
          </span>
          <p className="mt-1 text-2xl font-extrabold text-rose-700 dark:text-rose-400">
            {abandonedCount}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-900 dark:bg-zinc-900/20">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Estimated Conversion Leak
          </span>
          <p className="mt-1 text-2xl font-extrabold text-zinc-800 dark:text-zinc-200">
            {leakRate}%
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold text-zinc-950 dark:text-zinc-50">
          Recently Abandoned Logs
        </h4>
        {recentList.length === 0 ? (
          <p className="text-xs text-zinc-400">No abandoned carts detected.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-100 dark:border-zinc-900">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-500 uppercase">
                    Cart ID
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-500 uppercase">
                    Customer
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-zinc-500 uppercase">
                    Items Count
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-zinc-500 uppercase">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
                {recentList.map((c) => (
                  <tr key={c.id}>
                    <td className="whitespace-nowrap px-4 py-2 font-mono text-zinc-500">{c.id}</td>
                    <td className="whitespace-nowrap px-4 py-2 font-semibold text-zinc-900 dark:text-zinc-50">
                      {c.customerName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-center text-zinc-600">
                      {c.itemsCount}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-right text-zinc-400">
                      {c.lastUpdated}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
