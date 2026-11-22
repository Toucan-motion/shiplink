import { ChartColumn, Globe, Link2, QrCode, ShieldCheck, Sparkles } from "lucide-react";

import { PLANS } from "@/core/billing/plans";

// Only things the app really does. A feature list is a promise.
const FEATURES = [
  {
    icon: Link2,
    title: "Short links in a second",
    body: "Paste a long URL, get a short one, copy it. The redirect is live before you've switched tabs.",
  },
  {
    icon: Sparkles,
    title: "Custom slugs",
    body: `Make it yours: shiplink.app/launch instead of random letters. Included in ${PLANS.pro.name}.`,
  },
  {
    icon: ChartColumn,
    title: "Clicks per day",
    body: `A clear daily chart for every link and for all of them together, up to ${PLANS.pro.statsHistoryDays} days back.`,
  },
  {
    icon: Globe,
    title: "Referrers and countries",
    body: "See which sites send people your way and where they are, so you know which post worked.",
  },
  {
    icon: QrCode,
    title: "QR codes",
    body: "Every link comes with a QR code. Download it as SVG for print or PNG for slides.",
  },
  {
    icon: ShieldCheck,
    title: "Light on data",
    body: "We keep the referring site and the country. Never IP addresses, never full referring URLs.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-24">
      <div className="mx-auto flex max-w-2xl flex-col gap-4 text-center">
        <p className="text-sm font-medium text-primary">Features</p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Everything a link needs. Nothing it doesn&apos;t.</h2>
        <p className="text-muted-foreground">
          ShipLink does a few things and does them well: short links, honest numbers, and a dashboard
          you can read in ten seconds.
        </p>
      </div>
      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="group flex flex-col gap-3 bg-background p-7 transition-colors hover:bg-card">
            <span className="grid size-10 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-transform group-hover:-translate-y-0.5">
              <Icon className="size-5" aria-hidden />
            </span>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
