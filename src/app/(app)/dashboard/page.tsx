import { requireUser } from "@/core/auth/session";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Your links</h1>
      <p className="text-muted-foreground">
        Hi {user.name}, your short links will show up here.
      </p>
    </div>
  );
}
