import { CicloSync } from "./workflow";

export { CicloSync };

const INSTANCE_ID_CHARS = /[^A-Za-z0-9_-]/g;

/** Compares without leaking, through timing, how much of the secret matched. */
async function sameSecret(given: string, expected: string): Promise<boolean> {
  const digest = async (s: string) => crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  const [a, b] = (await Promise.all([digest(given), digest(expected)])).map((d) => new Uint8Array(d));
  if (!a || !b) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return difference === 0;
}

/**
 * The only HTTP surface is POST /start, for the collector on the VPS: it has
 * left a snapshot in R2 and asks for it to be applied. It can only start the
 * Workflow on data that is already in R2, never run anything else.
 * Locally (`wrangler dev --var ENVIRONMENT:development`) GET /status/<id> too.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/start") {
      const bearer = request.headers.get("Authorization")?.replace(/^Bearer /, "") ?? "";
      if (!env.SYNC_TOKEN || !(await sameSecret(bearer, env.SYNC_TOKEN))) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await request.json<{ prefix?: unknown; dryRun?: unknown }>().catch(() => null);
      const prefix = typeof body?.prefix === "string" ? body.prefix : "";
      if (!prefix.startsWith(`${env.ENVIRONMENT}/`) || prefix.includes("..")) {
        return new Response(`prefix must start with ${env.ENVIRONMENT}/`, { status: 400 });
      }
      if (!(await env.OSM_BUCKET.head(`${prefix}/manifest.json`))) {
        return new Response("no manifest at that prefix", { status: 404 });
      }

      // The same snapshot maps to the same instance: a retried call is harmless.
      const id = prefix.replace(INSTANCE_ID_CHARS, "-").slice(0, 100);
      const dryRun = body?.dryRun === true;
      try {
        const instance = await env.CICLO_SYNC.create({ id, params: { prefix, dryRun } });
        return Response.json({ id: instance.id, started: true });
      } catch (error) {
        const existing = await env.CICLO_SYNC.get(id).catch(() => null);
        if (existing) return Response.json({ id, started: false });
        throw error;
      }
    }

    const environment: string = env.ENVIRONMENT;
    if (environment === "development" && url.pathname.startsWith("/status/")) {
      const instance = await env.CICLO_SYNC.get(url.pathname.slice("/status/".length));
      return Response.json(await instance.status());
    }
    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
