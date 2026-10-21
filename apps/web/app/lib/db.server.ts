import { env } from "cloudflare:workers";
import { withDb as withConnection, type Db } from "@ameciclo/db";

export type { Db };

// Goes through the Hyperdrive binding, not DATABASE_URL (that one is only for
// drizzle-kit).
export function withDb<T>(fn: (db: Db) => Promise<T> | T): Promise<T> {
  return withConnection(env.HYPERDRIVE.connectionString, fn);
}
