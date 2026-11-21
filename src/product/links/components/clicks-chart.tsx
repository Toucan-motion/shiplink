"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import type { DailyClicks } from "../stats";

// One series, so one color: the theme's primary, which already has a light and
// a dark version. The chart title says what the bars are, so no legend.
const chartConfig = {
  clicks: { label: "Clicks", color: "var(--primary)" },
} satisfies ChartConfig;

// Days are UTC days (see stats.ts), so they're formatted in UTC too.
// Otherwise a visitor west of London would see every bar one day early.
const shortDate = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" });
const longDate = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });

function toDate(day: string) {
  return new Date(`${day}T00:00:00Z`);
}

export function ClicksChart({ days }: { days: DailyClicks[] }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <BarChart data={days} barCategoryGap={2} margin={{ left: -16, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
          tickFormatter={(day: string) => shortDate.format(toDate(day))}
        />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={48} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(day) => longDate.format(toDate(String(day)))}
            />
          }
        />
        <Bar dataKey="clicks" fill="var(--color-clicks)" radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ChartContainer>
  );
}
