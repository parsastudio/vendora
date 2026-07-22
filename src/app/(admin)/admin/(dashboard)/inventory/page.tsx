import { db } from "@/lib/db";
import { warehouses, inventory, productVariants, products } from "@/lib/db/schema/products";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { redirect } from "next/navigation";
import { createWarehouse } from "@/features/inventory/actions/inventory";
import { StockUpdater } from "@/features/inventory/components/stock-updater";

export default async function InventoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  const tenantId = session.user.tenantId;

  const warehousesList = await db
    .select()
    .from(warehouses)
    .where(eq(warehouses.tenantId, tenantId));

  const variantsList = await db
    .select({
      id: productVariants.id,
      sku: productVariants.sku,
      productName: products.name,
      attributes: productVariants.attributes,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(eq(products.tenantId, tenantId));

  const stockLevels = await db.select().from(inventory);

  return (
    <div className="space-y-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-stone-950 dark:text-zinc-50">
          Inventory &amp; Warehouses
        </h1>
        <p className="text-xs text-stone-400 dark:text-zinc-500 font-medium">
          Deploy warehousing hubs and modify variant inventory levels seamlessly.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="rounded-3xl border border-stone-200 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 lg:col-span-1 space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-zinc-100 font-mono">
            Register Hub
          </h3>
          <form
            action={async (formData: FormData) => {
              "use server";
              const name = formData.get("name") as string;
              const location = formData.get("location") as string;
              await createWarehouse(name, location || null);
            }}
            className="space-y-5"
          >
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                Hub Name
              </label>
              <input
                type="text"
                name="name"
                required
                className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 text-stone-950"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                Location address
              </label>
              <input
                type="text"
                name="location"
                className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 text-stone-950"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-stone-950 py-3.5 text-xs font-semibold text-white hover:bg-stone-850 dark:bg-zinc-50 dark:text-zinc-955 h-11"
            >
              Save Hub
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 lg:col-span-2 space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-zinc-100 font-mono">
            Ledger Allocations
          </h3>
          {warehousesList.length === 0 ? (
            <p className="text-xs text-stone-400 dark:text-zinc-500 font-semibold py-4">
              Please register a warehouse hub to oversee stock.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-stone-100 dark:border-zinc-900">
              <table className="min-w-full divide-y divide-stone-150 dark:divide-zinc-900">
                <thead className="bg-stone-50 dark:bg-zinc-900">
                  <tr>
                    <th className="px-5 py-4 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                      SKU Code
                    </th>
                    <th className="px-5 py-4 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest font-sans">
                      Product
                    </th>
                    {warehousesList.map((wh) => (
                      <th
                        key={wh.id}
                        className="px-5 py-4 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest"
                      >
                        {wh.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-zinc-900/50 font-semibold text-xs">
                  {variantsList.map((v) => (
                    <tr key={v.id}>
                      <td className="whitespace-nowrap px-5 py-4 font-mono text-stone-950 dark:text-zinc-55 font-black">
                        {v.sku}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-stone-400 dark:text-zinc-500 font-medium">
                        {v.productName}
                      </td>
                      {warehousesList.map((wh) => {
                        const currentStock =
                          stockLevels.find(
                            (sl) => sl.variantId === v.id && sl.warehouseId === wh.id,
                          )?.quantity || 0;
                        return (
                          <td key={wh.id} className="px-5 py-4 text-xs">
                            <StockUpdater
                              variantId={v.id}
                              warehouseId={wh.id}
                              initialQuantity={currentStock}
                            />
                          </td>
                        );
                      })}
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
