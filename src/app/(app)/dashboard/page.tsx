import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/core/auth/session";
import { UpgradeButton } from "@/core/billing/components/billing-buttons";
import { canUse, getUsage, PLANS } from "@/core/billing/plans";
import { CreateLinkForm } from "@/product/links/components/create-link-form";
import { LinksTable } from "@/product/links/components/links-table";
import { UsageBar } from "@/product/links/components/usage-bar";
import { listLinks } from "@/product/links/queries";

export default async function DashboardPage() {
  const user = await requireUser();

  const [links, usage, canUseCustomSlug] = await Promise.all([
    listLinks(user.id),
    getUsage(user, "links"),
    canUse(user, "customSlug"),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Your links</h1>
        <UsageBar used={usage.used} max={usage.max} planName={usage.planName} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shorten a link</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* At the limit the form could only ever answer "no", so we say it up
              front and disable it. This page re-renders after every delete,
              so the form comes back on its own once there's room. */}
          {usage.limitMessage && (
            <div className="flex flex-col items-start gap-3 rounded-md border border-dashed p-4 text-sm">
              <p>{usage.limitMessage}</p>
              <UpgradeButton label={`Upgrade to ${PLANS.pro.name} — $${PLANS.pro.priceMonthly}/month`} />
            </div>
          )}
          <CreateLinkForm canUseCustomSlug={canUseCustomSlug} disabled={usage.atLimit} />
        </CardContent>
      </Card>

      <LinksTable links={links} />
    </div>
  );
}
