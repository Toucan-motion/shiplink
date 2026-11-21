// All database tables, in one place, so drizzle-kit can diff them and write
// SQL migrations into ./migrations.

// user, session, account, verification: owned by Better Auth.
export * from "./auth-schema";
