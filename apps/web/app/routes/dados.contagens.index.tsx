import { countRows, filterLocations, yearsOf } from "@ameciclo/db/derive";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { pointData } from "typings";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { GeneralCountStatistics } from "~/components/Contagens/GeneralCountStatistics";
import { InfoCards } from "~/components/Contagens/InfoCards";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { CardsSession } from "~/components/Commom/CardsSession";
import { PointDetailsModal } from "~/components/Contagens/PointDetailsModal";
import { CountsTable } from "~/components/Contagens/CountsTable";
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
  const { data: { page, summaryData, pcrCounts, amecicloData, atlasApiDown } } =
    useSuspenseQuery(contagensQueryOptions());
  const [selectedPoint, setSelectedPoint] = useState<pointData | null>(null);
  const { ano, completas } = Route.useSearch();
  const navigate = Route.useNavigate();

  const all = amecicloData ?? [];
  const filtered = filterLocations(all, { year: ano, completeOnly: completas });
  const rows = countRows(all, filtered);

  const statistics = useCountsStatistics(summaryData.summaryData);
  const { pointsData, controlPanel } = useCountsMapData(filtered, pcrCounts);

  const docs = (page.archives ?? []).map((a) => ({
    title: a.filename ?? "",
    description: a.description ?? "",
    src: a.image?.url ?? "",
    url: a.file?.url ?? "#",
  }));

  return (
    <>
      <Banner image={page.cover?.url ?? undefined} alt="Capa da página de contagens" />
      <Breadcrumb label="Contagens" slug="/contagens" routes={["/", "/dados"]} />
      <ApiStatusHandler apiDown={atlasApiDown} />
      <GeneralCountStatistics title={"Estatísticas Gerais"} boxes={statistics} />
      <ExplanationBoxes
        boxes={[
          { title: "O que é?", description: page.description ?? null },
          { title: "E o que mais?", description: page.objective ?? null },
        ]}
      />
      <InfoCards cards={summaryData.cards} />
      <AmecicloMap
        pointsData={pointsData}
        controlPanel={controlPanel}
        onPointClick={(point) => {
          setSelectedPoint(point);
        }}
      />

      <PointDetailsModal point={selectedPoint} onClose={() => setSelectedPoint(null)} />
      <section className="container mx-auto my-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-700">
        <label className="flex items-center gap-2">
          Ano
          <select
            className="rounded-sm border border-gray-300 px-2 py-1"
            value={ano ?? ""}
            onChange={(e) =>
              navigate({ search: (prev) => ({ ...prev, ano: e.target.value ? Number(e.target.value) : undefined }) })
            }
          >
            <option value="">Todos</option>
            {yearsOf(all).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={completas ?? false}
            onChange={(e) => navigate({ search: (prev) => ({ ...prev, completas: e.target.checked || undefined }) })}
          />
          Ocultar contagens estimadas e parciais
        </label>
        <span className="text-gray-500">{rows.length} contagens</span>
        <a className="text-ameciclo hover:underline sm:ml-auto" href="/api/contagens/csv" download>
          Baixar todas as contagens (CSV)
        </a>
      </section>
      <CountsTable data={rows} />
      <CardsSession
        title={"Documentos para realizar contagens de ciclistas."}
        cards={docs}
      />
    </>
  );
}
