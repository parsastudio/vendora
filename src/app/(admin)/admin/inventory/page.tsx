import { db } from "@/lib/db";
import { warehouses, inventory, productVariants, products } from "@/lib/db/schema/products";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createWarehouse, updateStock } from "@/lib/actions/inventory";

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Inventory &amp; Warehouses
        </h1>
        <p className="text-xs text-zinc-500">
          Monitor and adjust variant stock levels across your storage hubs.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 lg:col-span-1">
          <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Add Warehouse Hub</h3>
          <form
            action={async (formData: FormData) => {
              "use server";
              const name = formData.get("name") as string;
              const location = formData.get("location") as string;
              await createWarehouse(name, location || null);
            }}
            className="mt-4 space-y-4"
          >
            <div>
              <label className="block text-[10px] font-bold text-zinc-500">Hub Name</label>
              <input
                type="text"
                name="name"
                required
                className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500">Location Address</label>
              <input
                type="text"
                name="location"
                className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded bg-zinc-950 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Save Warehouse
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Stock Allocations</h3>
          {warehousesList.length === 0 ? (
            <p className="text-xs text-zinc-400">Please register a warehouse hub first.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-zinc-100 dark:border-zinc-900">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-900">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-500 uppercase">
                      Variant SKU
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-500 uppercase">
                      Product Name
                    </th>
                    {warehousesList.map((wh) => (
                      <th
                        key={wh.id}
                        className="px-4 py-2 text-left text-xs font-semibold text-zinc-500 uppercase"
                      >
                        {wh.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {variantsList.map((v) => (
                    <tr key={v.id}>
                      <td className="whitespace-nowrap px-4 py-2 text-xs font-semibold text-zinc-950 dark:text-zinc-50">
                        {v.sku}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-xs text-zinc-500">
                        {v.productName}
                      </td>
                      {warehousesList.map((wh) => {
                        const currentStock =
                          stockLevels.find(
                            (sl) => sl.variantId === v.id && sl.warehouseId === wh.id,
                          )?.quantity || 0;
                        return (
                          <td key={wh.id} className="px-4 py-2 text-xs">
                            <form
                              action={async (formData: FormData) => {
                                "use server";
                                const qty = parseInt((formData.get("qty") as string) || "0");
                                await updateStock(v.id, wh.id, qty);
                              }}
                              className="flex items-center gap-1.5"
                            >
                              <input
                                type="number"
                                name="qty"
                                defaultValue={currentStock}
                                className="w-16 rounded border border-zinc-300 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 focus:outline-none"
                              />
                              <button
                                type="submit"
                                className="rounded bg-zinc-950 px-2 py-0.5 text-[10px] font-semibold text-white dark:bg-zinc-50 dark:text-zinc-950 hover:opacity-80"
                              >
                                Update
                              </button>
                            </form>
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
