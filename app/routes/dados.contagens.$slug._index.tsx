import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { InfoCards } from "~/components/Contagens/InfoCards";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { CountingComparisionTable } from "~/components/Contagens/CountingComparisionTable";
import { useLoaderData, Await } from "@remix-run/react";
import { Suspense } from "react";
import { loader } from "~/loader/dados.contagens.$slug";
import {
  getCountingCards,
  getPointsData,
  getCountingStatistics,
  transformOtherCountsForComparison,
} from "~/services/counting-details.service";

export { loader };

const Contagem = () => {
    const { dataPromise, pageDataPromise } = useLoaderData<typeof loader>();

    return (
        <main className="flex-auto">
            <Suspense fallback={<div className="animate-pulse bg-gray-300 h-64" />}>
                <Await resolve={pageDataPromise}>
                    {(pageData) => (
                        <Banner image={pageData.pageCover?.cover?.url} alt="Capa da contagem" />
                    )}
                </Await>
            </Suspense>
            
            <Suspense fallback={<Breadcrumb label="Contagens" slug="/dados/contagens" routes={["/", "/dados"]} />}>
                <Await resolve={dataPromise}>
                    {(data) => (
                        <Breadcrumb 
                            label={["Contagens", data?.name || ""]} 
                            slug={["/dados/contagens", ""]} 
                            routes={["/", "/dados"]} 
                        />
                    )}
                </Await>
            </Suspense>
            
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32" />}>
                <Await resolve={dataPromise}>
                    {(data) => {
                        if (!data) throw new Response("Not Found", { status: 404 });
                        return (
                            <StatisticsBox 
                                title={data.name} 
                                boxes={getCountingStatistics(data, data.selectedCount)} 
                            />
                        );
                    }}
                </Await>
            </Suspense>
            
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96" />}>
                <Await resolve={dataPromise}>
                    {(data) => {
                        if (!data) return null;
                        const pointsData = getPointsData(data, data.selectedCount);
                        const flowData = getFlowData(data, data.selectedCount);
                        return (
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
                        );
                    }}
                </Await>
            </Suspense>
            
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64" />}>
                <Await resolve={dataPromise}>
                    {(data) => {
                        if (!data) return null;
                        return <InfoCards cards={getCountingCards(data.selectedCount)} />;
                    }}
                </Await>
            </Suspense>
            
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96" />}>
                <Await resolve={dataPromise}>
                    {(data) => {
                        if (!data) return null;
                        return (
                            <section className="container mx-auto my-10 shadow-2xl rounded p-12 bg-gray-50">
                                <h2 className="text-gray-800 text-2xl font-bold mb-6">Gráfico de Ciclistas por Hora</h2>
                                <div className="text-center text-gray-500 py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ameciclo mx-auto mb-4"></div>
                                    <p className="text-sm">Estamos resolvendo um problema nessa sessão</p>
                                </div>
                            </section>
                        );
                    }}
                </Await>
            </Suspense>
            
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64" />}>
                <Await resolve={Promise.all([dataPromise, pageDataPromise])}>
                    {([data, pageData]) => {
                        if (!data) return null;
                        const allCounts = transformOtherCountsForComparison(pageData.otherCounts || [], data.id);
                        return (
                            <CountingComparisionTable
                                data={allCounts}
                                firstSlug={data.id.toString()}
                            />
                        );
                    }}
                </Await>
            </Suspense>
        </main>
    );
};

export default Contagem;
