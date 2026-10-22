import { seedDictionary, withDb } from "../src";

try {
  process.loadEnvFile();
} catch {}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set (packages/db/.env)");

await withDb(connectionString, async (db) => {
  await seedDictionary(db);
  console.log("dictionary seeded");
});
