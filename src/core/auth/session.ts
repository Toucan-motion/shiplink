import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "./auth";

// cache() lets the layout and the page share one session lookup per request.
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

// For pages and actions that need a logged-in user. The (app) layout already
// redirects, but layouts don't re-render on every navigation, so each page and
// server action checks again instead of assuming it is protected.
export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session.user;
}
