import { Link, createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { slugifyCount } from "~/services/slug";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { InfoCards } from "~/components/Contagens/InfoCards";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { CountingComparisionTable } from "~/components/Contagens/CountingComparisionTable";
import { HourlyCyclistsChart } from "~/components/Contagens/HourlyCyclistsChart";
import { FlowContainer } from "~/components/Charts/FlowChart/FlowContainer";
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
    const pageData = loaderData.pageData;
    const sessions = loaderData.sessions || [];
    const details = loaderData.details;

    if (!data) throw new Response("Not Found", { status: 404 });

    const allLocationCounts = (data.counts || []).sort(
      (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    const hasMultipleCounts = allLocationCounts.length > 1;
    const evolutionSlugs = allLocationCounts
      .map((c: any) => slugifyCount(data, c))
      .join("&");

    const pointsData = getPointsData(data, data.selectedCount);

    const chartHours = sessions.map((s: any) => {
      const match = s.session_label?.match(/^(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });

    const CHART_SERIES = [
      { key: "total_cyclists", label: "Total", field: "total_cyclists" },
      { key: "women", label: "Mulheres", field: "characteristics" },
      { key: "helmet", label: "Capacete", field: "characteristics" },
      { key: "cargo", label: "Cargueira", field: "characteristics" },
      { key: "ride", label: "Carona", field: "characteristics" },
      { key: "juveniles", label: "Crianças e Jovens", field: "characteristics" },
      { key: "sidewalk", label: "Calçada", field: "characteristics" },
      { key: "wrong_way", label: "Contramão", field: "characteristics" },
      { key: "service", label: "Serviço", field: "characteristics" },
      { key: "shared_bike", label: "Compartilhada", field: "characteristics" },
    ];

    const chartSeries = sessions.length > 0
      ? CHART_SERIES.map(({ key, label, field }) => ({
          name: label,
          data: sessions.map((s: any) =>
            field === "total_cyclists"
              ? s.total_cyclists || 0
              : s.characteristics?.[key] || 0,
          ),
          visible: key === "total_cyclists",
        }))
      : [];

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

            <section className="container mx-auto grid lg:grid-cols-3 md:grid-cols-1 auto-rows-auto gap-10">
                <div className="rounded-sm shadow-2xl lg:col-span-2 col-span-3 h-[400px]">
                    {pointsData.length > 0 ? (
                        <AmecicloMap pointsData={pointsData} height="100%" width="100%" />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Carregando mapa...</p>
                        </div>
                    )}
                </div>
                <div className="rounded-sm shadow-2xl lg:col-span-1 col-span-3 flex flex-col items-center p-4">
                    <h3 className="text-gray-800 text-xl font-bold mb-4 text-center">Fluxo de Ciclistas por Direção</h3>
                    {details ? (
                      <FlowContainer data={details} />
                    ) : (
                      <div className="flex flex-col justify-center items-center p-8 text-center text-gray-500">
                        <p className="text-sm">Dados de direção indisponíveis para esta contagem.</p>
                      </div>
                    )}
                </div>
            </section>

            <InfoCards cards={getCountingCards(data.selectedCount)} />

            <section className="container mx-auto my-10 shadow-2xl rounded-sm p-12 bg-gray-50">
                {chartSeries.length > 0 ? (
                  <HourlyCyclistsChart series={chartSeries as any} hours={chartHours} />
                ) : (
                  <>
                    <h2 className="text-gray-800 text-2xl font-bold mb-6">Gráfico de Ciclistas por Hora</h2>
                    <div className="text-center text-gray-500 py-12">
                      <p className="text-sm">Dados por hora indisponíveis para esta contagem.</p>
                    </div>
                  </>
                )}
            </section>

             {hasMultipleCounts && (
              <section className="container mx-auto mt-6 mb-2 text-center">
                <Link
                  to="/dados/contagens/compare/$slugs"
                  params={{ slugs: evolutionSlugs }}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-ameciclo text-white rounded-lg hover:bg-ameciclo/90 transition-colors font-medium shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Ver evolução deste ponto ({allLocationCounts.length} contagens)
                </Link>
              </section>
            )}

            {(() => {
                const allCounts = transformOtherCountsForComparison(pageData.otherCounts || [], data.id);
                return (
                    <CountingComparisionTable
                        data={allCounts}
                        compareSlugs={[slug]}
                    />
                );
            })()}
        </main>
    );
}
