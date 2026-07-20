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
  const handleReturnClaim = async (returnId: string, status: string) => {
    "use server";
    await updateReturnRequestStatus(returnId, status, orderId);
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
      <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 text-red-600">
        Merchandise Return Claims Filed
      </h3>
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800 space-y-4 pt-2">
        {returnClaims.map((claim) => {
          const targetItem = itemsList.find((i) => i.variantId === claim.variantId);
          return (
            <div key={claim.id} className="text-xs space-y-3 pt-4 first:pt-0">
              <div className="flex justify-between">
                <span className="font-semibold">
                  {targetItem?.productName || "Item"} ({targetItem?.sku})
                </span>
                <span className="font-mono uppercase font-bold text-amber-600">{claim.status}</span>
              </div>
              <p className="text-zinc-500">Reason: {claim.reason}</p>
              {claim.imageUrl && (
                <div className="relative h-20 w-24 overflow-hidden rounded border">
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
                  <form action={handleReturnClaim.bind(null, claim.id, "approved")}>
                    <button
                      type="submit"
                      className="rounded bg-emerald-600 px-3 py-1 font-bold text-white text-[10px]"
                    >
                      Approve return
                    </button>
                  </form>
                  <form action={handleReturnClaim.bind(null, claim.id, "rejected")}>
                    <button
                      type="submit"
                      className="rounded bg-red-600 px-3 py-1 font-bold text-white text-[10px]"
                    >
                      Reject return
                    </button>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
