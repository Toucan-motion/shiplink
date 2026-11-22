import { Lock } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

// "7 days / 30 days / 90 days" as links (?range=30), so the server renders
// the chosen range and the URL can be shared or bookmarked.
// Ranges longer than the plan's history are shown locked.
export function RangeTabs({
  ranges,
  current,
  maxDays,
  basePath,
}: {
  ranges: number[];
  current: number;
  maxDays: number;
  basePath: string;
}) {
  return (
    <div className="inline-flex rounded-xl border border-border bg-white/[0.02] p-1">
      {ranges.map((days) => {
        const locked = days > maxDays;
        const active = days === current;
        const label = `${days} days`;

        if (locked) {
          return (
            <span
              key={days}
              title="Longer history is on the Pro plan"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground/60"
            >
              <Lock className="size-3" aria-hidden />
              {label}
            </span>
          );
        }

        return (
          <Link
            key={days}
            href={`${basePath}?range=${days}`}
            scroll={false}
            aria-current={active ? "true" : undefined}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
              active && "bg-primary text-primary-foreground shadow-[0_4px_14px_-6px_var(--primary)] hover:text-primary-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

// Reads ?range= and falls back to the shortest range when it's missing,
// not a number, or longer than the plan allows.
export function pickRange(raw: string | undefined, ranges: number[], maxDays: number) {
  const asked = Number(raw);
  return ranges.includes(asked) && asked <= maxDays ? asked : ranges[0];
}
