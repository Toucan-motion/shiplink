import { Skeleton } from "@/components/ui/skeleton";

// Shown by Next while the Links page loads. Same shape as the real page,
// so nothing jumps around when it arrives.
export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading your links">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-[118px] rounded-2xl" />
        ))}
      </div>
      <div className="flex flex-col gap-px overflow-hidden rounded-2xl border border-border">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-16 rounded-none" />
        ))}
      </div>
    </div>
  );
}
