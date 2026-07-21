"use client";

import { useTransition, useState } from "react";
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
  const [isPending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentPaymentStatus, setCurrentPaymentStatus] = useState(paymentStatus);
  const [currentTrackingCode, setCurrentTrackingCode] = useState(trackingCode || "");

  const handleStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, currentStatus);
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handlePaymentUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateOrderPaymentStatus(orderId, currentPaymentStatus);
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleTrackingUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateOrderTracking(orderId, currentTrackingCode);
      } catch (err) {
        console.error(err);
      }
    });
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800/40 dark:bg-zinc-950 space-y-6 shadow-sm">
      <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Operational Actions</h3>

      <form onSubmit={handleStatusUpdate} className="space-y-2">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Change Order Status
        </label>
        <div className="flex gap-2">
          <select
            value={currentStatus}
            onChange={(e) => setCurrentStatus(e.target.value)}
            disabled={isPending}
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
            disabled={isPending}
            className="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 disabled:opacity-50"
          >
            {isPending ? "..." : "Apply"}
          </button>
        </div>
      </form>

      <form
        onSubmit={handlePaymentUpdate}
        className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-900"
      >
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Change Payment Status
        </label>
        <div className="flex gap-2">
          <select
            value={currentPaymentStatus}
            onChange={(e) => setCurrentPaymentStatus(e.target.value)}
            disabled={isPending}
            className="flex-1 rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 disabled:opacity-50"
          >
            {isPending ? "..." : "Apply"}
          </button>
        </div>
      </form>

      <form
        onSubmit={handleTrackingUpdate}
        className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-900"
      >
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Fulfillment Tracking Code
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={currentTrackingCode}
            onChange={(e) => setCurrentTrackingCode(e.target.value)}
            disabled={isPending}
            placeholder="e.g. USPS-94001000..."
            className="flex-1 rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 font-mono"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 disabled:opacity-50"
          >
            {isPending ? "..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
