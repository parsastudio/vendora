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
    <div className="rounded-3xl border border-stone-200 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 space-y-6">
      <h3 className="text-sm font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">
        Merchandise Return Claims Filed
      </h3>
      <div className="divide-y divide-stone-150 dark:divide-zinc-900/50 space-y-4 pt-2">
        {returnClaims.map((claim) => {
          const targetItem = itemsList.find((i) => i.variantId === claim.variantId);
          return (
            <div key={claim.id} className="text-xs space-y-4 pt-4 first:pt-0 font-semibold">
              <div className="flex justify-between">
                <span className="font-bold">
                  {targetItem?.productName || "Item"} ({targetItem?.sku})
                </span>
                <span className="font-mono uppercase font-black text-amber-600">
                  {claim.status}
                </span>
              </div>
              <p className="text-stone-500 dark:text-zinc-400 leading-relaxed font-medium">
                Reason: {claim.reason}
              </p>
              {claim.imageUrl && (
                <div className="relative h-24 w-32 overflow-hidden rounded-2xl border border-stone-150">
                  <Image
                    src={claim.imageUrl}
                    alt="Proof metadata"
                    width={128}
                    height={96}
                    unoptimized
                    className="object-cover h-full w-full"
                  />
                </div>
              )}
              {claim.status === "pending" && (
                <div className="flex gap-2.5">
                  <button
                    onClick={() => handleReturnClaim(claim.id, "approved")}
                    disabled={isPending}
                    className="rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white text-[10px] disabled:opacity-50"
                  >
                    Approve Claim
                  </button>
                  <button
                    onClick={() => handleReturnClaim(claim.id, "rejected")}
                    disabled={isPending}
                    className="rounded-xl bg-rose-600 px-5 py-2.5 font-bold text-white text-[10px] disabled:opacity-50"
                  >
                    Reject Claim
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
