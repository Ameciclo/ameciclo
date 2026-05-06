import { defineConfig } from "drizzle-kit";

/**
 * Local-dev config — generates SQLite migrations from app/db/schema.ts.
 *
 * Apply them to the local D1 file via wrangler:
 *   pnpm db:generate    # → produces drizzle/0001_xxxx.sql
 *   pnpm db:migrate     # → wrangler d1 migrations apply ameciclo-admin-dev --local
 *
 * At end of PR: switch dialect to "postgresql", point at the prod DSN, and
 * regenerate. Schema definitions stay put.
 */
export default defineConfig({
  schema: "./app/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
});
