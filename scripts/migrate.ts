// Applies the SQL migrations in src/core/db/migrations, without drizzle-kit.
//
// Locally and on Vercel you run `pnpm db:migrate` (drizzle-kit). The Docker
// image for Railway is a minimal standalone build with neither pnpm nor
// drizzle-kit inside, so the Dockerfile bundles this file into one plain
// `migrate.cjs` that only needs Node. Both record what they applied in the
// same table (drizzle.__drizzle_migrations), so you can mix them freely.
//
// Usage: node migrate.cjs [migrations folder]

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is missing");

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
