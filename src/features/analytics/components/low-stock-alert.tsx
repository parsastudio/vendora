interface LowStockItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
}

interface LowStockAlertProps {
  items: LowStockItem[];
}

export function LowStockAlert({ items }: LowStockAlertProps) {
  return (
    <div className="rounded-3xl border border-stone-200/60 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 space-y-6">
      <div className="space-y-1">
        <h3 className="text-sm font-black uppercase tracking-widest text-stone-950 dark:text-zinc-50">
          Critical Stock Alerts
        </h3>
        <p className="text-[10px] text-stone-400 dark:text-zinc-500 font-semibold">
          Overview of warehouse item variations with quantity below 10 units.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-500/[0.02] p-6 text-center">
          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
            All warehouse products are well stocked.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-100 dark:border-zinc-900">
          <table className="min-w-full divide-y divide-stone-150 dark:divide-zinc-800 text-xs">
            <thead className="bg-stone-50 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                  SKU Variant
                </th>
                <th className="px-4 py-3 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                  Product Label
                </th>
                <th className="px-4 py-3 text-right text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-900 font-semibold">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-rose-600 dark:text-rose-450 font-black">
                    {item.sku}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-bold text-stone-950 dark:text-zinc-50">
                    {item.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-mono font-black text-rose-700 dark:text-rose-450">
                    {item.quantity} Units
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
