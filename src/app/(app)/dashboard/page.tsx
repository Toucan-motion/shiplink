import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/core/auth/session";
import { canUse, getUsage } from "@/core/billing/plans";
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
        <CardContent>
          <CreateLinkForm canUseCustomSlug={canUseCustomSlug} />
        </CardContent>
      </Card>

      <LinksTable links={links} />
    </div>
  );
}
