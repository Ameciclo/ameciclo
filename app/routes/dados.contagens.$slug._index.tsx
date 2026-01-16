import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { InfoCards } from "~/components/Contagens/InfoCards";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { FlowContainer } from "~/components/Contagens/FlowContainer";
import { HourlyCyclistsChart } from "~/components/Contagens/HourlyCyclistsChart";
import { useLoaderData, Await } from "@remix-run/react";
import { loader } from "~/loader/dados.contagens.$slug";
export { loader };
import { Suspense } from "react";
import { IntlPercentil, IntlNumber, IntlDateStr } from "~/services/utils";
import { CountingComparisionTable } from "~/components/Contagens/CountingComparisionTable";

type pointData = {
  key: string;
  latitude: number;
  longitude: number;
  popup?: any;
  size?: number;
  color?: string;
};

function getCountingCards(count: any) {
    const chars = count.characteristics || {};
    const total = count.total_cyclists || 1;
    
    return [
        { label: "Mulheres", icon: "women", data: IntlPercentil((chars.women || 0) / total) },
        { label: "Crianças e Adolescentes", icon: "children", data: IntlPercentil((chars.juveniles || 0) / total) },
        { label: "Carona", icon: "ride", data: IntlPercentil((chars.ride || 0) / total) },
        { label: "Capacete", icon: "helmet", data: IntlPercentil((chars.helmet || 0) / total) },
        { label: "Serviço", icon: "service", data: IntlPercentil((chars.service || 0) / total) },
        { label: "Cargueira", icon: "cargo", data: IntlPercentil((chars.cargo || 0) / total) },
        { label: "Compartilhada", icon: "shared_bike", data: IntlPercentil((chars.shared_bike || 0) / total) },
        { label: "Calçada", icon: "sidewalk", data: IntlPercentil((chars.sidewalk || 0) / total) },
        { label: "Contramão", icon: "wrong_way", data: IntlPercentil((chars.wrong_way || 0) / total) },
    ];
}

function getPointsData(location: any, count: any): pointData[] {
    const lat = parseFloat(location.latitude);
    const lng = parseFloat(location.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
        console.warn('Invalid coordinates for location:', location.name);
        return [];
    }
    
    return [{
        key: location.name,
        latitude: lat,
        longitude: lng,
        popup: {
            name: location.name,
            total: count.total_cyclists,
            date: IntlDateStr(count.date),
            url: `/dados/contagens/${location.id}`,
            obs: ""
        },
        size: 20,
        color: "#008888"
    }];
}

const CountingStatistic = (location: any, count: any) => {
    return [
        { title: "Total de ciclistas", value: IntlNumber(count.total_cyclists) },
        { title: "Pico em 1h", value: IntlNumber(count.max_hour_cyclists || 0) },
        { title: "Data da Contagem", value: IntlDateStr(count.date) },
        {
            type: "LinksBox",
            title: "Dados",
            value: [{ label: "JSON", url: `https://cyclist-counts.atlas.ameciclo.org/v1/locations/${location.id}` }],
        },
    ];
};

function getFlowData(location: any, count: any) {
    return {
        name: location.name,
        date: count.date,
        summary: { total_cyclists: count.total_cyclists },
        directions: {},
        sessions: {}
    };
}

function getChartData() {
    return { series: [], hours: [] };
}

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
                                boxes={CountingStatistic(data, data.selectedCount)} 
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
                        // Transformar locations em lista de contagens para comparação
                        const allCounts = (pageData.otherCounts || [])
                            .filter((loc: any) => loc.id !== data.id)
                            .flatMap((loc: any) => 
                                (loc.counts || []).map((count: any) => ({
                                    id: loc.id,
                                    name: loc.name,
                                    slug: loc.id.toString(),
                                    date: count.date,
                                    total_cyclists: count.total_cyclists
                                }))
                            );
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
