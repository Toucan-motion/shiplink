import { cn } from "@/lib/utils";

// The one line of feedback under a form: red for errors, green for success.
export function FormMessage({ error, success }: { error?: string; success?: string }) {
  const text = error ?? success;
  if (!text) return null;

  return (
    <p
      role={error ? "alert" : "status"}
      className={cn(
        "rounded-md px-3 py-2 text-sm",
        error ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-700",
      )}
    >
      {text}
    </p>
  );
}
