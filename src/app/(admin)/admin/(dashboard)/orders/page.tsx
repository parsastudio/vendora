import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema/orders";
import { eq, and, like, sql, desc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { redirect } from "next/navigation";
import { formatCurrency, formatDateTime } from "@/features/shared/utils/format";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import Link from "next/link";

interface OrdersPageProps {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  const resolvedParams = await searchParams;
  const search = resolvedParams.search || "";
  const status = resolvedParams.status || "";
  const page = Math.max(1, parseInt(resolvedParams.page || "1"));
  const limit = 10;
  const offset = (page - 1) * limit;

  const tenantId = session.user.tenantId;

  const whereClause = and(
    eq(orders.tenantId, tenantId),
    status ? eq(orders.status, status) : undefined,
    search ? like(orders.id, `%${search}%`) : undefined,
  );

  const orderList = await db
    .select()
    .from(orders)
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(orders.createdAt));

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(whereClause);

  const total = countResult[0]?.count || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-stone-950 dark:text-zinc-50">
          Orders Management
        </h1>
        <p className="text-xs text-stone-400 dark:text-zinc-500 font-medium">
          Monitor transaction states, configure fulfillment actions, and oversee customer billing.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between rounded-3xl border border-stone-200/40 bg-white p-4 dark:border-zinc-900/50 dark:bg-zinc-950">
        <form method="GET" className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search Order ID..."
            className="block w-full max-w-xs rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
          />
          <select
            name="status"
            defaultValue={status}
            className="block w-full max-w-[160px] rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 text-stone-955 dark:text-zinc-50"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            type="submit"
            className="rounded-xl bg-stone-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-stone-850 dark:bg-zinc-50 dark:text-zinc-955"
          >
            Filter
          </button>
        </form>
      </div>

      {orderList.length === 0 ? (
        <div className="flex h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-stone-200 text-center dark:border-zinc-800">
          <p className="text-xs text-stone-400 dark:text-zinc-500 font-semibold">
            No transactions detected.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-stone-200/40 bg-white dark:border-zinc-900/50 dark:bg-zinc-950">
          <table className="min-w-full divide-y divide-stone-150 dark:divide-zinc-900">
            <thead className="bg-stone-50 dark:bg-zinc-900">
              <tr>
                <th className="px-6 py-4.5 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                  Order ID
                </th>
                <th className="px-6 py-4.5 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                  Client
                </th>
                <th className="px-6 py-4.5 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                  Date
                </th>
                <th className="px-6 py-4.5 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                  Fulfillment
                </th>
                <th className="px-6 py-4.5 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                  Billing
                </th>
                <th className="px-6 py-4.5 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                  Amount
                </th>
                <th className="px-6 py-4.5 text-right text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-900/50 font-semibold text-xs">
              {orderList.map((o) => (
                <tr key={o.id}>
                  <td className="whitespace-nowrap px-6 py-5 font-mono font-black text-stone-950 dark:text-zinc-50">
                    {o.id}
                  </td>
                  <td className="whitespace-nowrap px-6 py-5 text-stone-950 dark:text-zinc-50">
                    {o.shippingAddress.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-5 text-stone-450 dark:text-zinc-400 font-mono">
                    {formatDateTime(o.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-5">
                    <OrderStatusBadge type="status" value={o.status} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-5">
                    <OrderStatusBadge type="payment" value={o.paymentStatus} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-5 font-black text-stone-955 dark:text-zinc-50 font-mono">
                    {formatCurrency(parseFloat(o.totalAmount))}
                  </td>
                  <td className="whitespace-nowrap px-6 py-5 text-right">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="rounded-xl bg-stone-50 px-4 py-2 hover:bg-stone-100 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-stone-100 px-6 py-4 dark:border-zinc-900">
              <div className="flex flex-1 justify-between sm:hidden">
                <Link
                  href={`/admin/orders?page=${Math.max(1, page - 1)}&search=${search}&status=${status}`}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-700"
                >
                  Previous
                </Link>
                <Link
                  href={`/admin/orders?page=${Math.min(totalPages, page + 1)}&search=${search}&status=${status}`}
                  className="ml-3 rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-700"
                >
                  Next
                </Link>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-stone-400">
                    Page{" "}
                    <span className="font-extrabold text-stone-950 dark:text-zinc-50 font-mono">
                      {page}
                    </span>{" "}
                    of{" "}
                    <span className="font-extrabold text-stone-955 dark:text-zinc-50 font-mono">
                      {totalPages}
                    </span>
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <Link
                      key={i}
                      href={`/admin/orders?page=${i + 1}&search=${search}&status=${status}`}
                      className={`rounded-xl px-3.5 py-2 text-xs font-bold font-mono ${
                        page === i + 1
                          ? "bg-stone-950 text-white dark:bg-zinc-50 dark:text-zinc-955"
                          : "bg-stone-50 text-stone-400 hover:bg-stone-100 dark:bg-zinc-900"
                      }`}
                    >
                      {i + 1}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
