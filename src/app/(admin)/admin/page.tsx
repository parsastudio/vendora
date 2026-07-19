import { db } from "@/lib/db";
import { products } from "@/lib/db/schema/products";
import { users } from "@/lib/db/schema/users";
import { orders } from "@/lib/db/schema/orders";
import { sql, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils/format";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  const tenantId = session?.user?.tenantId || "";

  const productsCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(eq(products.tenantId, tenantId));

  const staffCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.tenantId, tenantId));

  const ordersCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(eq(orders.tenantId, tenantId));

  const totalSalesResult = await db
    .select({ sum: sql<string>`sum(total_amount)` })
    .from(orders)
    .where(eq(orders.tenantId, tenantId));

  const stats = [
    {
      name: "Total Products",
      value: productsCountResult[0]?.count || 0,
      description: "Active items in your inventory",
    },
    {
      name: "Staff Members",
      value: staffCountResult[0]?.count || 0,
      description: "Teammates with active accounts",
    },
    {
      name: "Total Orders",
      value: ordersCountResult[0]?.count || 0,
      description: "All-time customer sales transactions",
    },
    {
      name: "Gross Revenue",
      value: formatCurrency(parseFloat(totalSalesResult[0]?.sum || "0.00")),
      description: "Processed sales volume",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Welcome back, {session?.user?.name || "User"}
        </h1>
        <p className="text-xs text-zinc-500">
          Here is the live performance review of your tenant storefront.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
          >
            <span className="text-xs font-bold text-zinc-500">{stat.name}</span>
            <p className="mt-2 text-3xl font-extrabold text-zinc-950 dark:text-zinc-50">
              {stat.value}
            </p>
            <p className="mt-1 text-[10px] text-zinc-400">{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
          Operational Directives
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          To proceed with setting up your storefront, complete product entries and verify active
          staff privileges in the left menu.
        </p>
      </div>
    </div>
  );
}
