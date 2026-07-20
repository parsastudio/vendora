import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema/orders";
import { productVariants, products } from "@/lib/db/schema/products";
import { eq, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { formatCurrency } from "@/features/shared/utils/format";
import { AnalyticsCharts } from "@/features/analytics/components/analytics-charts";
import { TopProducts } from "@/features/analytics/components/top-products";
import { getDashboardStats } from "@/features/analytics/services/dashboard";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  const tenantId = session?.user?.tenantId || "";

  const statsData = await getDashboardStats(tenantId);

  const stats = [
    {
      name: "Total Products",
      value: statsData.productsCount,
      description: "Active items in your inventory",
    },
    {
      name: "Staff Members",
      value: statsData.staffCount,
      description: "Teammates with active accounts",
    },
    {
      name: "Total Orders",
      value: statsData.ordersCount,
      description: "All-time customer sales transactions",
    },
    {
      name: "Gross Revenue",
      value: formatCurrency(parseFloat(statsData.grossRevenue)),
      description: "Processed sales volume",
    },
  ];

  const recentOrders = await db
    .select({
      createdAt: orders.createdAt,
      totalAmount: orders.totalAmount,
    })
    .from(orders)
    .where(eq(orders.tenantId, tenantId))
    .limit(30);

  const chartMap: Record<string, { revenue: number; orders: number }> = {};
  recentOrders.forEach((o) => {
    const day = new Date(o.createdAt).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
    });
    if (!chartMap[day]) {
      chartMap[day] = { revenue: 0, orders: 0 };
    }
    chartMap[day].revenue += parseFloat(o.totalAmount);
    chartMap[day].orders += 1;
  });

  const chartData = Object.entries(chartMap)
    .map(([date, val]) => ({
      date,
      revenue: val.revenue,
      orders: val.orders,
    }))
    .slice(-10);

  const topProductsList = await db
    .select({
      sku: productVariants.sku,
      name: products.name,
      quantity: sql<number>`cast(sum(${orderItems.quantity}) as integer)`,
      revenue: sql<string>`sum(${orderItems.price} * ${orderItems.quantity})`,
    })
    .from(orderItems)
    .leftJoin(productVariants, eq(orderItems.variantId, productVariants.id))
    .leftJoin(products, eq(productVariants.productId, products.id))
    .where(eq(products.tenantId, tenantId))
    .groupBy(productVariants.sku, products.name)
    .limit(5);

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

      <AnalyticsCharts data={chartData} />

      <TopProducts products={topProductsList} />
    </div>
  );
}
