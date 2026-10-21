import { defineConfig } from "drizzle-kit";

try {
  process.loadEnvFile();
} catch {}

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
});
