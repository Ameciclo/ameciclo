/**
 * Drizzle table definitions. Everything exported here is picked up by
 * drizzle-kit (see drizzle.config.ts) and by the `db` instance in
 * app/lib/db.server.ts, which is created with `{ schema }` so relational
 * queries (`db.query.*`) work.
 *
 * Derive Zod schemas from these tables with drizzle-zod rather than
 * hand-writing them, so validation cannot drift from the column types:
 *
 *   import { createInsertSchema } from "drizzle-zod";
 *   export const insertExampleSchema = createInsertSchema(example);
 */

// Primeira tabela entra aqui. Depois: `pnpm db:generate && pnpm db:migrate`.
export {};
