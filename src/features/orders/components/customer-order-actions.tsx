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
    <div className="pt-8 border-t border-stone-100 dark:border-zinc-900/50 space-y-4">
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-500/[0.04] p-4 text-xs font-bold text-rose-700">
          {error}
        </div>
      )}

      <div className="flex gap-4 justify-center">
        {isCancellable && (
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="rounded-full bg-rose-600 px-8 py-3.5 text-xs font-bold text-white hover:bg-rose-700"
          >
            {isPending ? "Cancelling..." : "Cancel Order Request"}
          </button>
        )}

        {isReturnable && <OrderReturnDialog orderId={orderId} domain={domain} items={items} />}
      </div>
    </div>
  );
}
