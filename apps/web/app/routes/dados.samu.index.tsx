import { createFileRoute } from "@tanstack/react-router";
import { isServer, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import SamuExplorer from "~/components/Samu/SamuExplorer";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { resolveSamuSelection, samuCityQueryOptions, samuQueryOptions } from "~/queries/dados.samu";
import { seo } from "~/utils/seo";

// ?cidade=2611606&de=2024&ate=2025: city (IBGE code) and range of years. Anything unknown falls back to Recife, all years.
const SearchSchema = z.object({
  cidade: z.number().int().optional().catch(undefined),
  de: z.number().int().optional().catch(undefined),
  ate: z.number().int().optional().catch(undefined),
});

export const Route = createFileRoute("/dados/samu/")({
  validateSearch: SearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps }) => {
    const overview = await queryClient.ensureQueryData(samuQueryOptions());
    const { city, from, to } = resolveSamuSelection(overview, deps);
    if (!city) return;
    // No servidor espera, para a primeira renderização já vir completa. No navegador não espera:
    // a página fica montada com os dados anteriores enquanto os novos chegam (sem tela de carregamento
    // e sem voltar ao topo ao trocar de período).
    const cityView = queryClient.ensureQueryData(samuCityQueryOptions({ cityIbge: city.ibge, fromYear: from, toYear: to }));
    if (isServer) await cityView;
    else void cityView.catch(() => undefined);
  },
  head: () =>
    seo({
      title: "Observatório SAMU - Chamados de Sinistros - Ameciclo",
      description:
        "Detalhamento dos chamados de sinistros de trânsito atendidos pelo SAMU na Região Metropolitana do Recife.",
      pathname: "/dados/samu",
    }),
  component: SamuPage,
  pendingComponent: () => <RouteLoading label="Carregando dados do SAMU..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function SamuPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: overview } = useSuspenseQuery(samuQueryOptions());
  const { city, from, to } = resolveSamuSelection(overview, search);
  const { data: view, isPlaceholderData } = useQuery(
    samuCityQueryOptions({ cityIbge: city?.ibge ?? 0, fromYear: from, toYear: to }),
  );
  if (!view) return <RouteLoading label="Carregando dados do SAMU..." />;

  return (
    <>
      <Banner image="/pages_covers/chamadosdosamu.png" alt="Capa da página do Observatório de Chamadas do SAMU" />
      <Breadcrumb label="Chamados de sinistro" slug="/dados/observatorio/samu" routes={["/", "/dados"]} />
      <ApiStatusHandler apiDown={overview.dataUnavailable} />
      <div className={isPlaceholderData ? "opacity-60 transition-opacity" : "transition-opacity"} aria-busy={isPlaceholderData}>
      <SamuExplorer
        overview={overview}
        view={view}
        selection={{ city, from, to }}
        onSelect={(next) =>
          navigate({
            search: (prev) => ({ ...prev, ...next }),
            resetScroll: false,
          })
        }
      />
      </div>
    </>
  );
}
