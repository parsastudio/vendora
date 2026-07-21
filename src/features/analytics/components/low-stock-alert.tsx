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
    <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 dark:border-zinc-800/60 dark:bg-zinc-950 space-y-4 shadow-sm">
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Critical Stock Alerts</h3>
        <p className="text-[10px] text-zinc-400 font-medium">
          Overview of warehouse item variations with quantity below 10 units.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/10 p-6 text-center dark:border-emerald-950/20">
          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
            All products are healthy and well stocked.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-900">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-2.5 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                  SKU
                </th>
                <th className="px-4 py-2.5 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                  Product Name
                </th>
                <th className="px-4 py-2.5 text-right text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 font-medium">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-rose-600 dark:text-rose-400 font-bold">
                    {item.sku}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-bold text-zinc-950 dark:text-zinc-50">
                    {item.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-mono font-black text-rose-700 dark:text-rose-400">
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
