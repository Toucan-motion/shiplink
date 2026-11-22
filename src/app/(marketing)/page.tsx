import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/core/auth/session";
import { PricingTable } from "@/core/billing/components/pricing-table";
import { getPlan, PLANS } from "@/core/billing/plans";

import { Faq } from "./_components/faq";
import { Features } from "./_components/features";
import { ProductPreview } from "./_components/product-preview";
import { Showcase } from "./_components/showcase";

// What ShipLink runs on. Shown instead of made-up customer logos or user
// counts: a template has no customers yet, and invented numbers mislead.
const BUILT_ON = ["Next.js", "PostgreSQL", "Stripe", "Better Auth", "Resend", "Vercel"];

export default async function LandingPage() {
  const session = await getSession();
  const currentPlan = session ? await getPlan(session.user) : null;
  const startHref = session ? "/dashboard" : "/signup";

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_55%_at_50%_30%,black,transparent)]" aria-hidden />
        <div className="animate-glow pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-primary/25 blur-[140px]" aria-hidden />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-5 pt-20 pb-24 text-center sm:pt-28">
          <Link
            href="/#features"
            className="page-enter mb-8 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <span className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
            Short links, real click stats, QR codes
            <ArrowRight className="size-3" aria-hidden />
          </Link>
          <h1 className="page-enter max-w-3xl bg-gradient-to-b from-white to-white/60 bg-clip-text text-5xl font-semibold tracking-tight text-transparent sm:text-6xl md:text-7xl">
            Shorter links. Bigger possibilities.
          </h1>
          <p className="page-enter mt-6 max-w-xl text-lg text-muted-foreground">
            ShipLink turns long URLs into short links you can share anywhere, then shows you who
            clicks: by day, by country, by referrer.
          </p>
          <div className="page-enter mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href={startHref} className={buttonVariants({ size: "xl" })}>
              {session ? "Go to dashboard" : "Start for free"}
              <ArrowRight aria-hidden />
            </Link>
            <Link href="/#product" className={buttonVariants({ size: "xl", variant: "outline" })}>
              Explore the dashboard
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {PLANS.free.name} forever. No card needed.
          </p>

          <div id="product" className="mt-20 w-full max-w-5xl scroll-mt-24 text-left">
            <ProductPreview />
          </div>
        </div>
      </section>

      {/* Built on */}
      <section className="border-y border-white/[0.06] bg-white/[0.01]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-5 py-10 md:flex-row md:justify-between">
          <p className="text-sm text-muted-foreground">Built on tools you already trust</p>
          <ul className="flex flex-wrap justify-center gap-x-10 gap-y-3">
            {BUILT_ON.map((name) => (
              <li key={name} className="text-[0.95rem] font-semibold tracking-tight text-white/40">
                {name}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Features />
      <Showcase />

      {/* Pricing */}
      <section id="pricing" className="relative scroll-mt-20 border-t border-white/[0.06] py-24">
        <div className="pointer-events-none absolute top-0 left-1/2 h-72 w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" aria-hidden />
        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-12 px-5">
          <div className="flex flex-col gap-4 text-center">
            <p className="text-sm font-medium text-primary">Pricing</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Simple, honest pricing</h2>
            <p className="text-muted-foreground">
              Start on {PLANS.free.name}. Upgrade to {PLANS.pro.name} when you need more. Cancel any time.
            </p>
          </div>
          <PricingTable currentPlan={currentPlan} />
        </div>
      </section>

      <Faq />

      {/* Final call to action */}
      <section className="px-5 pb-24">
        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-6 overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-b from-primary/[0.14] to-card px-6 py-16 text-center">
          <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" aria-hidden />
          <h2 className="relative max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Your next link deserves numbers
          </h2>
          <p className="relative max-w-md text-muted-foreground">
            Create your first short link in under a minute. See its first click a few seconds later.
          </p>
          <Link href={startHref} className={buttonVariants({ size: "xl", className: "relative" })}>
            {session ? "Go to dashboard" : "Create your first link"}
            <ArrowRight aria-hidden />
          </Link>
        </div>
      </section>
    </main>
  );
}
