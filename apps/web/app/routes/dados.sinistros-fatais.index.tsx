import { createFileRoute } from "@tanstack/react-router";
import { isServer, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import SinistrosObservatorio from "~/components/SinistrosFatais/SinistrosObservatorio";
import {
  resolveSelection,
  sinistrosOverviewQueryOptions,
  sinistrosStatsQueryOptions,
} from "~/queries/dados.sinistros-fatais";
import { seo } from "~/utils/seo";

// ?olhar=residencia&cidade=261160&de=2018&ate=2023&local=via. O que faltar ou não existir volta ao padrão.
const SearchSchema = z.object({
  olhar: z.enum(["ocorrencia", "residencia"]).optional().catch(undefined),
  cidade: z.number().int().optional().catch(undefined),
  de: z.number().int().optional().catch(undefined),
  ate: z.number().int().optional().catch(undefined),
  local: z.enum(["via", "hospital", "outros"]).optional().catch(undefined),
});

export const Route = createFileRoute("/dados/sinistros-fatais/")({
  validateSearch: SearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps }) => {
    const { overview } = await queryClient.ensureQueryData(sinistrosOverviewQueryOptions());
    if (!overview) return;
    const s = resolveSelection(overview, deps);
    // No servidor espera, para a primeira renderização já vir completa; no navegador não espera.
    const stats = queryClient.ensureQueryData(sinistrosStatsQueryOptions({ basis: s.basis, city: s.city, from: s.from, to: s.to, place: s.place }));
    if (isServer) await stats;
    else void stats.catch(() => undefined);
  },
  head: () =>
    seo({
      title: "Sinistros Fatais - Observatório de Segurança Viária - Ameciclo",
      description:
        "Mortes no trânsito da Região Metropolitana do Recife, a partir do Sistema de Informações sobre Mortalidade (DATASUS): quem morre, onde e em que tipo de colisão.",
      pathname: "/dados/sinistros-fatais",
    }),
  component: SinistrosFataisPage,
  pendingComponent: () => <RouteLoading label="Carregando sinistros fatais..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function SinistrosFataisPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data } = useSuspenseQuery(sinistrosOverviewQueryOptions());
  const { pageData, overview } = data;
  const selection = overview ? resolveSelection(overview, search) : null;
  const { data: stats, isPlaceholderData } = useQuery({
    ...sinistrosStatsQueryOptions({
      basis: selection?.basis ?? "ocorrencia",
      city: selection?.city,
      from: selection?.from ?? 0,
      to: selection?.to ?? 0,
      place: selection?.place,
    }),
    enabled: selection !== null,
  });

  return (
    <>
      <Banner image={pageData.coverImage} alt="Capa da página do Observatório de Sinistros Fatais" />
      <Breadcrumb label="Sinistros Fatais" slug="/dados/sinistros-fatais" routes={["/", "/dados"]} />
      <div className={isPlaceholderData ? "opacity-60 transition-opacity" : "transition-opacity"} aria-busy={isPlaceholderData}>
        <SinistrosObservatorio
          title={pageData.title}
          overview={overview}
          stats={stats ?? null}
          selection={selection}
          supportFiles={pageData.supportFiles}
          onSelect={(next) => navigate({ search: (prev) => ({ ...prev, ...next }), resetScroll: false })}
        />
      </div>
    </>
  );
}
