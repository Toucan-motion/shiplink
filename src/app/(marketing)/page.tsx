import { ChartColumn, Link2, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/core/auth/session";
import { PricingTable } from "@/core/billing/components/pricing-table";
import { getPlan, PLANS } from "@/core/billing/plans";

const FEATURES = [
  {
    icon: Link2,
    title: "Short links in a second",
    body: "Paste a long URL, get a short one you can share anywhere. On Pro, pick the slug yourself.",
  },
  {
    icon: ChartColumn,
    title: "Stats you can act on",
    body: "Clicks per day, where they came from and which countries. Enough to know what worked.",
  },
  {
    icon: ShieldCheck,
    title: "Light on data",
    body: "We keep the referring site and country, never IP addresses or full referring URLs.",
  },
];

export default async function LandingPage() {
  const session = await getSession();
  const currentPlan = session ? await getPlan(session.user) : null;

  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Short links. Real click stats.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Shorten a link, share it anywhere, and see who clicks: by day, country and referrer.
        </p>
        <div className="flex gap-3">
          <Link href={session ? "/dashboard" : "/signup"} className={buttonVariants({ size: "lg" })}>
            {session ? "Go to dashboard" : "Get started free"}
          </Link>
          <Link href="#pricing" className={buttonVariants({ size: "lg", variant: "outline" })}>
            See pricing
          </Link>
        </div>
      </section>

      <section className="border-y bg-muted/40">
        <div className="mx-auto grid w-full max-w-5xl gap-10 px-6 py-16 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex flex-col gap-2">
              <feature.icon className="size-5" aria-hidden />
              <h2 className="font-medium">{feature.title}</h2>
              <p className="text-sm text-muted-foreground">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto flex w-full max-w-3xl flex-col items-center gap-10 px-6 py-24">
        <div className="flex flex-col gap-3 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Simple pricing</h2>
          <p className="text-muted-foreground">
            Start on {PLANS.free.name}. Upgrade to {PLANS.pro.name} when you need more. Cancel
            any time.
          </p>
        </div>
        <PricingTable currentPlan={currentPlan} />
      </section>

      <section className="border-t">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Your next link deserves numbers</h2>
          <Link href={session ? "/dashboard" : "/signup"} className={buttonVariants({ size: "lg" })}>
            {session ? "Go to dashboard" : "Create your first link"}
          </Link>
        </div>
      </section>
    </main>
  );
}
