import { ArrowLeft, Globe, MapPin, MousePointerClick, Smartphone } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { pickRange, RangeTabs } from "@/components/range-tabs";
import { StatTile } from "@/components/stat-tile";
import { requireUser } from "@/core/auth/session";
import { getPlan, getStatsHistoryDays, PLANS } from "@/core/billing/plans";
import { env } from "@/core/env";
import { BreakdownList } from "@/product/links/components/breakdown-list";
import { countryItems, deviceItems, referrerItems } from "@/product/links/components/breakdowns";
import { ClicksChart } from "@/product/links/components/clicks-chart";
import { CopyButton } from "@/product/links/components/copy-button";
import { QrButton } from "@/product/links/components/qr-button";
import { countryName, numberFormat, prettyUrl } from "@/product/links/format";
import { findOwnedLink, getLinkStats } from "@/product/links/stats";

// Same ranges as the Analytics page; the plan decides which are unlocked.
const RANGES = [7, 30, 90];

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ range?: string }>;
};

export default async function LinkStatsPage({ params, searchParams }: Props) {
  const [{ id }, { range }] = await Promise.all([params, searchParams]);
  const user = await requireUser();

  // Someone else's link and a link that doesn't exist look exactly the same:
  // a 404. Answering "forbidden" would confirm the id is real.
  const link = await findOwnedLink(id, user.id);
  if (!link) notFound();

  const [historyDays, planId] = await Promise.all([getStatsHistoryDays(user), getPlan(user)]);
  const days = pickRange(range, RANGES, historyDays);
  const stats = await getLinkStats(link.id, days);
  const shortUrl = `${env.NEXT_PUBLIC_APP_URL}/${link.slug}`;

  const topReferrer = stats.topReferrers[0];
  const topCountry = stats.topCountries[0];
  const mobileShare = stats.total > 0 ? Math.round((stats.devices.mobile / stats.total) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> All links
      </Link>

      <PageHeader
        title={`/${link.slug}`}
        description={
          <a href={link.destination} target="_blank" rel="noreferrer" className="break-all hover:text-foreground">
            → {prettyUrl(link.destination)}
          </a>
        }
      >
        <CopyButton text={shortUrl} withLabel />
        <QrButton linkId={link.id} slug={link.slug} shortUrl={shortUrl} withLabel />
      </PageHeader>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <RangeTabs ranges={RANGES} current={days} maxDays={historyDays} basePath={`/dashboard/links/${link.id}`} />
        <p className="text-xs text-muted-foreground">
          The {PLANS[planId].name} plan keeps {historyDays} days of history. Days are in UTC.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatTile label="Clicks" value={numberFormat.format(stats.total)} hint={`Last ${days} days`} icon={MousePointerClick} />
        <StatTile
          label="Top referrer"
          value={topReferrer ? (topReferrer.name ?? "Direct") : "—"}
          hint={topReferrer ? `${numberFormat.format(topReferrer.clicks)} clicks` : "No clicks yet"}
          icon={Globe}
        />
        <StatTile
          label="Top country"
          value={topCountry ? (topCountry.name ? countryName(topCountry.name) : "Unknown") : "—"}
          hint={topCountry ? `${numberFormat.format(topCountry.clicks)} clicks` : "No clicks yet"}
          icon={MapPin}
        />
        <StatTile label="On mobile" value={`${mobileShare}%`} hint="Share of clicks" icon={Smartphone} />
      </div>

      <Panel title="Clicks per day" description={`${numberFormat.format(stats.total)} clicks in the last ${days} days`}>
        {stats.total === 0 ? (
          // A flat line of zeros looks broken. Say what to do instead.
          <p className="rounded-xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
            No clicks yet. Share {shortUrl} and the chart fills up as people open it.
          </p>
        ) : (
          <ClicksChart days={stats.days} />
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Top referrers">
          <BreakdownList items={referrerItems(stats.topReferrers)} total={stats.total} />
        </Panel>
        <Panel title="Top countries">
          <BreakdownList items={countryItems(stats.topCountries)} total={stats.total} />
        </Panel>
        <Panel title="Devices">
          <BreakdownList items={deviceItems(stats.devices)} total={stats.total} />
        </Panel>
      </div>
    </div>
  );
}
