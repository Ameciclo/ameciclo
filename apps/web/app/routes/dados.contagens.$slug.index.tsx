import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { InfoCards } from "~/components/Contagens/InfoCards";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { CountingComparisionTable } from "~/components/Contagens/CountingComparisionTable";
import { HourlyCyclistsChart } from "~/components/Contagens/HourlyCyclistsChart";
import { MovementDiagram } from "@ameciclo/ui/components/movement-diagram";
import { contagemSlugQueryOptions } from "~/queries/dados.contagens.$slug";
import {
  getCountingCards,
  getPointsData,
  getCountingStatistics,
  transformOtherCountsForComparison,
} from "~/services/counting-details.service";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/dados/contagens/$slug/")({
  loader: ({ context: { queryClient }, params: { slug } }) =>
    queryClient.ensureQueryData(contagemSlugQueryOptions(slug)),
  head: ({ params, loaderData }) => {
    const data = loaderData?.data;
    const pageData = loaderData?.pageData;
    const title = data?.name
      ? `Contagem ${data.name} - Ameciclo`
      : "Contagem - Ameciclo";
    const description = data?.name
      ? `Dados e resultados da contagem de ciclistas realizada pela Ameciclo em ${data.name}.`
      : "Resultados de contagens de ciclistas realizadas pela Ameciclo na Região Metropolitana do Recife.";
    return seo({
      title,
      description,
      pathname: `/dados/contagens/${params.slug}`,
      image: pageData?.pageCover?.cover?.url,
      type: "article",
    });
  },
  component: Contagem,
  pendingComponent: () => <RouteLoading label="Carregando contagem..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function Contagem() {
    const { slug } = Route.useParams();
    const { data: loaderData } = useSuspenseQuery(contagemSlugQueryOptions(slug));
    const data = loaderData.data;
    const detail = loaderData.detail;
    const pageData = loaderData.pageData;

    if (!data) throw new Response("Not Found", { status: 404 });

    const flows = Object.fromEntries((detail?.flows ?? []).map((f) => [`${f.from}-${f.to}`, f.value]));
    const hoursLabel = (hours: number[]) => hours.map((h) => `${h}h`).join(", ");

    const pointsData = getPointsData(data, data.selectedCount);

    return (
        <main className="flex-auto">
            <Banner image={pageData.pageCover?.cover?.url} alt="Capa da contagem" />

            <Breadcrumb
                label={["Contagens", data?.name || ""]}
                slug={["/dados/contagens", ""]}
                routes={["/", "/dados"]}
            />

            <StatisticsBox
                title={data.name}
                boxes={getCountingStatistics(data, data.selectedCount)}
            />

            {detail?.estimated && (
                <p className="container mx-auto my-6 text-center text-sm text-gray-600">
                    Contagem estimada: foram observados apenas os horários {hoursLabel(detail.observedHours ?? [])}; o restante do dia foi projetado.
                </p>
            )}
            {detail?.partial && (
                <p className="container mx-auto my-6 text-center text-sm text-gray-600">
                    Contagem parcial: só há dados em {hoursLabel(detail.observedHours ?? [])}. Os demais horários não foram contados.
                </p>
            )}

            <section className="container mx-auto grid lg:grid-cols-3 md:grid-cols-1 auto-rows-auto gap-10">
                <div className="bg-green-200 rounded-sm shadow-2xl lg:col-span-2 col-span-3" style={{ minHeight: "400px" }}>
                    {pointsData.length > 0 ? (
                        <AmecicloMap pointsData={pointsData} height="400px" />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Carregando mapa...</p>
                        </div>
                    )}
                </div>
                <div className="rounded-sm shadow-2xl lg:col-span-1 col-span-3 flex flex-col justify-center items-center p-8">
                    <h3 className="text-gray-800 text-xl font-bold mb-4 text-center">Fluxo de Ciclistas por Direção</h3>
                    {detail && detail.approaches.length <= 4 ? (
                        <>
                            <MovementDiagram topology={detail.topology} approaches={detail.approaches} flows={flows} />
                            <p className="text-xs text-gray-500 text-center mt-2">A posição das aproximações no desenho é ilustrativa.</p>
                        </>
                    ) : (
                        <p className="text-sm text-gray-500 text-center">Não há dados de fluxo para esta contagem.</p>
                    )}
                </div>
            </section>

            <InfoCards cards={getCountingCards(data.selectedCount)} />

            {detail && detail.hours.length > 0 && <HourlyCyclistsChart series={detail.series} hours={detail.hours} />}

            {(() => {
                const allCounts = transformOtherCountsForComparison(pageData.otherCounts || [], data.id);
                return (
                    <CountingComparisionTable
                        data={allCounts}
                        firstSlug={data.id.toString()}
                    />
                );
            })()}
        </main>
    );
}
