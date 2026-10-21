/**
 * Drizzle table definitions. Everything exported here is picked up by
 * drizzle-kit (see drizzle.config.ts) and by app/db/relations.ts, which feeds
 * the `db` instance in app/lib/db.server.ts so relational queries
 * (`db.query.*`) work. Declare the relations between tables there.
 *
 * Derive Zod schemas from these tables with drizzle-orm/zod rather than
 * hand-writing them, so validation cannot drift from the column types:
 *
 *   import { createInsertSchema } from "drizzle-orm/zod";
 *   export const insertExampleSchema = createInsertSchema(example);
 */

// Primeira tabela entra aqui. Depois: `pnpm db:generate && pnpm db:migrate`.
export {};
