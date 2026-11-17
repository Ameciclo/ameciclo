export { CicloSync } from "./workflow";

// In production the only entry points are the cron schedule on the Workflow
// binding and `wrangler workflows trigger`: there is no HTTP surface. Locally
// (`wrangler dev --var ENVIRONMENT:development`) POST /run starts one.
export default {
  async fetch(request, env) {
    const environment: string = env.ENVIRONMENT;
    const url = new URL(request.url);
    if (environment === "development" && request.method === "POST" && url.pathname === "/run") {
      const instance = await env.CICLO_SYNC.create({ params: { dryRun: url.searchParams.has("dry") } });
      return Response.json({ id: instance.id });
    }
    if (environment === "development" && url.pathname.startsWith("/status/")) {
      const instance = await env.CICLO_SYNC.get(url.pathname.slice("/status/".length));
      return Response.json(await instance.status());
    }
    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
