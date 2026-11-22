import { cn } from "@/lib/utils";

// The standard box for a section of an app page: a title row, then content.
export function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    // min-w-0: inside a grid, a panel may shrink below its longest text
    // (which then truncates) instead of pushing past the screen edge.
    <section className={cn("flex min-w-0 flex-col rounded-2xl border border-border bg-card", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 px-5 pt-5">
          <div className="flex min-w-0 flex-col gap-1">
            {title && <h2 className="text-[0.95rem] font-medium">{title}</h2>}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="flex-1 p-5">{children}</div>
    </section>
  );
}
