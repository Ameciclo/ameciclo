import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/contagens/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = Number(params.id);
        if (!Number.isInteger(id)) return new Response("Not Found", { status: 404 });

        const { withDb } = await import("~/lib/db.server");
        const { loadPublicLocations } = await import("@ameciclo/db");
        const [location] = await withDb((db) => loadPublicLocations(db, { localId: id }));
        if (!location) return new Response("Not Found", { status: 404 });

        return Response.json(location, {
          headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" },
        });
      },
    },
  },
});
