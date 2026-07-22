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
    <div className="rounded-3xl border border-stone-200/60 bg-white p-8 dark:border-zinc-900/50 dark:bg-zinc-950 space-y-8 shadow-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-black uppercase tracking-widest text-stone-950 dark:text-zinc-50">
            Abandoned Carts
          </h3>
          <p className="text-[10px] text-stone-400 dark:text-zinc-500 font-semibold">
            Real-time funnel leakage diagnostics.
          </p>
        </div>
        <div className="sm:text-right space-y-1">
          <span className="text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
            Unrecovered Value
          </span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-500 font-mono">
            {formatCurrency(estimatedLostRevenue)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-rose-100 bg-rose-500/[0.02] p-5 dark:border-rose-950/20 dark:bg-rose-950/[0.04] space-y-2">
          <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">
            Abandoned Count
          </span>
          <p className="text-2xl font-black text-rose-700 dark:text-rose-400 font-mono">
            {abandonedCount}
          </p>
        </div>
        <div className="rounded-2xl border border-stone-150 bg-stone-50/50 p-5 dark:border-zinc-900 dark:bg-zinc-900/10 space-y-2">
          <span className="text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
            Leakage Rate
          </span>
          <p className="text-2xl font-black text-stone-900 dark:text-zinc-150 font-mono">
            {leakRate}%
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
          Recent Drop-offs
        </h4>
        {recentList.length === 0 ? (
          <p className="text-xs text-stone-400 py-4 font-semibold">
            No pending drop-offs detected.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-stone-100 dark:border-zinc-900">
            <table className="min-w-full divide-y divide-stone-150 dark:divide-zinc-800 text-xs">
              <thead className="bg-stone-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                    Client
                  </th>
                  <th className="px-4 py-3 text-center text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                    Items
                  </th>
                  <th className="px-4 py-3 text-right text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                    Active
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-zinc-900 font-semibold">
                {recentList.map((c) => (
                  <tr key={c.id}>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-stone-400">{c.id}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-bold text-stone-950 dark:text-zinc-100">
                      {c.customerName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-stone-400 font-mono">
                      {c.itemsCount}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-stone-400">
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
