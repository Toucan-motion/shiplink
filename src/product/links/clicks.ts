import { db } from "@/core/db";
import { click } from "@/core/db/schema";

type ClickData = typeof click.$inferInsert;

// Turns the headers of a redirect request into one click row.
export function clickFromRequest(linkId: string, headers: Headers): ClickData {
  return {
    linkId,
    referrerHost: referrerHost(headers.get("referer")),
    // [ebook ch8] Country comes from a header the hosting platform adds.
    // Vercel sets x-vercel-ip-country on every request; Railway doesn't add
    // anything like it. There we store null and the stats page shows "Unknown".
    // Same code, different host, different data.
    country: headers.get("x-vercel-ip-country"),
    device: deviceFromUserAgent(headers.get("user-agent")),
  };
}

export async function recordClick(data: ClickData) {
  try {
    await db.insert(click).values(data);
  } catch (error) {
    // A lost click is not worth a crash. Log it and move on.
    console.error("Could not record click", error);
  }
}

// We only keep the host ("twitter.com"), not the full referring URL, which can
// contain private paths or tokens.
function referrerHost(referer: string | null): string | null {
  if (!referer) return null;
  try {
    return new URL(referer).hostname;
  } catch {
    return null;
  }
}

// Rough, but enough for a "mobile vs desktop" split. Tablets count as mobile.
function deviceFromUserAgent(userAgent: string | null): "mobile" | "desktop" {
  return userAgent && /Mobi|Android|iPhone|iPad/i.test(userAgent) ? "mobile" : "desktop";
}
