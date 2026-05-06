import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import { env } from "cloudflare:workers";
import * as schema from "~/db/schema";

/**
 * SQLite-via-D1 client for local prototyping. The `DB` binding is declared
 * in wrangler.jsonc and resolved by @cloudflare/vite-plugin's
 * `cloudflare:workers` virtual module.
 *
 * At end of PR this file swaps to drizzle-orm/postgres-js + a Hyperdrive
 * binding; everything that imports `db` keeps working unchanged.
 */
export type DB = DrizzleD1Database<typeof schema>;

let _db: DB | null = null;

export function db(): DB {
  if (_db) return _db;
  // `env` is the worker bindings object. `DB` is our D1 binding.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const binding = (env as any).DB as D1Database | undefined;
  if (!binding) {
    throw new Error(
      "DB binding missing — did you run `pnpm db:setup` and add the d1_databases block in wrangler.jsonc?",
    );
  }
  _db = drizzle(binding, { schema });
  return _db;
}
