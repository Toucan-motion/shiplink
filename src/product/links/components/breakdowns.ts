import { Globe, Monitor, Smartphone } from "lucide-react";

import { countryName } from "../format";
import type { DeviceCounts, TopEntry } from "../stats";
import type { BreakdownItem } from "./breakdown-list";

// Shape the stats rows into BreakdownList items. Missing values (no
// referrer, no country header) become "Unknown" rather than disappearing,
// so the numbers still add up.

export function referrerItems(entries: TopEntry[]): BreakdownItem[] {
  return entries.map((entry) => ({
    key: entry.name ?? "unknown",
    label: entry.name ?? "Direct or unknown",
    value: entry.clicks,
    icon: Globe,
    muted: entry.name === null,
  }));
}

export function countryItems(entries: TopEntry[]): BreakdownItem[] {
  return entries.map((entry) => ({
    key: entry.name ?? "unknown",
    label: entry.name ? countryName(entry.name) : "Unknown",
    value: entry.clicks,
    muted: entry.name === null,
  }));
}

export function deviceItems(devices: DeviceCounts): BreakdownItem[] {
  return [
    { key: "mobile", label: "Mobile", value: devices.mobile, icon: Smartphone },
    { key: "desktop", label: "Desktop", value: devices.desktop, icon: Monitor },
  ].sort((a, b) => b.value - a.value);
}
