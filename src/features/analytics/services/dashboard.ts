import "server-only";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema/products";
import { users } from "@/lib/db/schema/users";
import { orders } from "@/lib/db/schema/orders";
import { sql, eq } from "drizzle-orm";

export interface DashboardStats {
  productsCount: number;
  staffCount: number;
  ordersCount: number;
  grossRevenue: string;
}

export async function getDashboardStats(tenantId: string): Promise<DashboardStats> {
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

  return {
    productsCount: productsCountResult[0]?.count || 0,
    staffCount: staffCountResult[0]?.count || 0,
    ordersCount: ordersCountResult[0]?.count || 0,
    grossRevenue: totalSalesResult[0]?.sum || "0.00",
  };
}
