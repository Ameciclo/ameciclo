import { env } from "cloudflare:workers";
import { withDb as withConnection, type Db } from "@ameciclo/db";

export type { Db };

export function withDb<T>(fn: (db: Db) => Promise<T> | T): Promise<T> {
  return withConnection(env.HYPERDRIVE.connectionString, fn);
}
