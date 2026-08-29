/**
 * Server-only Postgres access, reached only from server contexts
 * (createServerFn handlers, loaders, server routes) — same contract as
 * app/utils/env.server.ts.
 *
 * Connection goes through the Hyperdrive binding, not a plain DATABASE_URL.
 * Hyperdrive keeps a warm pool next to the database, so a Worker invocation
 * skips the TCP + TLS + auth handshake (~7 round-trips to Azure) and gets
 * caching of non-mutating queries for free.
 *
 * `DATABASE_URL` is a different thing and is NOT used here: it is the direct
 * Azure connection used by drizzle-kit for migrations from your machine or
 * CI. Hyperdrive is a Workers runtime binding and drizzle-kit cannot dial it.
 *
 * Local dev still goes through the same binding — point it at a local or
 * remote Postgres by setting this in .env:
 *   WRANGLER_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE=postgres://...
 */

import { env } from "cloudflare:workers";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Client } from "pg";

import * as schema from "~/db/schema";

export type Db = NodePgDatabase<typeof schema>;

/**
 * Runs `fn` with a connected client and always closes it.
 *
 * Workers allow at most 6 concurrent connections per invocation, and a leaked
 * connection is charged against that budget until it idles out — so the
 * `finally` matters. Server functions do not expose the Worker's
 * `ExecutionContext`, so `ctx.waitUntil(client.end())` is not available to us
 * and the close is awaited inline.
 *
 * Prefer one `withDb` call per handler doing several queries over several
 * calls doing one query each; each call is a fresh connection checkout.
 *
 *   const rows = await withDb((db) => db.select().from(example));
 */
export async function withDb<T>(fn: (db: Db) => Promise<T> | T): Promise<T> {
  const client = new Client({ connectionString: env.HYPERDRIVE.connectionString });
  await client.connect();

  try {
    return await fn(drizzle(client, { schema }));
  } finally {
    await client.end();
  }
}
