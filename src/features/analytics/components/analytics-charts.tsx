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
      <div className="h-72 w-full rounded-2xl bg-zinc-100 animate-pulse dark:bg-zinc-900/30" />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 dark:border-zinc-800/60 dark:bg-zinc-950">
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">
          Gross Revenue ($)
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#09090b" stopOpacity={0.06} />
                  <stop offset="95%" stopColor="#09090b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-zinc-100 dark:stroke-zinc-900"
              />
              <XAxis
                dataKey="date"
                className="text-[10px] font-bold font-mono fill-zinc-400"
                tickLine={false}
              />
              <YAxis className="text-[10px] font-bold font-mono fill-zinc-400" tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#09090b",
                  borderColor: "#222227",
                  borderRadius: "12px",
                  fontSize: "11px",
                  color: "#f8fafc",
                  fontFamily: "monospace",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#09090b"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 dark:border-zinc-800/60 dark:bg-zinc-950">
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">
          Order Volume
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-zinc-100 dark:stroke-zinc-900"
              />
              <XAxis
                dataKey="date"
                className="text-[10px] font-bold font-mono fill-zinc-400"
                tickLine={false}
              />
              <YAxis className="text-[10px] font-bold font-mono fill-zinc-400" tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#09090b",
                  borderColor: "#222227",
                  borderRadius: "12px",
                  fontSize: "11px",
                  color: "#f8fafc",
                  fontFamily: "monospace",
                }}
              />
              <Bar dataKey="orders" fill="#09090b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
