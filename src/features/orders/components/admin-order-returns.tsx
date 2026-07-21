"use client";

import { useTransition } from "react";
import Image from "next/image";
import { updateReturnRequestStatus } from "@/features/orders/actions/customer-order";

interface ReturnClaim {
  id: string;
  orderId: string;
  variantId: string | null;
  reason: string;
  status: string;
  imageUrl: string | null;
  createdAt: Date;
}

interface OrderItem {
  id: string;
  variantId: string | null;
  quantity: number;
  price: string;
  sku: string | null;
  productName: string | null;
  attributes: Record<string, string> | null;
}

interface AdminOrderReturnsProps {
  orderId: string;
  returnClaims: ReturnClaim[];
  itemsList: OrderItem[];
}

export function AdminOrderReturns({ orderId, returnClaims, itemsList }: AdminOrderReturnsProps) {
  const [isPending, startTransition] = useTransition();

  const handleReturnClaim = (returnId: string, status: string) => {
    startTransition(async () => {
      try {
        await updateReturnRequestStatus(returnId, status, orderId);
      } catch (err) {
        console.error(err);
      }
    });
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800/40 dark:bg-zinc-950 space-y-4">
      <h3 className="text-sm font-bold text-red-600 dark:text-red-400">
        Merchandise Return Claims Filed
      </h3>
      <div className="divide-y divide-zinc-150 dark:divide-zinc-850 space-y-4 pt-2">
        {returnClaims.map((claim) => {
          const targetItem = itemsList.find((i) => i.variantId === claim.variantId);
          return (
            <div key={claim.id} className="text-xs space-y-3 pt-4 first:pt-0 font-semibold">
              <div className="flex justify-between">
                <span className="font-bold">
                  {targetItem?.productName || "Item"} ({targetItem?.sku})
                </span>
                <span className="font-mono uppercase font-bold text-amber-600">{claim.status}</span>
              </div>
              <p className="text-zinc-500 leading-relaxed">Reason: {claim.reason}</p>
              {claim.imageUrl && (
                <div className="relative h-20 w-24 overflow-hidden rounded-xl border">
                  <Image
                    src={claim.imageUrl}
                    alt="Proof"
                    width={96}
                    height={80}
                    unoptimized
                    className="object-cover h-full w-full"
                  />
                </div>
              )}
              {claim.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReturnClaim(claim.id, "approved")}
                    disabled={isPending}
                    className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white text-[10px] disabled:opacity-50"
                  >
                    {isPending ? "Processing..." : "Approve Return"}
                  </button>
                  <button
                    onClick={() => handleReturnClaim(claim.id, "rejected")}
                    disabled={isPending}
                    className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white text-[10px] disabled:opacity-50"
                  >
                    {isPending ? "Processing..." : "Reject Return"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
