import { env } from "cloudflare:workers";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Client } from "pg";

import { relations } from "~/db/relations";

export type Db = NodePgDatabase<typeof relations>;

// Connects through the Hyperdrive binding (not DATABASE_URL, which is only for
// drizzle-kit). Always closes the client: Workers cap concurrent connections
// at 6 per invocation.
export async function withDb<T>(fn: (db: Db) => Promise<T> | T): Promise<T> {
  const client = new Client({ connectionString: env.HYPERDRIVE.connectionString });
  await client.connect();

  try {
    return await fn(drizzle({ client, relations }));
  } finally {
    await client.end();
  }
}
