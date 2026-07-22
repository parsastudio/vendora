import { formatCurrency } from "@/features/shared/utils/format";

interface TopProductItem {
  sku: string | null;
  name: string | null;
  quantity: number;
  revenue: string;
}

interface TopProductsProps {
  products: TopProductItem[];
}

export function TopProducts({ products }: TopProductsProps) {
  return (
    <div className="rounded-3xl border border-stone-200/40 bg-white p-8 dark:border-zinc-900/50 dark:bg-zinc-950 space-y-6">
      <div className="space-y-1">
        <h3 className="text-sm font-black uppercase tracking-widest text-stone-950 dark:text-zinc-50">
          Best Selling Products
        </h3>
        <p className="text-[10px] text-stone-400 dark:text-zinc-500 font-semibold">
          Performance metrics for top-performing catalog variants.
        </p>
      </div>

      {products.length === 0 ? (
        <p className="text-xs text-stone-400 py-6">No matching transactions resolved.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-100 dark:border-zinc-900">
          <table className="min-w-full divide-y divide-stone-150 dark:divide-zinc-900 text-xs">
            <thead className="bg-stone-50 dark:bg-zinc-900">
              <tr>
                <th className="px-6 py-4 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                  SKU Variant
                </th>
                <th className="px-6 py-4 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                  Label
                </th>
                <th className="px-6 py-4 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                  Units
                </th>
                <th className="px-6 py-4 text-right text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                  Gross Volume
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-900/50 font-semibold">
              {products.map((p, index) => (
                <tr key={p.sku || index}>
                  <td className="whitespace-nowrap px-6 py-4 font-mono text-stone-400">
                    {p.sku || "N/A"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-black text-stone-950 dark:text-zinc-50">
                    {p.name || "N/A"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-stone-400 font-mono">
                    {p.quantity}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right font-black text-stone-955 dark:text-zinc-50 font-mono">
                    {formatCurrency(parseFloat(p.revenue))}
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
