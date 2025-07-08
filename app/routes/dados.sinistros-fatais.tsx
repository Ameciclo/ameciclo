import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import SinistrosFataisClientSide from "~/components/SinistrosFatais/SinistrosFataisClientSide";
import { loader as sinistrosFataisLoader } from "~/loader/dados.sinistros-fatais";

export const meta: MetaFunction = () => {
  return [
    { title: "Observatório de Sinistros Fatais | Ameciclo" },
    { 
      name: "description", 
      content: "Dados de mortalidade no trânsito extraídos do DATASUS para análise de segurança viária na RMR." 
    },
  ];
};

export const loader = sinistrosFataisLoader;

export default function SinistrosFataisPage() {
  const { summary, citiesByYear, pageData } = useLoaderData<typeof loader>();

  return (
    <>
      <Banner
        image={pageData.coverImage}
        alt={pageData.title}
      />
      <Breadcrumb
        label="Observatório de Sinistros Fatais"
        slug="/dados/sinistros-fatais"
        routes={["/", "/dados", "/dados/sinistros-fatais"]}
      />
      <SinistrosFataisClientSide 
        summaryData={summary} 
        citiesByYearData={citiesByYear}
        pageData={pageData}
      />
    </>
  );
}