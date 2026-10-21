import { createFileRoute } from "@tanstack/react-router";
import { env } from "~/utils/env.server";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const siteUrl = env.SITE_URL.replace(/\/$/, "");

        const body = [
          "User-agent: *",
          "Allow: /",
          "Disallow: /documentacao",
          "",
          `Sitemap: ${siteUrl}/sitemap.xml`,
          "",
        ].join("\n");

        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
          },
        });
      },
    },
  },
});
