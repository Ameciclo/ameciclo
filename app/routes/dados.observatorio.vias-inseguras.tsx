import React from "react";
import { useLoaderData } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { CardsSession } from "~/components/Commom/CardsSession";
import ViasInsegurasClientSide from "~/components/ViasInseguras/ViasInsegurasClientSide";

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
    viasData,
  } = useLoaderData<typeof loader>();

  return (
    <>
      <Banner
        image={cover}
        alt="Capa da página do Observatório de Vias Inseguras"
      />
      <Breadcrumb
        label="Observatório de Vias Inseguras"
        slug="/dados/observatorio/vias-inseguras"
        routes={["/", "/dados"]}
      />
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
      <ViasInsegurasClientSide viasData={viasData} />
      <CardsSession title={documents.title} cards={documents.cards} />
    </>
  );
}