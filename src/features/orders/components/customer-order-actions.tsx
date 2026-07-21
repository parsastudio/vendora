"use client";

import { useTransition, useState } from "react";
import { cancelOrderByCustomer } from "@/features/orders/actions/customer-order";
import { OrderReturnDialog } from "./order-return-dialog";

interface ReturnItem {
  variantId: string | null;
  sku: string | null;
  productName: string | null;
}

interface CustomerOrderActionsProps {
  orderId: string;
  status: string;
  domain: string;
  items: ReturnItem[];
}

export function CustomerOrderActions({
  orderId,
  status,
  domain,
  items,
}: CustomerOrderActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleCancel = () => {
    setError(null);
    startTransition(async () => {
      const result = await cancelOrderByCustomer(orderId, domain);
      if (!result.success) {
        setError(result.error || "Failed to cancel order");
      }
    });
  };

  const isCancellable = status === "pending" || status === "processing";
  const isReturnable = status === "delivered";

  return (
    <div className="pt-6 border-t border-zinc-100 dark:border-zinc-900 space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-3.5 text-xs font-semibold text-red-600 dark:border-red-950/20 dark:bg-red-950/10">
          ⚠️ {error}
        </div>
      )}

      <div className="flex gap-4 justify-center">
        {isCancellable && (
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="rounded-full bg-rose-600 px-6 py-3 text-xs font-bold text-white shadow-lg transition-all duration-300 hover:bg-rose-700 disabled:opacity-50"
          >
            {isPending ? "Cancelling Order..." : "Cancel Order Request"}
          </button>
        )}

        {isReturnable && <OrderReturnDialog orderId={orderId} domain={domain} items={items} />}
      </div>
    </div>
  );
}
