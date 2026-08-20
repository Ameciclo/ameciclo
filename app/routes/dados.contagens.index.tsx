import { createFileRoute } from "@tanstack/react-router";
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

export const Route = createFileRoute("/dados/contagens/")({
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
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<pointData | null>(null);

  const statistics = useCountsStatistics(summaryData.summaryData);
  const { pointsData, controlPanel } = useCountsMapData(amecicloData, pcrCounts);

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
      <CountsTable data={summaryData.countsData} showFilters={showFilters} setShowFilters={setShowFilters} />
      <CardsSession
        title={"Documentos para realizar contagens de ciclistas."}
        cards={docs}
      />
    </>
  );
}
