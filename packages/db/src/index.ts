import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Client } from "pg";

import { relations } from "./relations";

export * from "./document";
export * from "./document/store";
export * from "./perfil";
export * from "./public";
export * from "./shared";
export * from "./schema";
export { seedDictionary } from "./seed";
export { relations };

export type Db = NodePgDatabase<typeof relations>;

// Always closes the client: Workers cap concurrent connections at 6 per
// invocation.
export async function withDb<T>(
  connectionString: string,
  fn: (db: Db) => Promise<T> | T,
): Promise<T> {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    return await fn(drizzle({ client, relations }));
  } finally {
    await client.end();
  }
}
