import { CircleAlert, CircleCheck } from "lucide-react";

import { cn } from "@/lib/utils";

// The one line of feedback under a form: red for errors, green for success.
export function FormMessage({ error, success }: { error?: string; success?: string }) {
  const text = error ?? success;
  if (!text) return null;

  const Icon = error ? CircleAlert : CircleCheck;

  return (
    <p
      role={error ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm",
        error
          ? "border-destructive/25 bg-destructive/10 text-red-300"
          : "border-success/25 bg-success/10 text-emerald-300",
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{text}</span>
    </p>
  );
}
