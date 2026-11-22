// Applies the SQL migrations in src/core/db/migrations, without drizzle-kit.
//
// Locally you run `pnpm db:migrate` (drizzle-kit). Hosts run this file
// instead: Vercel through the `vercel-build` script in package.json, Railway
// as `migrate.cjs`, a one-file bundle the Dockerfile makes (the standalone
// image has neither pnpm nor drizzle-kit). Both record what they applied in
// the same table (drizzle.__drizzle_migrations), so you can mix them freely.
//
// Usage: tsx scripts/migrate.ts  or  node migrate.cjs [migrations folder]

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    // DECISION: not an error. The first deploy usually happens before the
    // variables are set; failing here would hide the app's setup screen,
    // which tells you exactly what to add. The next deploy migrates.
    console.warn("DATABASE_URL is not set, skipping migrations.");
    return;
  }

  const migrationsFolder = process.argv[2] ?? "src/core/db/migrations";

  // One connection is all a migration needs. `onnotice` hides Postgres's
  // "already exists, skipping" notes, which are expected on every rerun.
  const client = postgres(url, { max: 1, onnotice: () => {} });
  try {
    await migrate(drizzle(client), { migrationsFolder });
    console.log("Migrations applied.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Migration failed:", error);
  // A non-zero exit makes Railway stop the deploy, so new code never runs
  // against a database it doesn't match.
  process.exit(1);
});
