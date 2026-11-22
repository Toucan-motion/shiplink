import type { LucideIcon } from "lucide-react";

import { numberFormat } from "../format";

export type BreakdownItem = {
  key: string;
  label: string;
  value: number;
  icon?: LucideIcon;
  // Shown dimmer, for "Unknown" and other catch-all rows.
  muted?: boolean;
};

// A ranked list with a share bar under each row: top referrers, countries,
// devices. The bar is relative to `total`, so rows add up to 100%.
export function BreakdownList({
  items,
  total,
  empty = "No clicks in this period.",
}: {
  items: BreakdownItem[];
  total: number;
  empty?: string;
}) {
  if (items.length === 0 || total === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>;
  }

  return (
    <ul className="flex flex-col gap-3.5">
      {items.map(({ key, label, value, icon: Icon, muted }) => {
        const share = Math.round((value / total) * 100);
        return (
          <li key={key} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className={`flex min-w-0 items-center gap-2 ${muted ? "text-muted-foreground" : ""}`}>
                {Icon && <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />}
                <span className="truncate">{label}</span>
              </span>
              <span className="shrink-0 tabular-nums">
                {numberFormat.format(value)}
                <span className="ml-2 inline-block w-9 text-right text-xs text-muted-foreground">{share}%</span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]" aria-hidden>
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400"
                style={{ width: `${Math.max(share, 2)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
