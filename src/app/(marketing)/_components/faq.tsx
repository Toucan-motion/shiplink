import { Plus } from "lucide-react";

import { PLANS } from "@/core/billing/plans";

// Plain <details> elements: open and close without any JavaScript, and work
// with the keyboard and screen readers out of the box.
const QUESTIONS = [
  {
    q: "Is there a free plan?",
    a: `Yes. ${PLANS.free.name} gives you up to ${PLANS.free.limits.links} active links and ${PLANS.free.statsHistoryDays} days of click history, with no card and no time limit.`,
  },
  {
    q: "What counts as an active link?",
    a: "Every link you haven't deleted. Delete one and you have room for a new one right away.",
  },
  {
    q: "What happens if I cancel Pro?",
    a: `You keep ${PLANS.pro.name} until the end of the month you paid for. After that your links keep working. You just can't create new ones while you're above the ${PLANS.free.name} limit.`,
  },
  {
    q: "What do you track about visitors?",
    a: "The time of the click, the site it came from (only the domain), the country and whether it was a phone or a computer. No IP addresses, no cookies on your short links.",
  },
  {
    q: "Can a short link be reused after I delete it?",
    a: "No. A deleted slug stays retired, so a link you shared once can never start sending people somewhere unexpected.",
  },
  {
    q: "How do payments work?",
    a: "Through Stripe. We never see your card. Invoices, card changes and canceling are all in the billing portal, one click from Settings.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto w-full max-w-3xl scroll-mt-20 px-5 py-24">
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm font-medium text-primary">FAQ</p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Questions, answered</h2>
      </div>
      <div className="mt-12 flex flex-col gap-3">
        {QUESTIONS.map(({ q, a }) => (
          <details
            key={q}
            className="group rounded-xl border border-white/[0.07] bg-card/60 px-5 transition-colors open:bg-card hover:border-white/[0.12]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium [&::-webkit-details-marker]:hidden">
              {q}
              <Plus className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45" aria-hidden />
            </summary>
            <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
