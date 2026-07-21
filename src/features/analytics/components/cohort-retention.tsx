interface CohortRow {
  cohort: string;
  size: number;
  m1: number;
  m2: number;
  m3: number;
  m4: number;
}

export function CohortRetention() {
  const cohortData: CohortRow[] = [
    { cohort: "January 2026", size: 120, m1: 100, m2: 45, m3: 38, m4: 31 },
    { cohort: "February 2026", size: 145, m1: 100, m2: 52, m3: 41, m4: 0 },
    { cohort: "March 2026", size: 180, m1: 100, m2: 61, m3: 0, m4: 0 },
    { cohort: "April 2026", size: 210, m1: 100, m2: 0, m3: 0, m4: 0 },
  ];

  const getColorIntensity = (percent: number) => {
    if (percent === 100) return "bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950";
    if (percent >= 50) return "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100";
    if (percent >= 30) return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300";
    if (percent > 0) return "bg-zinc-50 text-zinc-400 dark:bg-zinc-950/20 dark:text-zinc-500";
    return "bg-transparent text-zinc-300 dark:text-zinc-800";
  };

  return (
    <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 dark:border-zinc-800/60 dark:bg-zinc-950 space-y-4 shadow-sm">
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
          Customer Cohort Retention Rate
        </h3>
        <p className="text-[10px] text-zinc-400 font-medium">
          Evaluating percentage of repeating customer orders across subsequent months.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-900">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-2.5 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                Cohort Month
              </th>
              <th className="px-4 py-2.5 text-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest w-28">
                Customers
              </th>
              <th className="px-4 py-2.5 text-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest w-24">
                Month 0
              </th>
              <th className="px-4 py-2.5 text-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest w-24">
                Month 1
              </th>
              <th className="px-4 py-2.5 text-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest w-24">
                Month 2
              </th>
              <th className="px-4 py-2.5 text-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest w-24">
                Month 3
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 font-semibold">
            {cohortData.map((row, idx) => (
              <tr key={idx}>
                <td className="px-4 py-3 font-bold text-zinc-950 dark:text-zinc-50">
                  {row.cohort}
                </td>
                <td className="px-4 py-3 text-center text-zinc-400 font-mono">{row.size}</td>
                <td
                  className={`px-4 py-3 text-center font-mono font-bold border-l border-zinc-100/50 dark:border-zinc-900/50 ${getColorIntensity(row.m1)}`}
                >
                  {row.m1}%
                </td>
                <td
                  className={`px-4 py-3 text-center font-mono font-bold border-l border-zinc-100/50 dark:border-zinc-900/50 ${getColorIntensity(row.m2)}`}
                >
                  {row.m2 > 0 ? `${row.m2}%` : "-"}
                </td>
                <td
                  className={`px-4 py-3 text-center font-mono font-bold border-l border-zinc-100/50 dark:border-zinc-900/50 ${getColorIntensity(row.m3)}`}
                >
                  {row.m3 > 0 ? `${row.m3}%` : "-"}
                </td>
                <td
                  className={`px-4 py-3 text-center font-mono font-bold border-l border-zinc-100/50 dark:border-zinc-900/50 ${getColorIntensity(row.m4)}`}
                >
                  {row.m4 > 0 ? `${row.m4}%` : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
