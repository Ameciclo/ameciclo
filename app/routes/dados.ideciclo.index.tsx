import { createFileRoute } from "@tanstack/react-router";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ExplanationBoxesIdeciclo } from "~/components/Ideciclo/ExplanationBoxesIdeciclo";
import IdecicloClientSide from "~/components/Ideciclo/IdecicloClientSide";
import { StatisticsBoxIdeciclo } from "~/components/Ideciclo/StatisticsBoxIdeciclo";
import { calculateIdecicloStatistics } from "~/services/ideciclo-statistics.service";
import { useSuspenseQuery } from "@tanstack/react-query";
import { idecicloQueryOptions } from "~/queries/dados.ideciclo";
import { useReportApiErrors } from "~/hooks/useReportApiErrors";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/dados/ideciclo/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(idecicloQueryOptions()),
  head: () =>
    seo({
      title: "Ideciclo - Índice de Desenvolvimento Cicloviário - Ameciclo",
      description:
        "Índice Ideciclo: metodologia de avaliação da malha e qualidade das estruturas cicloviárias das cidades brasileiras.",
      pathname: "/dados/ideciclo",
    }),
  component: Ideciclo,
  pendingComponent: () => <RouteLoading label="Carregando dados do IDECICLO..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function Ideciclo() {
    const { data } = useSuspenseQuery(idecicloQueryOptions());
    const { ideciclo, structures, pageData, apiDown } = data;
    useReportApiErrors(data);

    const coverImage = pageData?.cover?.url || "/pages_covers/ideciclo-cover.png";
    const cidades = (ideciclo || []).filter((c: any) => c.reviews?.length > 0);
    const statistics = calculateIdecicloStatistics(cidades, structures || []);

    return (
        <>
            <Banner title="" image={coverImage} />
            <Breadcrumb label="Ideciclo" slug="/dados/ideciclo" routes={["/", "/dados"]} />
            <ApiStatusHandler apiDown={apiDown} />
            <StatisticsBoxIdeciclo title={"Estatísticas Gerais"} boxes={statistics} />
            <ExplanationBoxesIdeciclo
                boxes={[
                    { title: "O que é?", description: pageData?.description || "" },
                    { title: "Para que serve?", description: pageData?.objective || "" },
                    { title: "Metodologia", description: pageData?.methodology || "" },
                ]}
            />
            <IdecicloClientSide
                cidades={cidades}
                structures={structures || []}
                ideciclo={ideciclo || []}
            />
        </>
    );
}
