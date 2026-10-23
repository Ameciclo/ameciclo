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
  // PostGIS owns spatial_ref_sys; keep it out of the diff.
  extensionsFilters: ["postgis"],
  verbose: true,
});
