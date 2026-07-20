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
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
      <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Operational Actions</h3>

      <form action={handleStatusUpdate} className="space-y-1.5">
        <label className="text-[10px] font-bold text-zinc-400 uppercase">Change Order Status</label>
        <div className="flex gap-2">
          <select
            name="status"
            defaultValue={status}
            className="flex-1 rounded-md border border-zinc-300 bg-zinc-50 px-2 py-1.5 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            type="submit"
            className="rounded bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950"
          >
            Apply
          </button>
        </div>
      </form>

      <form
        action={handlePaymentUpdate}
        className="space-y-1.5 pt-2 border-t border-zinc-150 dark:border-zinc-850"
      >
        <label className="text-[10px] font-bold text-zinc-400 uppercase">
          Change Payment Status
        </label>
        <div className="flex gap-2">
          <select
            name="paymentStatus"
            defaultValue={paymentStatus}
            className="flex-1 rounded-md border border-zinc-300 bg-zinc-50 px-2 py-1.5 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
          <button
            type="submit"
            className="rounded bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950"
          >
            Apply
          </button>
        </div>
      </form>

      <form
        action={handleTrackingUpdate}
        className="space-y-1.5 pt-2 border-t border-zinc-150 dark:border-zinc-850"
      >
        <label className="text-[10px] font-bold text-zinc-400 uppercase">
          Fulfillment Tracking Code
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            name="trackingCode"
            defaultValue={trackingCode || ""}
            placeholder="e.g. USPS-94001000..."
            className="flex-1 rounded-md border border-zinc-300 bg-zinc-50 px-2 py-1.5 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <button
            type="submit"
            className="rounded bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
