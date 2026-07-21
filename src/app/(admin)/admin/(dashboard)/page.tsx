import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema/orders";
import { productVariants, products } from "@/lib/db/schema/products";
import { eq, sql, desc } from "drizzle-orm";
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
    .orderBy(desc(orders.createdAt))
    .limit(100);

  const chartMap: Record<string, { revenue: number; orders: number; timestamp: number }> = {};
  recentOrders.forEach((o) => {
    const dateObj = new Date(o.createdAt);
    const day = dateObj.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
    });
    const startOfDay = new Date(
      dateObj.getFullYear(),
      dateObj.getMonth(),
      dateObj.getDate(),
    ).getTime();
    if (!chartMap[day]) {
      chartMap[day] = { revenue: 0, orders: 0, timestamp: startOfDay };
    }
    chartMap[day].revenue += parseFloat(o.totalAmount);
    chartMap[day].orders += 1;
  });

  const chartData = Object.entries(chartMap)
    .map(([date, val]) => ({
      date,
      revenue: parseFloat(val.revenue.toFixed(2)),
      orders: val.orders,
      timestamp: val.timestamp,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)
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
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
          Welcome back, {session?.user?.name || "User"}
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Here is the live performance review of your tenant storefront.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-zinc-800/40 dark:bg-zinc-950 space-y-3"
          >
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              {stat.name}
            </span>
            <p className="text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 font-mono">
              {stat.value}
            </p>
            <p className="text-[10px] text-zinc-400 font-medium">{stat.description}</p>
          </div>
        ))}
      </div>

      <AnalyticsCharts data={chartData} />

      <TopProducts products={topProductsList} />
    </div>
  );
}
