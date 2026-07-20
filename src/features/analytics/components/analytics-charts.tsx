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
    return <div className="h-72 w-full rounded-xl bg-zinc-100 animate-pulse dark:bg-zinc-900" />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">
          Gross Revenue ($)
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#18181b" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-zinc-100 dark:stroke-zinc-800"
              />
              <XAxis dataKey="date" className="text-[10px] fill-zinc-400" />
              <YAxis className="text-[10px] fill-zinc-400" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#18181b"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">
          Order Volume
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-zinc-100 dark:stroke-zinc-800"
              />
              <XAxis dataKey="date" className="text-[10px] fill-zinc-400" />
              <YAxis className="text-[10px] fill-zinc-400" />
              <Tooltip />
              <Bar dataKey="orders" fill="#18181b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
