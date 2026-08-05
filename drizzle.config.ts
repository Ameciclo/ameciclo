import { defineConfig } from "drizzle-kit";

/**
 * drizzle-kit runs in Node on your machine (or in CI), never inside the
 * Worker — so it connects straight to Azure with DATABASE_URL and does not
 * and cannot go through the Hyperdrive binding.
 *
 * Set DATABASE_URL in .env (gitignored). Azure enforces TLS, so it needs
 * `?sslmode=require`.
 *
 *   pnpm db:generate   # schema change -> versioned SQL in ./drizzle
 *   pnpm db:migrate    # apply pending migrations
 *   pnpm db:studio     # browse the database
 */
export default defineConfig({
  schema: "./app/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
