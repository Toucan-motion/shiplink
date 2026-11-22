import { Monitor, Smartphone } from "lucide-react";

import type { RecentClick } from "../analytics";
import { countryName, timeAgo } from "../format";

// The latest clicks across all links, newest first.
export function RecentClicks({ clicks }: { clicks: RecentClick[] }) {
  if (clicks.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No clicks yet.</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {clicks.map((click) => {
        const Icon = click.device === "mobile" ? Smartphone : Monitor;
        return (
          <li key={click.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-white/[0.03]">
              <Icon className="size-3.5 text-muted-foreground" aria-label={click.device} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">/{click.slug}</p>
              <p className="truncate text-xs text-muted-foreground">
                {click.country ? countryName(click.country) : "Unknown country"} ·{" "}
                {click.referrerHost ?? "Direct"}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(click.createdAt)}</span>
          </li>
        );
      })}
    </ul>
  );
}
