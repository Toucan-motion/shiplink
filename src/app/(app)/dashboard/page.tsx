import { Link2, MousePointerClick, TrendingUp } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatTile } from "@/components/stat-tile";
import { Progress } from "@/components/ui/progress";
import { requireUser } from "@/core/auth/session";
import { canUse, getUsage, PLANS } from "@/core/billing/plans";
import { env } from "@/core/env";
import { CreateLinkDialog } from "@/product/links/components/create-link-dialog";
import { LinksList } from "@/product/links/components/links-list";
import { numberFormat } from "@/product/links/format";
import { listLinks } from "@/product/links/queries";

export default async function DashboardPage() {
  const user = await requireUser();

  const [links, usage, canUseCustomSlug] = await Promise.all([
    listLinks(user.id),
    getUsage(user, "links"),
    canUse(user, "customSlug"),
  ]);

  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
  const average = links.length > 0 ? totalClicks / links.length : 0;
  const topLink = links.reduce<(typeof links)[number] | null>(
    (best, link) => (best === null || link.clicks > best.clicks ? link : best),
    null,
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Links" description="Create, share and keep an eye on your short links.">
        <CreateLinkDialog
          canUseCustomSlug={canUseCustomSlug}
          host={new URL(env.NEXT_PUBLIC_APP_URL).host}
          limitMessage={usage.limitMessage}
          upgradeLabel={`Upgrade to ${PLANS.pro.name} — $${PLANS.pro.priceMonthly}/month`}
        />
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatTile
          label="Active links"
          icon={Link2}
          value={usage.max === null ? numberFormat.format(usage.used) : `${usage.used} / ${usage.max}`}
          hint={
            usage.max === null ? (
              `Unlimited on ${usage.planName}`
            ) : (
              // "7 / 10" with a bar, so people see the limit coming before they hit it.
              <Progress
                value={Math.min(100, (usage.used / usage.max) * 100)}
                aria-label="Links used"
                className="mt-1"
              />
            )
          }
        />
        <StatTile label="Total clicks" icon={MousePointerClick} value={numberFormat.format(totalClicks)} hint="All time, all links" />
        <StatTile
          className="col-span-2 sm:col-span-1"
          label="Top link"
          icon={TrendingUp}
          value={topLink && topLink.clicks > 0 ? `/${topLink.slug}` : "—"}
          hint={topLink && topLink.clicks > 0 ? `${numberFormat.format(topLink.clicks)} clicks · avg ${average.toFixed(1)} per link` : "No clicks yet"}
        />
      </div>

      <LinksList
        links={links.map((link) => ({ ...link, shortUrl: `${env.NEXT_PUBLIC_APP_URL}/${link.slug}` }))}
      />
    </div>
  );
}
