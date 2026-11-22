import { ChartColumn, Link2, Settings } from "lucide-react";

import { LogoMark } from "@/components/logo";

// A drawing of the app for the landing page, built from plain divs with
// made-up sample numbers. It isn't connected to any real data.
const SAMPLE_BARS = [
  18, 24, 21, 30, 28, 35, 33, 26, 38, 44, 41, 36, 48, 52, 47, 55, 50, 58, 62, 57, 66, 61, 70, 68, 74, 72, 80, 77, 86, 92,
];

const SAMPLE_TILES = [
  { label: "Total clicks", value: "12,480" },
  { label: "Active links", value: "36" },
  { label: "On mobile", value: "58%" },
];

const SAMPLE_COUNTRIES = [
  { name: "United States", share: 41 },
  { name: "Germany", share: 18 },
  { name: "Poland", share: 14 },
  { name: "United Kingdom", share: 11 },
];

export function ProductPreview() {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-[#0d0d16]/90 p-1.5 shadow-[0_40px_120px_-40px_rgb(139_92_246/0.55),0_0_0_1px_rgb(255_255_255/0.03)] backdrop-blur">
      {/* Window bar */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="ml-3 hidden rounded-md bg-white/[0.04] px-3 py-1 text-[11px] text-muted-foreground sm:block">
          shiplink.app/dashboard/analytics
        </span>
      </div>

      <div className="flex overflow-hidden rounded-xl border border-white/[0.06] bg-background">
        {/* Sidebar */}
        <div className="hidden w-44 shrink-0 flex-col gap-1 border-r border-white/[0.06] bg-sidebar p-3 md:flex">
          <div className="mb-3 flex items-center gap-2 px-1 text-sm font-semibold">
            <LogoMark className="size-6" /> ShipLink
          </div>
          {[
            { icon: Link2, label: "Links" },
            { icon: ChartColumn, label: "Analytics", active: true },
            { icon: Settings, label: "Settings" },
          ].map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${active ? "bg-sidebar-accent text-foreground" : "text-muted-foreground"}`}
            >
              <Icon className={`size-3.5 ${active ? "text-primary" : ""}`} /> {label}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Analytics</p>
            <div className="flex gap-1 rounded-lg border border-white/[0.06] p-0.5 text-[10px]">
              <span className="rounded-md px-2 py-0.5 text-muted-foreground">7d</span>
              <span className="rounded-md bg-primary px-2 py-0.5 text-white">30d</span>
              <span className="rounded-md px-2 py-0.5 text-muted-foreground">90d</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {SAMPLE_TILES.map((tile) => (
              <div key={tile.label} className="rounded-lg border border-white/[0.06] bg-card p-2.5">
                <p className="text-[10px] text-muted-foreground">{tile.label}</p>
                <p className="mt-1 text-base font-semibold tabular-nums sm:text-lg">{tile.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-2 lg:grid-cols-[1fr_180px]">
            <div className="rounded-lg border border-white/[0.06] bg-card p-3">
              <p className="mb-3 text-[11px] text-muted-foreground">Clicks per day</p>
              <div className="flex h-28 items-end gap-[3px] sm:h-36">
                {SAMPLE_BARS.map((height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t-[3px] bg-gradient-to-t from-violet-700 to-violet-400 opacity-90"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="hidden flex-col gap-2.5 rounded-lg border border-white/[0.06] bg-card p-3 lg:flex">
              <p className="text-[11px] text-muted-foreground">Top countries</p>
              {SAMPLE_COUNTRIES.map((country) => (
                <div key={country.name} className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px]">
                    <span>{country.name}</span>
                    <span className="text-muted-foreground">{country.share}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/[0.05]">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${country.share * 2}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
