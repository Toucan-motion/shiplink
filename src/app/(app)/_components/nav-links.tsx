"use client";

import { ChartColumn, Link2, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

// The app's main navigation. Add a line here when your product gets a page.
const NAV_ITEMS = [
  { href: "/dashboard", label: "Links", icon: Link2, matches: ["/dashboard", "/dashboard/links"] },
  { href: "/dashboard/analytics", label: "Analytics", icon: ChartColumn, matches: ["/dashboard/analytics"] },
  { href: "/settings", label: "Settings", icon: Settings, matches: ["/settings"] },
];

function isActive(pathname: string, matches: string[]) {
  return matches.some((match) =>
    match === "/dashboard" ? pathname === match : pathname.startsWith(match),
  );
}

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {NAV_ITEMS.map(({ href, label, icon: Icon, matches }) => {
        const active = isActive(pathname, matches);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground",
              active && "bg-sidebar-accent text-foreground",
            )}
          >
            {/* The thin violet bar marks the current page. */}
            {active && (
              <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary" aria-hidden />
            )}
            <Icon
              className={cn(
                "size-4 transition-colors",
                active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
              )}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
