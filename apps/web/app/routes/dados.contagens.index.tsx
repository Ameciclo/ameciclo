import { countRows, filterLocations, yearsOf } from "@ameciclo/db/derive";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { pointData } from "typings";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { CountsIntro, CountsProfile, CountsStatsBand } from "~/components/Contagens/CountsOverview";
import { CountsFilters, CsvLink } from "~/components/Contagens/CountsFilters";
import { ComparisonBarSlot } from "~/components/Contagens/ComparisonBarSlot";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { PointDetailsModal } from "~/components/Contagens/PointDetailsModal";
import { CountsDataTable } from "~/components/Contagens/CountsDataTable";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { useCountsStatistics } from "~/hooks/useCountsStatistics";
import { useCountsMapData } from "~/hooks/useCountsMapData";
import { useSuspenseQuery } from "@tanstack/react-query";
import { contagensQueryOptions } from "~/queries/dados.contagens";
import { useState } from "react";
import { seo } from "~/utils/seo";

const SearchSchema = z.object({
  ano: z.number().int().optional().catch(undefined),
  completas: z.boolean().optional().catch(undefined),
});

export const Route = createFileRoute("/dados/contagens/")({
  validateSearch: SearchSchema,
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(contagensQueryOptions()),
  head: () =>
    seo({
      title: "Contagens de Ciclistas - Ameciclo",
      description:
        "Contagens de ciclistas realizadas pela Ameciclo na Região Metropolitana do Recife — estatísticas, mapas e documentos.",
      pathname: "/dados/contagens",
    }),
  component: Contagens,
  pendingComponent: () => <RouteLoading label="Carregando contagens..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function Contagens() {
  const { data: { page, summaryData, amecicloData, atlasApiDown } } =
    useSuspenseQuery(contagensQueryOptions());
  const [selectedPoint, setSelectedPoint] = useState<pointData | null>(null);
  const { ano, completas } = Route.useSearch();
  const navigate = Route.useNavigate();

  const all = amecicloData ?? [];
  const filtered = filterLocations(all, { year: ano, completeOnly: completas });
  const rows = countRows(all, filtered);

  const statistics = useCountsStatistics(summaryData.summaryData);
  const { pointsData, controlPanel } = useCountsMapData(filtered);

  return (
    <div className="theme-ameciclo text-foreground">
      <Banner image={page.cover?.url ?? undefined} alt="Capa da página de contagens" />
      <Breadcrumb label="Contagens" slug="/contagens" routes={["/", "/dados"]} />
      <ApiStatusHandler apiDown={atlasApiDown} />
      <CountsStatsBand stats={statistics} />
      <section className="bg-muted/60 py-10 md:py-14" aria-labelledby="lista-contagens">
        <div className="container mx-auto px-4">
          <h2 id="lista-contagens" className="text-2xl font-bold md:text-3xl">
            Contagens realizadas
          </h2>
          <p className="mt-1 mb-6 text-muted-foreground">
            Cada local mostra a contagem mais recente; abra “anteriores” para ver o histórico.
          </p>
          <CountsDataTable
            data={rows}
            filters={
              <CountsFilters
                years={yearsOf(all)}
                year={ano}
                completeOnly={completas ?? false}
                onYearChange={(year) => navigate({ search: (prev) => ({ ...prev, ano: year }), resetScroll: false })}
                onCompleteOnlyChange={(only) =>
                  navigate({ search: (prev) => ({ ...prev, completas: only || undefined }), resetScroll: false })
                }
              />
            }
            actions={<CsvLink />}
          />
        </div>
      </section>
      {/* Slot for the "compare counts" sticky bar (see ComparisonBarSlot). */}
      <ComparisonBarSlot />

      <section className="py-10 md:py-14" aria-labelledby="mapa-contagens">
        <div className="container mx-auto mb-6 px-4">
          <h2 id="mapa-contagens" className="text-2xl font-bold md:text-3xl">
            Onde contamos
          </h2>
          <p className="mt-1 text-muted-foreground">Os pontos seguem o ano e o filtro de contagens completas escolhidos acima.</p>
        </div>
        <AmecicloMap
          pointsData={pointsData}
          controlPanel={controlPanel}
          onPointClick={(point) => {
            setSelectedPoint(point);
          }}
        />
        <PointDetailsModal point={selectedPoint} onClose={() => setSelectedPoint(null)} />
      </section>

      <CountsProfile cards={summaryData.cards} />
      <CountsIntro
        boxes={[
          { title: "O que é?", description: page.description ?? null },
          { title: "E o que mais?", description: page.objective ?? null },
        ]}
      />

    </div>
  );
}
