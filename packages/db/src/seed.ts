import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { ALIASES, CHARACTERISTICS } from "./import/characteristics";
import type { relations } from "./relations";
import { characteristic, characteristicAlias } from "./schema";

// Idempotent: only inserts what is missing, so it never overwrites changes made
// to the dictionary in the admin.
export async function seedDictionary(db: NodePgDatabase<typeof relations>) {
  const rollups = CHARACTERISTICS.filter((c) => !c.parentKey);
  const leaves = CHARACTERISTICS.filter((c) => c.parentKey);
  await db.insert(characteristic).values(rollups).onConflictDoNothing();
  await db.insert(characteristic).values(leaves).onConflictDoNothing();
  await db
    .insert(characteristicAlias)
    .values(Object.entries(ALIASES).map(([alias, characteristicKey]) => ({ alias, characteristicKey })))
    .onConflictDoNothing();
}
