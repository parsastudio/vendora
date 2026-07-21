import {
  updateOrderStatus,
  updateOrderPaymentStatus,
  updateOrderTracking,
} from "@/features/orders/actions/order";

interface AdminOrderOperationsProps {
  orderId: string;
  status: string;
  paymentStatus: string;
  trackingCode: string | null;
}

export function AdminOrderOperations({
  orderId,
  status,
  paymentStatus,
  trackingCode,
}: AdminOrderOperationsProps) {
  const handleStatusUpdate = async (formData: FormData) => {
    "use server";
    const newStatus = formData.get("status") as string;
    await updateOrderStatus(orderId, newStatus);
  };

  const handlePaymentUpdate = async (formData: FormData) => {
    "use server";
    const newPaymentStatus = formData.get("paymentStatus") as string;
    await updateOrderPaymentStatus(orderId, newPaymentStatus);
  };

  const handleTrackingUpdate = async (formData: FormData) => {
    "use server";
    const code = formData.get("trackingCode") as string;
    await updateOrderTracking(orderId, code);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800/40 dark:bg-zinc-950 space-y-6 shadow-sm">
      <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Operational Actions</h3>

      <form action={handleStatusUpdate} className="space-y-2">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Change Order Status
        </label>
        <div className="flex gap-2">
          <select
            name="status"
            defaultValue={status}
            className="flex-1 rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            type="submit"
            className="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950"
          >
            Apply
          </button>
        </div>
      </form>

      <form
        action={handlePaymentUpdate}
        className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-900"
      >
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Change Payment Status
        </label>
        <div className="flex gap-2">
          <select
            name="paymentStatus"
            defaultValue={paymentStatus}
            className="flex-1 rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
          <button
            type="submit"
            className="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950"
          >
            Apply
          </button>
        </div>
      </form>

      <form
        action={handleTrackingUpdate}
        className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-900"
      >
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Fulfillment Tracking Code
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            name="trackingCode"
            defaultValue={trackingCode || ""}
            placeholder="e.g. USPS-94001000..."
            className="flex-1 rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 font-mono"
          />
          <button
            type="submit"
            className="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
