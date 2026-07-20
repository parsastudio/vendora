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
    <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
      {error && (
        <div className="rounded bg-red-50 p-2 text-xs text-red-600 dark:bg-red-950/25">{error}</div>
      )}

      <div className="flex gap-3 justify-center">
        {isCancellable && (
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="rounded-full bg-red-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? "Processing..." : "Cancel Order Request"}
          </button>
        )}

        {isReturnable && <OrderReturnDialog orderId={orderId} domain={domain} items={items} />}
      </div>
    </div>
  );
}
