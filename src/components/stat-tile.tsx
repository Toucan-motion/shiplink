import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: React.ReactNode;
  // One short line under the number: context, not decoration.
  hint?: React.ReactNode;
  icon: LucideIcon;
  className?: string;
};

// One headline number with a label: "Total clicks 1,284".
export function StatTile({ label, value, hint, icon: Icon, className }: Props) {
  return (
    <div
      className={cn(
        "group relative min-w-0 overflow-hidden rounded-2xl border border-border bg-card p-4 transition-colors hover:border-white/[0.12] sm:p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="grid size-8 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      <p className="mt-3 truncate text-[1.75rem] leading-none font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      {hint && <div className="mt-2 truncate text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
