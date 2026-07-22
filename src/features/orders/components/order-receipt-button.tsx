"use client";

export function OrderReceiptButton({ orderId }: { orderId: string }) {
  const handlePrint = () => {
    const printWindow = window.open(`/admin/orders/${orderId}/receipt`, "_blank");
    if (printWindow) {
      printWindow.focus();
    }
  };

  return (
    <button
      onClick={handlePrint}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-xs font-bold text-stone-700 shadow-sm hover:bg-stone-50 h-11"
    >
      <svg className="h-4 w-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
        />
      </svg>
      Print Tax Invoice
    </button>
  );
}
