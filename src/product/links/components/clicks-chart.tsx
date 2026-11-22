"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import type { DailyClicks } from "../stats";

// One series, so one color: the brand violet. The card title says what the
// bars are, so there's no legend.
const chartConfig = {
  clicks: { label: "Clicks", color: "var(--primary)" },
} satisfies ChartConfig;

// Days are UTC days (see days.ts), so they're formatted in UTC too.
// Otherwise a visitor west of London would see every bar one day early.
const shortDate = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" });
const longDate = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });

function toDate(day: string) {
  return new Date(`${day}T00:00:00Z`);
}

export function ClicksChart({ days }: { days: DailyClicks[] }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full sm:h-72">
      <BarChart data={days} barCategoryGap={days.length > 31 ? 1 : 3} margin={{ left: -16, right: 4, top: 8 }}>
        <defs>
          {/* Bars fade from bright violet at the top to deeper violet at the base. */}
          <linearGradient id="clicks-bar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 6" stroke="rgb(255 255 255 / 0.06)" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          minTickGap={28}
          tickFormatter={(day: string) => shortDate.format(toDate(day))}
        />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={48} />
        <ChartTooltip
          cursor={{ fill: "rgb(139 92 246 / 0.08)" }}
          content={<ChartTooltipContent labelFormatter={(day) => longDate.format(toDate(String(day)))} />}
        />
        <Bar
          dataKey="clicks"
          fill="url(#clicks-bar)"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
          animationDuration={600}
        />
      </BarChart>
    </ChartContainer>
  );
}
