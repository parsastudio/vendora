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
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Best Selling Products</h3>
        <p className="text-[10px] text-zinc-500">
          Overview of highest generating catalog variants.
        </p>
      </div>

      {products.length === 0 ? (
        <p className="text-xs text-zinc-400 py-6">No purchase records registered yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-100 dark:border-zinc-900">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-500 uppercase">
                  Product SKU
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-500 uppercase">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-500 uppercase">
                  Units Sold
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-zinc-500 uppercase">
                  Gross Volume
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {products.map((p, index) => (
                <tr key={p.sku || index}>
                  <td className="whitespace-nowrap px-4 py-2 text-xs font-mono text-zinc-600 dark:text-zinc-400">
                    {p.sku || "N/A"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-xs font-semibold text-zinc-950 dark:text-zinc-50">
                    {p.name || "N/A"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-xs text-zinc-500">
                    {p.quantity}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-xs font-bold text-zinc-950 dark:text-zinc-50">
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
