"use client";

import { useSyncExternalStore } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface ChartDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface AnalyticsChartsProps {
  data: ChartDataPoint[];
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!isClient) {
    return (
      <div className="h-72 w-full rounded-3xl bg-stone-100 animate-pulse dark:bg-zinc-900/20" />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="rounded-3xl border border-stone-200/40 bg-white p-6 dark:border-zinc-900/40 dark:bg-zinc-950">
        <h3 className="text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest mb-6">
          Gross Volume
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="var(--color-muted-foreground)"
                className="text-[9px] font-bold font-mono"
                tickLine={false}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                className="text-[9px] font-bold font-mono"
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  borderColor: "var(--color-border)",
                  borderRadius: "12px",
                  fontSize: "11px",
                  color: "var(--color-card-foreground)",
                  fontFamily: "monospace",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-primary)"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-stone-200/40 bg-white p-6 dark:border-zinc-900/40 dark:bg-zinc-950">
        <h3 className="text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest mb-6">
          Order Activity
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="var(--color-muted-foreground)"
                className="text-[9px] font-bold font-mono"
                tickLine={false}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                className="text-[9px] font-bold font-mono"
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  borderColor: "var(--color-border)",
                  borderRadius: "12px",
                  fontSize: "11px",
                  color: "var(--color-card-foreground)",
                  fontFamily: "monospace",
                }}
              />
              <Bar dataKey="orders" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
