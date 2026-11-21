import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { env } from "@/core/env";

import type { listLinks } from "../queries";
import { CopyButton } from "./copy-button";
import { DeleteLinkButton } from "./delete-link-button";

type Links = Awaited<ReturnType<typeof listLinks>>;

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export function LinksTable({ links }: { links: Links }) {
  if (links.length === 0) {
    return (
      <p className="rounded-md border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
        No links yet. Paste a URL above to create your first one.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Short link</TableHead>
          <TableHead>Destination</TableHead>
          <TableHead className="text-right">Clicks</TableHead>
          <TableHead>Created</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {links.map((link) => {
          const shortUrl = `${env.NEXT_PUBLIC_APP_URL}/${link.slug}`;
          return (
            <TableRow key={link.id}>
              <TableCell className="font-medium">/{link.slug}</TableCell>
              <TableCell className="max-w-xs truncate text-muted-foreground">
                {link.destination}
              </TableCell>
              <TableCell className="text-right tabular-nums">{link.clicks}</TableCell>
              <TableCell className="text-muted-foreground">
                {dateFormat.format(link.createdAt)}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <CopyButton text={shortUrl} />
                  <DeleteLinkButton id={link.id} />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
