import { Link2, MousePointerClick, Smartphone, TrendingUp } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { pickRange, RangeTabs } from "@/components/range-tabs";
import { StatTile } from "@/components/stat-tile";
import { requireUser } from "@/core/auth/session";
import { getStatsHistoryDays } from "@/core/billing/plans";
import { getAccountStats } from "@/product/links/analytics";
import { BreakdownList } from "@/product/links/components/breakdown-list";
import { countryItems, deviceItems, referrerItems } from "@/product/links/components/breakdowns";
import { ClicksChart } from "@/product/links/components/clicks-chart";
import { RecentClicks } from "@/product/links/components/recent-clicks";
import { numberFormat, prettyUrl } from "@/product/links/format";
import { countActiveLinks } from "@/product/links/queries";

// The ranges people can pick. Which ones are unlocked depends on the plan's
// history window (plans.ts), not on anything here.
const RANGES = [7, 30, 90];

type Props = {
  searchParams: Promise<{ range?: string }>;
};

export default async function AnalyticsPage({ searchParams }: Props) {
  const user = await requireUser();
  const [{ range }, historyDays] = await Promise.all([searchParams, getStatsHistoryDays(user)]);
  const days = pickRange(range, RANGES, historyDays);

  const [stats, activeLinks] = await Promise.all([
    getAccountStats(user.id, days),
    countActiveLinks(user.id),
  ]);

  const perLink = activeLinks > 0 ? stats.total / activeLinks : 0;
  const mobileShare = stats.total > 0 ? Math.round((stats.devices.mobile / stats.total) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Analytics" description={`All your links, last ${days} days. Days are in UTC.`}>
        <RangeTabs ranges={RANGES} current={days} maxDays={historyDays} basePath="/dashboard/analytics" />
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatTile label="Total clicks" value={numberFormat.format(stats.total)} hint={`Last ${days} days`} icon={MousePointerClick} />
        <StatTile label="Active links" value={numberFormat.format(activeLinks)} hint="Not deleted" icon={Link2} />
        <StatTile label="Clicks per link" value={perLink.toFixed(1)} hint="Average in this period" icon={TrendingUp} />
        <StatTile label="On mobile" value={`${mobileShare}%`} hint="Share of clicks" icon={Smartphone} />
      </div>

      <Panel title="Clicks per day" description={`${numberFormat.format(stats.total)} clicks in the last ${days} days`}>
        {stats.total === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
            No clicks in this period yet. Share a link and the chart fills up as people open it.
          </p>
        ) : (
          <ClicksChart days={stats.days} />
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Top links" className="lg:col-span-2">
          {stats.topLinks.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No clicks in this period.</p>
          ) : (
            <ol className="flex flex-col divide-y divide-border">
              {stats.topLinks.map((link, index) => (
                <li key={link.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <span className="w-5 text-sm text-muted-foreground tabular-nums">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/dashboard/links/${link.id}`}
                      className="text-sm font-medium underline-offset-4 hover:text-primary hover:underline"
                    >
                      /{link.slug}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">{prettyUrl(link.destination)}</p>
                  </div>
                  <span className="text-sm font-medium tabular-nums">{numberFormat.format(link.clicks)}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <Panel title="Devices">
          <BreakdownList items={deviceItems(stats.devices)} total={stats.total} />
        </Panel>

        <Panel title="Top referrers">
          <BreakdownList items={referrerItems(stats.topReferrers)} total={stats.total} />
        </Panel>

        <Panel title="Top countries">
          <BreakdownList items={countryItems(stats.topCountries)} total={stats.total} />
        </Panel>

        <Panel title="Recent clicks">
          <RecentClicks clicks={stats.recentClicks} />
        </Panel>
      </div>
    </div>
  );
}
