import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AdminTopbar } from "~/components/Admin/AdminTopbar";
import { NovaContagemForm } from "~/components/Admin/NovaContagemForm";
import type { LocationOption } from "~/components/Admin/LocationCombobox";
import { contagensQueryOptions } from "~/queries/dados.contagens";
import {
  RouteLoading,
  RouteErrorBoundary,
} from "~/components/Commom/RouteBoundaries";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/admin/contagens/nova")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(contagensQueryOptions()),
  head: () =>
    seo({
      title: "Admin · Nova contagem - Ameciclo",
      description: "Cadastrar uma nova contagem de ciclistas.",
      pathname: "/admin/contagens/nova",
      noindex: true,
    }),
  component: NovaContagem,
  pendingComponent: () => <RouteLoading label="Carregando formulário..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function NovaContagem() {
  const { data: { amecicloData } } = useSuspenseQuery(contagensQueryOptions());

  // Atlas response shape isn't strictly typed at the query layer yet, so we
  // narrow defensively here. See queries/dados.contagens.ts for context.
  const locations: LocationOption[] = Array.isArray(amecicloData)
    ? (amecicloData as Array<{ id: number | string; name: string; city?: string }>)
        .map((loc) => ({ id: loc.id, name: loc.name, city: loc.city }))
        .filter((l) => l.id != null && l.name)
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return (
    <>
      <AdminTopbar
        title="Nova contagem"
        description="Cadastre uma contagem de ciclistas em um ponto existente."
      />
      <div className="flex-1 px-6 py-6">
        <NovaContagemForm locations={locations} />
      </div>
    </>
  );
}
