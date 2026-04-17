import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { CardsSession } from "~/components/Commom/CardsSession";
import SamuClientSide from "~/components/Samu/SamuClientSide";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useApiStatusHandler } from "~/hooks/useApiStatusHandler";
import { samuQueryOptions } from "~/loader/dados.samu";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/dados/samu/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(samuQueryOptions()),
  head: () => {
    const s = seo({
      title: "Observatório SAMU - Chamados de Sinistros - Ameciclo",
      description:
        "Detalhamento dos chamados de sinistros de trânsito atendidos pelo SAMU na Região Metropolitana do Recife.",
      pathname: "/dados/samu",
    });
    return { meta: s.meta, links: s.links, scripts: s.scripts };
  },
  component: SamuPage,
});

function SamuPage() {
  const {
    data: {
      cover,
      title1,
      description1,
      title2,
      description2,
      documents,
      statisticsBoxes,
      citiesData,
      usingMockData,
      mockDataDate,
      apiDown,
      apiErrors,
    },
  } = useSuspenseQuery(samuQueryOptions());

  useApiStatusHandler(apiDown, apiErrors, '/dados/observatorio/samu');

  return (
    <>
      <Banner
        image={cover}
        alt="Capa da página do Observatório de Chamadas do SAMU"
      />
      <Breadcrumb
        label="Observatório de Chamadas do SAMU"
        slug="/dados/observatorio/samu"
        routes={["/", "/dados"]}
      />
      <ApiStatusHandler apiDown={apiDown} />
      <StatisticsBox
        title="Observatório de Chamadas do SAMU"
        subtitle="Estatísticas gerais dos sinistros de trânsito"
        boxes={statisticsBoxes}
      />
      <ExplanationBoxes
        boxes={[
          {
            title: title1,
            description: description1,
          },
          {
            title: title2,
            description: description2,
          },
        ]}
      />
      <SamuClientSide citiesData={citiesData || { cidades: [], total: 0 }} />
      <CardsSession title={documents.title} cards={documents.cards} />
    </>
  );
}
