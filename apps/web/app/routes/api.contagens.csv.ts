import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/contagens/csv")({
  server: {
    handlers: {
      GET: async () => {
        const { withDb } = await import("~/lib/db.server");
        const { loadPublicLocations } = await import("@ameciclo/db");
        const { contagensToCsv } = await import("@ameciclo/db/derive");
        const locations = await withDb((db) => loadPublicLocations(db));

        // The BOM makes Excel read the accents as UTF-8.
        return new Response(`﻿${contagensToCsv(locations)}`, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="contagens-ameciclo.csv"',
            "Cache-Control": "public, max-age=300, s-maxage=3600",
          },
        });
      },
    },
  },
});
