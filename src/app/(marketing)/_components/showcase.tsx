import { Check, ChartColumn, Copy, Download, QrCode, Trash2 } from "lucide-react";
import QRCode from "qrcode";

// Two product close-ups for the landing page, drawn with divs and sample
// data, like ProductPreview. Not connected to any real account.

const SAMPLE_LINKS = [
  { slug: "launch", host: "example.com/blog/we-launched", clicks: "2,413" },
  { slug: "spring-sale", host: "example.com/sale", clicks: "1,087" },
  { slug: "podcast-42", host: "example.com/podcast/42", clicks: "364" },
];

export async function Showcase() {
  // A real, scannable QR code (for a sample URL), made with the same library
  // the app uses for links.
  const qrSvg = await QRCode.toString("https://shiplink.app/launch", {
    type: "svg",
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
  });

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-5 pb-24">
      <ShowcaseRow
        eyebrow="Link management"
        title="Every link in one place"
        body="Search by slug or destination, copy with one click, check the numbers, delete what you no longer need. Deleted slugs are never handed out again, so an old link can't start pointing somewhere new."
        points={["Search as you type", "Copy with feedback", "Safe deletes with confirmation"]}
      >
        <div className="relative rounded-2xl border border-white/10 bg-card p-2 shadow-[0_30px_90px_-40px_rgb(139_92_246/0.5)]">
          <ul className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.06] bg-background">
            {SAMPLE_LINKS.map((link) => (
              <li key={link.slug} className="flex items-center gap-3 px-4 py-3.5">
                <span className="grid size-8 place-items-center rounded-lg border border-white/[0.08] text-xs font-semibold uppercase text-muted-foreground">
                  {link.host.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">/{link.slug}</p>
                  <p className="truncate text-xs text-muted-foreground">{link.host}</p>
                </div>
                <span className="hidden items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs text-violet-300 sm:flex">
                  <ChartColumn className="size-3" /> {link.clicks}
                </span>
                <span className="flex gap-2 text-muted-foreground">
                  <Copy className="size-4" />
                  <QrCode className="size-4" />
                  <Trash2 className="size-4" />
                </span>
              </li>
            ))}
          </ul>
          {/* A sample toast, as it pops up after copying. */}
          <div className="absolute -right-2 -bottom-5 flex items-center gap-2 rounded-xl border border-white/10 bg-popover px-4 py-3 text-sm shadow-2xl sm:-right-6">
            <Check className="size-4 text-success" /> Link copied
          </div>
        </div>
      </ShowcaseRow>

      <ShowcaseRow
        eyebrow="QR codes"
        title="From screen to print in one click"
        body="Every short link has a QR code ready to download: crisp SVG for posters and packaging, PNG for slides and social posts. Scans count as clicks, like any other visit."
        points={["SVG and PNG downloads", "High-contrast, made to scan", "Counted in your stats"]}
        reverse
      >
        <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl border border-white/10 bg-card p-8 shadow-[0_30px_90px_-40px_rgb(139_92_246/0.5)]">
          <div
            className="size-48 rounded-2xl bg-white p-3 [&_svg]:size-full"
            role="img"
            aria-label="Sample QR code"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <p className="text-sm text-muted-foreground">shiplink.app/launch</p>
          <div className="grid w-full grid-cols-2 gap-2 text-sm">
            <span className="flex items-center justify-center gap-2 rounded-lg border border-white/10 py-2">
              <Download className="size-4" /> SVG
            </span>
            <span className="flex items-center justify-center gap-2 rounded-lg bg-primary py-2 text-white">
              <Download className="size-4" /> PNG
            </span>
          </div>
        </div>
      </ShowcaseRow>
    </section>
  );
}

function ShowcaseRow({
  eyebrow,
  title,
  body,
  points,
  reverse = false,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  reverse?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <div className={`flex flex-col gap-4 ${reverse ? "lg:order-2" : ""}`}>
        <p className="text-sm font-medium text-primary">{eyebrow}</p>
        <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
        <p className="leading-relaxed text-muted-foreground">{body}</p>
        <ul className="mt-2 flex flex-col gap-2.5 text-sm">
          {points.map((point) => (
            <li key={point} className="flex items-center gap-2.5">
              <span className="grid size-5 place-items-center rounded-full bg-primary/15 text-primary">
                <Check className="size-3" />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>
      <div className={reverse ? "lg:order-1" : ""}>{children}</div>
    </div>
  );
}
