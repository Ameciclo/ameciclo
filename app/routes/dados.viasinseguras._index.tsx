import React from "react";
import { useLoaderData } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { CardsSession } from "~/components/Commom/CardsSession";
import ViasInsegurasClientSide from "~/components/ViasInseguras/ViasInsegurasClientSide";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useApiStatusHandler } from "~/hooks/useApiStatusHandler";
import { loader } from "~/loader/dados.vias-inseguras";

export { loader };

export default function ViasInsegurasPage() {
  const {
    cover,
    title1,
    description1,
    title2,
    description2,
    documents,
    statisticsBoxes,
    summaryData,
    topViasData,
    mapData,
    historyData,
    apiDown,
    apiErrors,
  } = useLoaderData<typeof loader>();
  
  useApiStatusHandler(apiDown, apiErrors, '/dados/observatorio/vias-inseguras');

  return (
    <>
      <Banner
        image="/pages_covers/vias-inseguras.png"
        alt="Capa da página do Observatório de Vias Inseguras"
      />
      <Breadcrumb
        label="Observatório de Vias Inseguras"
        slug="/dados/observatorio/vias-inseguras"
        routes={["/", "/dados"]}
      />
      <ApiStatusHandler apiDown={apiDown} />
      <StatisticsBox
        title="Observatório de Vias Inseguras"
        subtitle="Estatísticas gerais dos sinistros por via no Recife"
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
      <ViasInsegurasClientSide 
        summaryData={summaryData}
        topViasData={topViasData}
        mapData={mapData}
        historyData={historyData}
      />
      {/* <CardsSession title={documents.title} cards={documents.cards} /> */}
    </>
  );
}