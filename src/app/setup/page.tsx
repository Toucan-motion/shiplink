import { notFound } from "next/navigation";

import { LogoMark } from "@/components/logo";
import { envProblems } from "@/core/env";

// The list must reflect the variables of the running server, not the build.
export const dynamic = "force-dynamic";

// What every page shows while an environment variable is missing (src/proxy.ts
// sends visitors here). Once the env is complete, this page doesn't exist.
export default function SetupPage() {
  if (envProblems.length === 0) notFound();

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-6 overflow-hidden px-6 py-24">
      <div className="pointer-events-none absolute top-1/3 left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" aria-hidden />
      <LogoMark className="relative size-10" />
      <div className="relative max-w-lg text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Almost there</h1>
        <p className="mt-3 text-muted-foreground">
          The app is deployed, but some environment variables are missing or wrong. Add them
          in your host&apos;s settings (Vercel: Settings → Environment Variables, Railway: the
          service&apos;s Variables tab), then redeploy.
        </p>
      </div>
      <ul className="relative w-full max-w-lg divide-y divide-border rounded-2xl border border-border bg-card font-mono text-sm">
        {envProblems.map((problem) => (
          <li key={problem} className="px-4 py-3">
            {problem}
          </li>
        ))}
      </ul>
      <p className="relative max-w-lg text-center text-sm text-muted-foreground">
        Every variable is explained in <code className="text-foreground">.env.example</code> and{" "}
        <code className="text-foreground">docs/DEPLOY.md</code>.
      </p>
    </main>
  );
}
