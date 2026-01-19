import React from "react";
import { useLoaderData } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { CardsSession } from "~/components/Commom/CardsSession";
import SamuClientSide from "~/components/Samu/SamuClientSide";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useApiStatusHandler } from "~/hooks/useApiStatusHandler";
import { loader } from "~/loader/dados.samu";

export { loader };

export default function SamuPage() {
  const {
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
  } = useLoaderData<typeof loader>();
  
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
