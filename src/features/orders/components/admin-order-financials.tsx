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
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800/40 dark:bg-zinc-950 space-y-4 shadow-sm">
      <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
        Audited Financial History
      </h3>
      <div className="divide-y divide-zinc-150 dark:divide-zinc-850 text-xs font-semibold">
        {txnList.map((tx) => (
          <div key={tx.id} className="flex justify-between py-3.5 first:pt-0 last:pb-0">
            <div className="space-y-1">
              <span className="font-mono font-bold text-zinc-950 dark:text-zinc-50">{tx.id}</span>
              <p className="text-zinc-400 uppercase text-[9px] tracking-wider">
                Method: {tx.provider} | Ref: {tx.referenceId}
              </p>
            </div>
            <div className="text-right space-y-1">
              <span className="font-black text-zinc-950 dark:text-zinc-50 font-mono">
                {formatCurrency(parseFloat(tx.amount))}
              </span>
              <p className="text-emerald-600 text-[9px] uppercase font-bold tracking-widest">
                {tx.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
