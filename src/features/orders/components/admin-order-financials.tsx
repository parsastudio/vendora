import { formatCurrency } from "@/features/shared/utils/format";

interface Transaction {
  id: string;
  tenantId: string;
  orderId: string;
  provider: string;
  referenceId: string | null;
  amount: string;
  status: string;
  createdAt: Date;
}

interface AdminOrderFinancialsProps {
  txnList: Transaction[];
}

export function AdminOrderFinancials({ txnList }: AdminOrderFinancialsProps) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 space-y-6">
      <h3 className="text-sm font-black uppercase tracking-widest text-stone-950 dark:text-zinc-100">
        Financial History
      </h3>
      <div className="divide-y divide-stone-100 dark:divide-zinc-900 text-xs font-semibold">
        {txnList.map((tx) => (
          <div key={tx.id} className="flex justify-between py-4 first:pt-0 last:pb-0">
            <div className="space-y-1">
              <span className="font-mono font-black text-stone-950 dark:text-zinc-50">{tx.id}</span>
              <p className="text-stone-400 dark:text-zinc-550 uppercase text-[9px] tracking-widest font-black">
                Provider: {tx.provider} | Reference: {tx.referenceId}
              </p>
            </div>
            <div className="text-right space-y-1 font-semibold">
              <span className="font-black text-stone-955 dark:text-zinc-50 font-mono">
                {formatCurrency(parseFloat(tx.amount))}
              </span>
              <p className="text-emerald-600 text-[9px] uppercase font-black tracking-widest">
                {tx.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
