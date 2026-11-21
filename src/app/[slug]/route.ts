import { after, type NextRequest } from "next/server";

import { clickFromRequest, recordClick } from "@/product/links/clicks";
import { findActiveLinkBySlug } from "@/product/links/queries";

type Context = { params: Promise<{ slug: string }> };

// The public short link: GET /{slug} -> 307 to the destination.
export async function GET(request: NextRequest, { params }: Context) {
  const { slug } = await params;
  const found = await findActiveLinkBySlug(slug.toLowerCase());

  if (!found) {
    return new Response("This short link doesn't exist or was deleted.", { status: 404 });
  }

  // after() runs once the response is sent. The visitor is already on their
  // way to the destination while we write the click to the database, so
  // tracking never makes the redirect slower.
  const clickData = clickFromRequest(found.id, request.headers);
  after(() => recordClick(clickData));

  // 307 (temporary), not 301: browsers cache 301s forever, so later clicks
  // would skip us entirely and never be counted.
  return Response.redirect(found.destination, 307);
}
