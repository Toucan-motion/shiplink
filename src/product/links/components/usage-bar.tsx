import { Progress } from "@/components/ui/progress";

type Props = {
  used: number;
  // null means the plan has no limit.
  max: number | null;
  planName: string;
};

// "7 / 10 links" with a bar, so people see the limit coming before they hit it.
export function UsageBar({ used, max, planName }: Props) {
  if (max === null) {
    return (
      <p className="text-sm text-muted-foreground">
        {used} links · Unlimited on {planName}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        {used} / {max} links on the {planName} plan
      </p>
      <Progress value={Math.min(100, (used / max) * 100)} aria-label="Links used" className="max-w-xs" />
    </div>
  );
}
