import { createFileRoute } from "@tanstack/react-router";
import { isServer, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import ViasObservatorio from "~/components/ViasInseguras/ViasObservatorio";
import { resolveViasPeriod, viasQueryOptions } from "~/queries/dados.vias-inseguras";
import { seo } from "~/utils/seo";

// ?de=2020&ate=2024&via=avenida-caxanga. O que faltar ou não existir volta ao padrão: todos os anos, nenhuma via.
const SearchSchema = z.object({
  de: z.number().int().optional().catch(undefined),
  ate: z.number().int().optional().catch(undefined),
  via: z.string().max(200).optional().catch(undefined),
});

export const Route = createFileRoute("/dados/viasinseguras/")({
  validateSearch: SearchSchema,
  loaderDeps: ({ search }) => ({ de: search.de, ate: search.ate }),
  loader: async ({ context: { queryClient }, deps }) => {
    // No servidor espera, para a primeira renderização já vir completa; no navegador não espera.
    const view = queryClient.ensureQueryData(viasQueryOptions({ from: deps.de, to: deps.ate }));
    if (isServer) await view;
    else void view.catch(() => undefined);
  },
  head: () =>
    seo({
      title: "Observatório de Vias Inseguras - Ameciclo",
      description:
        "As vias do Recife com mais chamados do SAMU por sinistro de trânsito, com a extensão de cada via, o mapa e a evolução ano a ano.",
      pathname: "/dados/viasinseguras",
    }),
  component: ViasInsegurasPage,
  pendingComponent: () => <RouteLoading label="Carregando vias inseguras..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function ViasInsegurasPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: first } = useSuspenseQuery(viasQueryOptions({ from: search.de, to: search.ate }));
  // Ao mudar o período, mostra o anterior (esmaecido) até o novo chegar.
  const { data, isPlaceholderData } = useQuery(viasQueryOptions({ from: search.de, to: search.ate }));
  const view = (data ?? first).view;
  const period = view ? resolveViasPeriod(view.years, search) : { from: 0, to: 0 };

  return (
    <>
      <Banner image="/pages_covers/vias-inseguras.png" alt="Capa da página do Observatório de Vias Inseguras" />
      <Breadcrumb label="Vias Inseguras" slug="/dados/viasinseguras" routes={["/", "/dados"]} />
      <div className={isPlaceholderData ? "opacity-60 transition-opacity" : "transition-opacity"} aria-busy={isPlaceholderData}>
        <ViasObservatorio
          view={view}
          period={period}
          selectedSlug={search.via}
          onSelect={(next) => navigate({ search: (prev) => ({ ...prev, ...next }), resetScroll: false })}
        />
      </div>
    </>
  );
}
