import { NextResponse, type NextRequest } from "next/server";

import { envProblems } from "@/core/env";

// Runs before every request. Its only job: while an environment variable is
// missing, show a setup screen instead of a crash.
//
// That's what happens right after a first deploy, before the variables are set.
// The setup screen lists what's missing, so you know what to add and redeploy.
export function proxy(request: NextRequest) {
  if (envProblems.length === 0) {
    return NextResponse.next();
  }

  // APIs get a 503, so Railway's healthcheck (/api/health) fails and
  // Stripe retries its webhooks later instead of losing them.
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return Response.json({ ok: false, error: "Server is not configured yet" }, { status: 503 });
  }

  return NextResponse.rewrite(new URL("/setup", request.url));
}

export const config = {
  // Everything except the built CSS/JS and images the setup screen itself needs.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
