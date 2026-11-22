import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { requireUser } from "@/core/auth/session";

import { DeleteAccountForm } from "./delete-account-form";
import { PlanCard } from "./plan-card";

type Props = {
  searchParams: Promise<{ checkout?: string }>;
};

export default async function SettingsPage({ searchParams }: Props) {
  const user = await requireUser();
  const { checkout } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Your account and your plan." />

      <Panel title="Profile">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1 rounded-xl border border-border bg-white/[0.02] p-4">
            <dt className="text-xs text-muted-foreground">Name</dt>
            <dd className="truncate font-medium">{user.name || "—"}</dd>
          </div>
          <div className="flex flex-col gap-1 rounded-xl border border-border bg-white/[0.02] p-4">
            <dt className="text-xs text-muted-foreground">Email</dt>
            <dd className="truncate font-medium">{user.email}</dd>
          </div>
        </dl>
      </Panel>

      <PlanCard user={user} justPaid={checkout === "success"} />

      <Panel
        title="Delete account"
        description="Removes your account, your links and their stats for good, and cancels a paid plan right away. We'll email you a link to confirm."
        className="border-destructive/25"
      >
        <DeleteAccountForm />
      </Panel>
    </div>
  );
}
