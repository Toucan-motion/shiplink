import { Skeleton } from "@/components/ui/skeleton";

// Placeholder in the shape of the stats page while its queries run.
export default function LinkStatsLoading() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-label="Loading stats">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-80 w-full rounded-xl" />
      <div className="grid gap-8 md:grid-cols-2">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    </div>
  );
}
