import { cn } from "@/lib/utils";

interface OrderStatusBadgeProps {
  type: "status" | "payment";
  value: string;
}

export function OrderStatusBadge({ type, value }: OrderStatusBadgeProps) {
  const normalizedValue = value.toLowerCase();

  const styles: Record<string, string> = {
    pending:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50",
    processing:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50",
    shipped:
      "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/50",
    delivered:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50",
    cancelled:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50",
    unpaid:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50",
    paid: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/50",
    refunded:
      "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800/50 dark:text-zinc-300 dark:border-zinc-700",
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
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        resolvedClass,
      )}
    >
      {type === "payment" ? `💰 ${label}` : label}
    </span>
  );
}
