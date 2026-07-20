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
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
      <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
        Audited Financial History
      </h3>
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
        {txnList.map((tx) => (
          <div key={tx.id} className="flex justify-between py-3 first:pt-0 last:pb-0">
            <div>
              <span className="font-mono font-bold">{tx.id}</span>
              <p className="text-zinc-400 uppercase text-[10px]">
                Method: {tx.provider} | Ref: {tx.referenceId}
              </p>
            </div>
            <div className="text-right">
              <span className="font-bold">{formatCurrency(parseFloat(tx.amount))}</span>
              <p className="text-emerald-600 text-[10px] uppercase font-bold">{tx.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
