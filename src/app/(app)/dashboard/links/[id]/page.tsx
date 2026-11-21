import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/core/auth/session";
import { getPlan, getStatsHistoryDays, PLANS } from "@/core/billing/plans";
import { env } from "@/core/env";
import { ClicksChart } from "@/product/links/components/clicks-chart";
import { CopyButton } from "@/product/links/components/copy-button";
import { TopList } from "@/product/links/components/top-list";
import { findOwnedLink, getLinkStats } from "@/product/links/stats";

type Props = {
  params: Promise<{ id: string }>;
};

const countryNames = new Intl.DisplayNames("en", { type: "region" });

function countryName(code: string) {
  try {
    return countryNames.of(code) ?? code;
  } catch {
    // Not a valid region code. Show it as stored.
    return code;
  }
}

export default async function LinkStatsPage({ params }: Props) {
  const { id } = await params;
  const user = await requireUser();

  // Someone else's link and a link that doesn't exist look exactly the same:
  // a 404. Answering "forbidden" would confirm the id is real.
  const link = await findOwnedLink(id, user.id);
  if (!link) notFound();

  const [historyDays, planId] = await Promise.all([getStatsHistoryDays(user), getPlan(user)]);
  const stats = await getLinkStats(link.id, historyDays);
  const shortUrl = `${env.NEXT_PUBLIC_APP_URL}/${link.slug}`;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
          ← All links
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">/{link.slug}</h1>
          <CopyButton text={shortUrl} />
        </div>
        <p className="truncate text-sm text-muted-foreground">→ {link.destination}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clicks per day</CardTitle>
          <CardDescription>
            {stats.total} {stats.total === 1 ? "click" : "clicks"} in the last {historyDays} days
            (UTC). The {PLANS[planId].name} plan keeps {historyDays} days of history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.total === 0 ? (
            // A flat line of zeros looks broken. Say what to do instead.
            <p className="rounded-md border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
              No clicks yet. Share {shortUrl} and the chart fills up as people open it.
            </p>
          ) : (
            <ClicksChart days={stats.days} />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        <TopList title="Top referrers" column="Source" entries={stats.topReferrers} />
        <TopList
          title="Top countries"
          column="Country"
          entries={stats.topCountries}
          formatName={countryName}
        />
      </div>
    </div>
  );
}
