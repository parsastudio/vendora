"use client";

import { useState, useTransition } from "react";
import { requestOrderReturn } from "@/features/orders/actions/customer-order";
import { FileUpload } from "@/features/shared/components/ui/file-upload";
import Image from "next/image";

interface ReturnItem {
  variantId: string | null;
  sku: string | null;
  productName: string | null;
}

interface OrderReturnDialogProps {
  orderId: string;
  domain: string;
  items: ReturnItem[];
}

export function OrderReturnDialog({ orderId, domain, items }: OrderReturnDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [variantId, setVariantId] = useState(items[0]?.variantId || "");
  const [reason, setReason] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!variantId) return;

    startTransition(async () => {
      const result = await requestOrderReturn(orderId, variantId, reason, imageUrl || null, domain);

      if (result.success) {
        setIsOpen(false);
        setReason("");
        setImageUrl("");
      } else {
        setError(result.error || "Failed to submit request");
      }
    });
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-full border border-red-200 px-5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-950/20"
      >
        File Return Claim
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
              File Merchandise Return
            </h3>
            <p className="text-[10px] text-zinc-400">
              Provide defect description and reference photo of damaged goods.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {error && (
                <div className="rounded bg-red-50 p-2 text-[10px] text-red-600 dark:bg-red-950/25">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-zinc-500">Select Item</label>
                <select
                  value={variantId}
                  onChange={(e) => setVariantId(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50"
                >
                  {items.map((item) => (
                    <option key={item.variantId} value={item.variantId || ""}>
                      {item.productName} ({item.sku || "N/A"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500">Detailed Reason</label>
                <textarea
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500">Defect Image</label>
                <div className="mt-1">
                  {imageUrl ? (
                    <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-zinc-200">
                      <Image
                        src={imageUrl}
                        alt="Defect proof upload"
                        width={96}
                        height={96}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <FileUpload onUploadSuccess={setImageUrl} />
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded bg-zinc-950 px-4 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950"
                >
                  {isPending ? "Submitting..." : "Submit Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
