import { createFileRoute, redirect } from "@tanstack/react-router";

// Old links to a city's page.
export const Route = createFileRoute("/city-details/$cityId")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/detalhes-cidades/$cityId", params: { cityId: params.cityId }, replace: true });
  },
});
