import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Name</dt>
            <dd>{user.name}</dd>
            <dt className="text-muted-foreground">Email</dt>
            <dd>{user.email}</dd>
          </dl>
        </CardContent>
      </Card>

      <PlanCard user={user} justPaid={checkout === "success"} />

      <Card>
        <CardHeader>
          <CardTitle>Delete account</CardTitle>
          <CardDescription>
            Permanently removes your account, your links and their stats, and cancels a paid
            plan right away. We&apos;ll email you a link to confirm.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountForm />
        </CardContent>
      </Card>
    </div>
  );
}
