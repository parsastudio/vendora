import { cn } from "@/lib/utils";

interface OrderStatusBadgeProps {
  type: "status" | "payment";
  value: string;
}

export function OrderStatusBadge({ type, value }: OrderStatusBadgeProps) {
  const normalizedValue = value.toLowerCase();

  const styles: Record<string, string> = {
    pending:
      "bg-amber-500/[0.06] text-amber-700 border-amber-500/20 dark:bg-amber-500/[0.1] dark:text-amber-400",
    processing:
      "bg-sky-500/[0.06] text-sky-700 border-sky-500/20 dark:bg-sky-500/[0.1] dark:text-sky-400",
    shipped:
      "bg-violet-500/[0.06] text-violet-700 border-violet-500/20 dark:bg-violet-500/[0.1] dark:text-violet-400",
    delivered:
      "bg-emerald-500/[0.06] text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/[0.1] dark:text-emerald-400",
    cancelled:
      "bg-rose-500/[0.06] text-rose-700 border-rose-500/20 dark:bg-rose-500/[0.1] dark:text-rose-400",
    unpaid:
      "bg-rose-500/[0.06] text-rose-700 border-rose-500/20 dark:bg-rose-500/[0.1] dark:text-rose-400",
    paid: "bg-teal-500/[0.06] text-teal-700 border-teal-500/20 dark:bg-teal-500/[0.1] dark:text-teal-400",
    refunded:
      "bg-stone-500/[0.06] text-stone-700 border-stone-500/20 dark:bg-zinc-500/[0.1] dark:text-zinc-400",
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
        "inline-flex items-center rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-widest shadow-none",
        resolvedClass,
      )}
    >
      {type === "payment" ? `💰 ${label}` : label}
    </span>
  );
}
