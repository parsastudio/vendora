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
    <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 dark:border-zinc-800/60 dark:bg-zinc-950 space-y-4 shadow-sm">
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Best Selling Products</h3>
        <p className="text-[10px] text-zinc-400 font-medium">
          Overview of highest generating catalog variants.
        </p>
      </div>

      {products.length === 0 ? (
        <p className="text-xs text-zinc-400 py-6">No purchase records registered yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-900">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-2.5 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                  Product SKU
                </th>
                <th className="px-4 py-2.5 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                  Name
                </th>
                <th className="px-4 py-2.5 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                  Units Sold
                </th>
                <th className="px-4 py-2.5 text-right text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                  Gross Volume
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 font-semibold">
              {products.map((p, index) => (
                <tr key={p.sku || index}>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-zinc-450">
                    {p.sku || "N/A"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-bold text-zinc-950 dark:text-zinc-50">
                    {p.name || "N/A"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-400 font-mono">
                    {p.quantity}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-black text-zinc-950 dark:text-zinc-50 font-mono">
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
