import { db } from "@/lib/db";
import { carts, cartItems } from "@/lib/db/schema/orders";
import { inventory, productVariants, products } from "@/lib/db/schema/products";
import { eq, and, lt } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { redirect } from "next/navigation";
import { getOrSetMetricsCache } from "@/features/analytics/utils/metrics-cache";
import { AbandonedCarts } from "@/features/analytics/components/abandoned-carts";
import { LowStockAlert } from "@/features/analytics/components/low-stock-alert";
import { CohortRetention } from "@/features/analytics/components/cohort-retention";

export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  const tenantId = session.user.tenantId;
  const cacheKey = `analytics:${tenantId}:raw-data`;

  const data = await getOrSetMetricsCache(
    cacheKey,
    async () => {
      const activeCarts = await db
        .select({ id: carts.id })
        .from(carts)
        .where(eq(carts.tenantId, tenantId));

      const cartIds = activeCarts.map((c) => c.id);

      let itemsInCartsCount = 0;
      if (cartIds.length > 0) {
        const items = await db.select().from(cartItems);
        itemsInCartsCount = items.filter((itm) => cartIds.includes(itm.cartId)).length;
      }

      const lowStockList = await db
        .select({
          id: inventory.id,
          sku: productVariants.sku,
          name: products.name,
          quantity: inventory.quantity,
        })
        .from(inventory)
        .innerJoin(productVariants, eq(inventory.variantId, productVariants.id))
        .innerJoin(products, eq(productVariants.productId, products.id))
        .where(and(eq(products.tenantId, tenantId), lt(inventory.quantity, 10)));

      return {
        abandonedCount: activeCarts.length,
        estimatedLeak: activeCarts.length * 85.0,
        lowStockItems: lowStockList,
        mockCartsList: activeCarts
          .map((ac) => ({
            id: ac.id,
            customerName: "Anonymous Storefront Guest",
            itemsCount: 2,
            lastUpdated: "Just Now",
          }))
          .slice(0, 5),
      };
    },
    60,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Advanced Metricon Analytics
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Deeper metrics covering customer retention grids, inventory safety caps, and commercial
            leaks.
          </p>
        </div>
        <div>
          <a
            href="/api/admin/analytics/export"
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export All Orders (CSV)
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <AbandonedCarts
          abandonedCount={data.abandonedCount}
          estimatedLostRevenue={data.estimatedLeak}
          recentList={data.mockCartsList}
        />
        <LowStockAlert items={data.lowStockItems} />
      </div>

      <CohortRetention />
    </div>
  );
}
