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
    usingMockData,
    mockDataDate,
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
      {usingMockData && (
        <div className="bg-orange-100 border-l-4 border-orange-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-orange-700">
                <strong>Dados Estáticos:</strong> Esta página está exibindo dados reais de dezembro de 2024. Os dados atualizados vindos da API estão temporariamente indisponíveis.
              </p>
            </div>
          </div>
        </div>
      )}
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
        <Await resolve={citiesData} errorElement={
          <div className="container mx-auto py-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-yellow-800 font-medium mb-2">Dados temporariamente indisponíveis</h3>
              <p className="text-yellow-700 text-sm">Os dados do SAMU estão sendo carregados. Tente novamente em alguns instantes.</p>
            </div>
          </div>
        }>
          {(resolvedCitiesData) => (
            <SamuClientSide citiesData={resolvedCitiesData || { cidades: [], total: 0 }} />
          )}
        </Await>
      </Suspense>
      <CardsSession title={documents.title} cards={documents.cards} />
    </>
  );
}
