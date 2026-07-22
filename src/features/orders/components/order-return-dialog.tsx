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
        className="rounded-full border border-stone-200 px-8 py-3.5 text-xs font-bold text-stone-950 hover:bg-stone-50"
      >
        File Return Claim
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-stone-950/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-2xl dark:border-zinc-900 dark:bg-zinc-950">
            <h3 className="text-sm font-black uppercase tracking-widest text-stone-950 dark:text-zinc-50">
              Return Claim
            </h3>
            <p className="text-[10px] text-stone-400 mt-1">
              Provide merchandise condition and proof metadata.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-500/[0.04] p-3 text-[10px] font-bold text-rose-700">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  Target Product
                </label>
                <select
                  value={variantId}
                  onChange={(e) => setVariantId(e.target.value)}
                  className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none text-stone-950 dark:text-zinc-50 dark:bg-zinc-900"
                >
                  {items.map((item) => (
                    <option key={item.variantId} value={item.variantId || ""}>
                      {item.productName} ({item.sku || "N/A"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  Auditable Reason
                </label>
                <textarea
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none text-stone-950 dark:text-zinc-50 dark:bg-zinc-900 min-h-[90px] leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  Verification Image
                </label>
                <div>
                  {imageUrl ? (
                    <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-stone-200">
                      <Image
                        src={imageUrl}
                        alt="Verification proof metadata"
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

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full bg-stone-100 px-6 py-2.5 text-xs font-bold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full bg-stone-950 px-6 py-2.5 text-xs font-bold text-white hover:bg-stone-850"
                >
                  {isPending ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
