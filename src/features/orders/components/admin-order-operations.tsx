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
    <div className="rounded-3xl border border-stone-200/40 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 space-y-6">
      <h3 className="text-sm font-black uppercase tracking-widest text-stone-950 dark:text-zinc-55">
        Operations
      </h3>

      <form onSubmit={handleStatusUpdate} className="space-y-2">
        <label className="text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
          Fulfillment State
        </label>
        <div className="flex gap-2.5">
          <select
            value={currentStatus}
            onChange={(e) => setCurrentStatus(e.target.value)}
            disabled={isPending}
            className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 font-bold"
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
            className="rounded-xl bg-stone-950 px-4 py-2 text-xs font-bold text-white hover:bg-stone-850 dark:bg-zinc-50 dark:text-zinc-955 disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      </form>

      <form
        onSubmit={handlePaymentUpdate}
        className="space-y-2 pt-5 border-t border-stone-100 dark:border-zinc-900/50"
      >
        <label className="text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
          Billing Audit State
        </label>
        <div className="flex gap-2.5">
          <select
            value={currentPaymentStatus}
            onChange={(e) => setCurrentPaymentStatus(e.target.value)}
            disabled={isPending}
            className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 font-bold"
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-stone-950 px-4 py-2 text-xs font-bold text-white hover:bg-stone-850 dark:bg-zinc-50 dark:text-zinc-955 disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      </form>

      <form
        onSubmit={handleTrackingUpdate}
        className="space-y-2 pt-5 border-t border-stone-100 dark:border-zinc-900/50"
      >
        <label className="text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
          Fulfillment Tracking Code
        </label>
        <div className="flex gap-2.5">
          <input
            type="text"
            value={currentTrackingCode}
            onChange={(e) => setCurrentTrackingCode(e.target.value)}
            disabled={isPending}
            placeholder="e.g. USPS-9400..."
            className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 font-mono"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-stone-950 px-4 py-2 text-xs font-bold text-white hover:bg-stone-850 dark:bg-zinc-50 dark:text-zinc-955 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
