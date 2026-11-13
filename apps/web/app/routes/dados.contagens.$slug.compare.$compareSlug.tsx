import { createFileRoute, redirect } from "@tanstack/react-router";
import { compareHref } from "~/components/Contagens/comparison/selection";

// Old address of a two-count comparison: it lives at /dados/contagens/comparar now.
export const Route = createFileRoute("/dados/contagens/$slug/compare/$compareSlug")({
  loader: ({ params }) => {
    throw redirect({ href: compareHref([params.slug, params.compareSlug]), statusCode: 301 });
  },
});
