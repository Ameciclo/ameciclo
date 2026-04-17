import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import SinistrosFataisClientSide from "~/components/SinistrosFatais/SinistrosFataisClientSide";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useApiStatusHandler } from "~/hooks/useApiStatusHandler";
import { sinistrosFataisQueryOptions } from "~/loader/dados.sinistros-fatais";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/dados/sinistrosfatais/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(sinistrosFataisQueryOptions()),
  head: () => {
    const s = seo({
      title: "Sinistros Fatais - Observatório de Segurança Viária - Ameciclo",
      description:
        "Dados de mortalidade no trânsito extraídos do DATASUS para análise de segurança viária no Recife e Região Metropolitana.",
      pathname: "/dados/sinistrosfatais",
    });
    return { meta: s.meta, links: s.links, scripts: s.scripts };
  },
  component: SinistrosFataisPage,
});

function SinistrosFataisPage() {
  const { data: { summary, citiesByYear, pageData, apiDown, apiErrors } } = useSuspenseQuery(sinistrosFataisQueryOptions());
  useApiStatusHandler(apiDown, apiErrors, '/dados/sinistros-fatais');

  return (
    <>
      <Banner
        title={pageData.title}
        image={pageData.coverImage}
      />
      <Breadcrumb
        label="Observatório de Sinistros Fatais"
        slug="/dados/sinistros-fatais"
        routes={["/", "/dados"]}
      />
      <ApiStatusHandler apiDown={apiDown} />

      <SinistrosFataisClientSide
        summaryData={summary}
        citiesByYearData={citiesByYear}
        pageData={pageData}
      />
    </>
  );
}
