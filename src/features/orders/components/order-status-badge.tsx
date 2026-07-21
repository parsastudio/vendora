import { cn } from "@/lib/utils";

interface OrderStatusBadgeProps {
  type: "status" | "payment";
  value: string;
}

export function OrderStatusBadge({ type, value }: OrderStatusBadgeProps) {
  const normalizedValue = value.toLowerCase();

  const styles: Record<string, string> = {
    pending:
      "bg-amber-50/50 text-amber-700 border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40",
    processing:
      "bg-blue-50/50 text-blue-700 border-blue-200/60 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/40",
    shipped:
      "bg-indigo-50/50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/40",
    delivered:
      "bg-emerald-50/50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40",
    cancelled:
      "bg-rose-50/50 text-rose-700 border-rose-200/60 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40",
    unpaid:
      "bg-rose-50/50 text-rose-700 border-rose-200/60 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40",
    paid: "bg-teal-50/50 text-teal-700 border-teal-200/60 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/40",
    refunded:
      "bg-zinc-100/50 text-zinc-700 border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-300 dark:border-zinc-700",
  };

  const formattedLabel: Record<string, string> = {
    pending: "Pending",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    unpaid: "Unpaid",
    paid: "Paid",
    refunded: "Refunded",
  };

  const resolvedClass = styles[normalizedValue] || styles.pending;
  const label = formattedLabel[normalizedValue] || value;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-widest shadow-sm",
        resolvedClass,
      )}
    >
      {type === "payment" ? `💰 ${label}` : label}
    </span>
  );
}
