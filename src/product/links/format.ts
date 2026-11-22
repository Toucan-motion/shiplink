// Turning stored values into words for the UI.

const countryNames = new Intl.DisplayNames("en", { type: "region" });

// "PL" -> "Poland". Anything that isn't a region code is shown as stored.
export function countryName(code: string) {
  try {
    return countryNames.of(code) ?? code;
  } catch {
    return code;
  }
}

// "https://www.example.com/blog/post?x=1" -> "example.com/blog/post"
export function prettyUrl(url: string) {
  try {
    const { hostname, pathname } = new URL(url);
    const path = pathname === "/" ? "" : pathname;
    return hostname.replace(/^www\./, "") + path;
  } catch {
    return url;
  }
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

// "3 min ago", "yesterday". Computed on the server at render time.
export function timeAgo(date: Date, now = new Date()) {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

export const numberFormat = new Intl.NumberFormat("en");
