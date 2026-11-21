import { Skeleton } from "@/components/ui/skeleton";

// Shown by Next while the dashboard's data loads. Same shape as the real page,
// so nothing jumps around when it arrives.
export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-label="Loading your links">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
