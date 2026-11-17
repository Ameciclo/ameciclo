import { createFileRoute } from "@tanstack/react-router";

// The ways of the cycling map, each with its status (what the PDC planned and
// what was built). Changes once a week, when the sync with OpenStreetMap runs,
// so the edge keeps it for an hour.
export const Route = createFileRoute("/api/execucao-cicloviaria/trechos")({
  server: {
    handlers: {
      GET: async () => {
        const { withDb } = await import("~/lib/db.server");
        const { getCyclingWaysGeojson } = await import("@ameciclo/db/cycling-read");
        const collection = await withDb((db) => getCyclingWaysGeojson(db));

        return new Response(JSON.stringify(collection), {
          headers: {
            "Content-Type": "application/geo+json; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=3600",
          },
        });
      },
    },
  },
});
