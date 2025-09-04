import React, { Suspense } from "react";
import { useLoaderData, Await } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { CardsSession } from "~/components/Commom/CardsSession";
import SamuClientSide from "~/components/Samu/SamuClientSide";

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
  } = useLoaderData<typeof loader>();

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
      <Suspense fallback={
        <div className="container mx-auto py-8">
          <div className="animate-pulse bg-gray-200 h-96 w-full rounded-lg mb-12"></div>
        </div>
      }>
        <Await resolve={citiesData}>
          {(resolvedCitiesData) => (
            <SamuClientSide citiesData={resolvedCitiesData} />
          )}
        </Await>
      </Suspense>
      <CardsSession title={documents.title} cards={documents.cards} />
    </>
  );
}
