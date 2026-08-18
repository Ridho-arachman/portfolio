"use client";

import { Eye, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { VisitPoint } from "./constants";

const chartConfig = {
  visits: {
    label: "Visits",
    color: "var(--color-accent)",
  },
} satisfies ChartConfig;

interface VisitsChartProps {
  visitsOverview: VisitPoint[];
  totalVisits: number;
  deltaLabel: string;
}

export function VisitsChart({ visitsOverview, totalVisits, deltaLabel }: VisitsChartProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-glass-border bg-glass-bg/80 backdrop-blur-xl">
      <header className="flex flex-col gap-4 border-b border-glass-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">Visits Overview</h2>
            <p className="text-xs text-text-muted">Daily visits · Last 30 days</p>
          </div>
        </div>

        <div className="flex items-end gap-3">
          <div className="text-right">
            <p className="text-3xl font-bold tracking-tight tabular-nums">
              {totalVisits.toLocaleString("en-US")}
            </p>
            <p className="text-xs text-text-muted">Total visits (30d)</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-muted px-2.5 py-1 text-xs font-medium text-accent">
            <TrendingUp className="h-3.5 w-3.5" />
            {deltaLabel}
          </span>
        </div>
      </header>

      <div className="p-4 sm:p-5">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-56 w-full sm:h-64"
        >
          <AreaChart
            data={visitsOverview}
            margin={{ left: -14, right: 8, top: 8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillVisits" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-visits)"
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-visits)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="4 8" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={24}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={40}
              allowDecimals={false}
              tick={{ fontSize: 11 }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent className="border-glass-border/60 bg-glass-bg/95 backdrop-blur-xl" />
              }
            />
            <Area
              dataKey="visits"
              type="monotone"
              fill="url(#fillVisits)"
              stroke="var(--color-visits)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </section>
  );
}
