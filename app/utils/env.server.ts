/**
 * Server-only env access. Imports of this file should be reached only from
 * server contexts (loaders, createServerFn handlers, server routes).
 *
 * On Cloudflare Workers with `nodejs_compat`, `process.env` is populated
 * from the Worker's bindings (`vars` in wrangler.jsonc + secrets set via
 * `wrangler secret put`). In local dev (vite), values come from .env.
 *
 * Secrets (set via `wrangler secret put <NAME>`):
 *   - MAPBOX_ACCESS_TOKEN
 *   - GOOGLE_CALENDAR_API_KEY
 *
 * Public vars (can live in wrangler.jsonc `vars`):
 *   - GOOGLE_CALENDAR_EXTERNAL_ID
 *   - GOOGLE_CALENDAR_INTERNAL_ID
 *   - SITE_URL
 */

const read = (key: string, fallback = ""): string =>
  (typeof process !== "undefined" && process.env?.[key]) || fallback;

export const env = {
  get MAPBOX_ACCESS_TOKEN() {
    return read("MAPBOX_ACCESS_TOKEN");
  },
  get GOOGLE_CALENDAR_API_KEY() {
    return read("GOOGLE_CALENDAR_API_KEY");
  },
  get GOOGLE_CALENDAR_EXTERNAL_ID() {
    return read("GOOGLE_CALENDAR_EXTERNAL_ID");
  },
  get GOOGLE_CALENDAR_INTERNAL_ID() {
    return read("GOOGLE_CALENDAR_INTERNAL_ID");
  },
  get SITE_URL() {
    return read("SITE_URL", "https://ameciclo.org");
  },
};
