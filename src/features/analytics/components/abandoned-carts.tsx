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
    <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 dark:border-zinc-800/60 dark:bg-zinc-950 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
            Abandoned Carts Analysis
          </h3>
          <p className="text-[10px] text-zinc-400 font-medium">
            Monitoring customer cart drop-offs and estimated leakage.
          </p>
        </div>
        <div className="sm:text-right space-y-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Potential Recovery
          </span>
          <p className="text-xl font-black text-rose-600 font-mono">
            {formatCurrency(estimatedLostRevenue)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-rose-100 bg-rose-50/20 p-4 dark:border-rose-950/20 dark:bg-rose-950/5 space-y-1.5">
          <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">
            Unrecovered Carts Count
          </span>
          <p className="text-2xl font-black text-rose-700 dark:text-rose-400 font-mono">
            {abandonedCount}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-900 dark:bg-zinc-900/20 space-y-1.5">
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
            Estimated Conversion Leak
          </span>
          <p className="text-2xl font-black text-zinc-800 dark:text-zinc-200 font-mono">
            {leakRate}%
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold text-zinc-950 dark:text-zinc-50">
          Recently Abandoned Logs
        </h4>
        {recentList.length === 0 ? (
          <p className="text-xs text-zinc-450 py-4">No abandoned carts detected.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-900">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-2.5 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                    Cart ID
                  </th>
                  <th className="px-4 py-2.5 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                    Customer
                  </th>
                  <th className="px-4 py-2.5 text-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                    Items
                  </th>
                  <th className="px-4 py-2.5 text-right text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 font-medium">
                {recentList.map((c) => (
                  <tr key={c.id}>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-zinc-400">{c.id}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-bold text-zinc-950 dark:text-zinc-50">
                      {c.customerName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-zinc-500 font-mono">
                      {c.itemsCount}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-zinc-400">
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
