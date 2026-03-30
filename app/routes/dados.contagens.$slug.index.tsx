import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { InfoCards } from "~/components/Contagens/InfoCards";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { CountingComparisionTable } from "~/components/Contagens/CountingComparisionTable";
import { contagemSlugQueryOptions } from "~/loader/dados.contagens.$slug";
import {
  getCountingCards,
  getPointsData,
  getCountingStatistics,
  transformOtherCountsForComparison,
} from "~/services/counting-details.service";

export const Route = createFileRoute("/dados/contagens/$slug/")({
  loader: ({ context: { queryClient }, params: { slug } }) =>
    queryClient.ensureQueryData(contagemSlugQueryOptions(slug)),
  component: Contagem,
});

function Contagem() {
    const { slug } = Route.useParams();
    const { data: loaderData } = useSuspenseQuery(contagemSlugQueryOptions(slug));
    const data = loaderData.data;
    const pageData = loaderData.pageData;

    if (!data) throw new Response("Not Found", { status: 404 });

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

            <section className="container mx-auto grid lg:grid-cols-3 md:grid-cols-1 auto-rows-auto gap-10">
                <div className="bg-green-200 rounded shadow-2xl lg:col-span-2 col-span-3" style={{ minHeight: "400px" }}>
                    {pointsData.length > 0 ? (
                        <AmecicloMap pointsData={pointsData} height="400px" />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Carregando mapa...</p>
                        </div>
                    )}
                </div>
                <div className="rounded shadow-2xl lg:col-span-1 col-span-3 flex flex-col justify-center items-center p-8">
                    <h3 className="text-gray-800 text-xl font-bold mb-4 text-center">Fluxo de Ciclistas por Direção</h3>
                    <div className="text-center text-gray-500">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ameciclo mx-auto mb-4"></div>
                        <p className="text-sm">Estamos resolvendo um problema nessa sessão</p>
                    </div>
                </div>
            </section>

            <InfoCards cards={getCountingCards(data.selectedCount)} />

            <section className="container mx-auto my-10 shadow-2xl rounded p-12 bg-gray-50">
                <h2 className="text-gray-800 text-2xl font-bold mb-6">Gráfico de Ciclistas por Hora</h2>
                <div className="text-center text-gray-500 py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ameciclo mx-auto mb-4"></div>
                    <p className="text-sm">Estamos resolvendo um problema nessa sessão</p>
                </div>
            </section>

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
