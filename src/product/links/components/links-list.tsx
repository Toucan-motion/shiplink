"use client";

import { ArrowUpRight, ChartColumn, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Input } from "@/components/ui/input";

import { numberFormat, prettyUrl } from "../format";
import { CopyButton } from "./copy-button";
import { DeleteLinkButton } from "./delete-link-button";
import { QrButton } from "./qr-button";

export type LinkListItem = {
  id: string;
  slug: string;
  destination: string;
  createdAt: Date;
  clicks: number;
  shortUrl: string;
};

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

// All links of the user, with a search box. Searching happens in the
// browser: the whole list is already on the page, so there's no round trip.
export function LinksList({ links }: { links: LinkListItem[] }) {
  const [query, setQuery] = useState("");

  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
        <span className="grid size-11 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
          <ArrowUpRight className="size-5" aria-hidden />
        </span>
        <p className="font-medium">No links yet</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Create your first short link with the New link button. Its clicks show up here.
        </p>
      </div>
    );
  }

  const needle = query.trim().toLowerCase();
  const visible = needle
    ? links.filter(
        (link) => link.slug.includes(needle) || link.destination.toLowerCase().includes(needle),
      )
    : links;

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="px-1 text-sm text-muted-foreground">
          {visible.length === links.length
            ? `${links.length} ${links.length === 1 ? "link" : "links"}`
            : `${visible.length} of ${links.length} links`}
        </p>
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search slug or destination"
            aria-label="Search links"
            className="h-9 pl-9"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
          No links match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {visible.map((link) => (
            <LinkRow key={link.id} link={link} />
          ))}
        </ul>
      )}
    </section>
  );
}

function LinkRow({ link }: { link: LinkListItem }) {
  const pretty = prettyUrl(link.destination);
  const statsHref = `/dashboard/links/${link.id}`;

  return (
    <li className="group flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-white/[0.015] sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* First letter of the destination's domain, as a small avatar. */}
        <span
          className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-gradient-to-br from-white/[0.06] to-transparent text-sm font-semibold uppercase text-muted-foreground"
          aria-hidden
        >
          {pretty.charAt(0)}
        </span>
        <div className="min-w-0">
          <Link
            href={statsHref}
            className="block truncate text-sm font-medium underline-offset-4 hover:text-primary hover:underline"
          >
            /{link.slug}
          </Link>
          <a
            href={link.destination}
            target="_blank"
            rel="noreferrer"
            className="block truncate text-xs text-muted-foreground hover:text-foreground"
            title={link.destination}
          >
            {pretty}
          </a>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pl-12 sm:pl-0">
        <Link
          href={statsHref}
          className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-violet-300 transition-colors hover:bg-primary/20"
          aria-label={`${link.clicks} clicks, see stats`}
        >
          <ChartColumn className="size-3" aria-hidden />
          {numberFormat.format(link.clicks)}
          <span className="hidden sm:inline">{link.clicks === 1 ? "click" : "clicks"}</span>
        </Link>
        <span className="hidden w-24 text-xs text-muted-foreground md:block">
          {dateFormat.format(link.createdAt)}
        </span>
        <div className="flex items-center gap-0.5">
          <CopyButton text={link.shortUrl} />
          <QrButton linkId={link.id} slug={link.slug} shortUrl={link.shortUrl} />
          <DeleteLinkButton id={link.id} slug={link.slug} />
        </div>
      </div>
    </li>
  );
}
