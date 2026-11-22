import { getSession } from "@/core/auth/session";

import { SiteFooter } from "./_components/site-footer";
import { SiteHeader } from "./_components/site-header";

// Public pages: landing and pricing. The header changes once you're logged in.
export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader loggedIn={session !== null} />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
