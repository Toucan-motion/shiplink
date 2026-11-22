import QRCode from "qrcode";

import { getSession } from "@/core/auth/session";
import { env } from "@/core/env";
import { findOwnedLink } from "@/product/links/stats";

type Context = { params: Promise<{ id: string }> };

// QR code for one short link, as an image: SVG by default, PNG with ?format=png.
// Owner only, like the stats page. Made on request, never stored.
export async function GET(request: Request, { params }: Context) {
  const session = await getSession();
  if (!session) return new Response("Not found", { status: 404 });

  const { id } = await params;
  const link = await findOwnedLink(id, session.user.id);
  if (!link) return new Response("Not found", { status: 404 });

  const shortUrl = `${env.NEXT_PUBLIC_APP_URL}/${link.slug}`;
  // Black on white with a quiet border: what every phone camera reads best.
  const options = { margin: 2, color: { dark: "#000000", light: "#ffffff" } };
  const wantsPng = new URL(request.url).searchParams.get("format") === "png";

  if (wantsPng) {
    const png = await QRCode.toBuffer(shortUrl, { ...options, type: "png", width: 1024 });
    return new Response(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="shiplink-${link.slug}.png"`,
      },
    });
  }

  const svg = await QRCode.toString(shortUrl, { ...options, type: "svg" });
  return new Response(svg, { headers: { "Content-Type": "image/svg+xml" } });
}
