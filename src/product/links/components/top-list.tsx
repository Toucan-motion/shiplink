import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { TopEntry } from "../stats";

type Props = {
  title: string;
  column: string;
  entries: TopEntry[];
  // Turns a stored value into something readable, e.g. "PL" -> "Poland".
  formatName?: (name: string) => string;
};

// A small "top 5" table. Missing values (no referrer, no country header) are
// grouped as "Unknown" rather than hidden, so the numbers still add up.
export function TopList({ title, column, entries, formatName = (name) => name }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No clicks in this period.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{column}</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.name ?? "unknown"}>
                  <TableCell className={entry.name ? undefined : "text-muted-foreground"}>
                    {entry.name ? formatName(entry.name) : "Unknown"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{entry.clicks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
