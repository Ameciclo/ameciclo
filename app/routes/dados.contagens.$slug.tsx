import { useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { GeneralCountStatistics } from "~/components/Contagens/GeneralCountStatistics";
import { CountsMap } from "~/components/Contagens/CountsMap";
import { InfoCards } from "~/components/Contagens/InfoCards";
import { HourlyCyclistsChart } from "~/components/Contagens/HourlyCyclistsChart";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { IntlNumber, IntlDateStr, IntlPercentil } from "~/services/utils";
import { pointData } from "typings";

export async function loader({ params }: LoaderFunctionArgs) {
    const { slug } = params;
    const id = slug?.split("-")[0];
    
    try {
        const data = await fetchWithTimeout(
            `http://api.garfo.ameciclo.org/cyclist-counts/edition/${id}`,
            { cache: "no-cache" },
            5000,
            null
        );
        
        if (!data) {
            throw new Response("Contagem não encontrada", { status: 404 });
        }
        
        const pageData = await fetchWithTimeout(
            "https://cms.ameciclo.org/contagens",
            { cache: "no-cache" },
            5000,
            { cover: null }
        );
        
        return json({ contagem: data, cover: pageData?.cover });
    } catch (error) {
        throw new Response("Erro ao carregar contagem", { status: 500 });
    }
}

function getPointsData(data: any): pointData[] {
    const { name, coordinates } = data;
    const coord = coordinates[0];
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"];
    
    return [
        {
            key: name,
            latitude: coord.latitude,
            longitude: coord.longitude,
            type: 'main',
            popup: { name, total: data.summary.total_cyclists, date: data.date, url: '', obs: '' },
            size: 20,
            color: "#008888"
        },
        {
            key: `${name}_north`,
            latitude: coord.latitude + 0.001,
            longitude: coord.longitude,
            type: 'direction',
            popup: { name: data.directions.north, total: '', date: '', url: '', obs: '' },
            size: 15,
            color: colors[0]
        },
        {
            key: `${name}_south`,
            latitude: coord.latitude - 0.001,
            longitude: coord.longitude,
            type: 'direction',
            popup: { name: data.directions.south, total: '', date: '', url: '', obs: '' },
            size: 15,
            color: colors[1]
        },
        {
            key: `${name}_east`,
            latitude: coord.latitude,
            longitude: coord.longitude + 0.001,
            type: 'direction',
            popup: { name: data.directions.east, total: '', date: '', url: '', obs: '' },
            size: 15,
            color: colors[2]
        },
        {
            key: `${name}_west`,
            latitude: coord.latitude,
            longitude: coord.longitude - 0.001,
            type: 'direction',
            popup: { name: data.directions.west, total: '', date: '', url: '', obs: '' },
            size: 15,
            color: colors[3]
        }
    ];
}

function getCountingStatistics(data: any) {
    const { id, date, summary } = data;
    const { total_cyclists, max_hour } = summary;
    
    return [
        { title: "Total de ciclistas", value: IntlNumber(total_cyclists) },
        { title: "Pico em 1h", value: IntlNumber(max_hour) },
        { title: "Data da Contagem", value: IntlDateStr(date) },
        {
            type: "LinksBox",
            title: "Dados",
            value: [{ label: "JSON", url: `http://api.garfo.ameciclo.org/cyclist-counts/edition/${id}` }]
        }
    ];
}

function getCountingCards(summary: any) {
    const {
        total_cyclists,
        total_cargo,
        total_helmet,
        total_juveniles,
        total_ride,
        total_service,
        total_shared_bike,
        total_sidewalk,
        total_women,
        total_wrong_way
    } = summary;
    
    return [
        { label: "Mulheres", icon: "women", data: IntlPercentil(total_women / total_cyclists) },
        { label: "Crianças e Adolescentes", icon: "children", data: IntlPercentil(total_juveniles / total_cyclists) },
        { label: "Carona", icon: "ride", data: IntlPercentil(total_ride / total_cyclists) },
        { label: "Capacete", icon: "helmet", data: IntlPercentil(total_helmet / total_cyclists) },
        { label: "Serviço", icon: "service", data: IntlPercentil(total_service / total_cyclists) },
        { label: "Cargueira", icon: "cargo", data: IntlPercentil(total_cargo / total_cyclists) },
        { label: "Compartilhada", icon: "shared_bike", data: IntlPercentil(total_shared_bike / total_cyclists) },
        { label: "Calçada", icon: "sidewalk", data: IntlPercentil(total_sidewalk / total_cyclists) },
        { label: "Contramão", icon: "wrong_way", data: IntlPercentil(total_wrong_way / total_cyclists) }
    ];
}

function getChartData(sessions: any) {
    const series: any[] = [];
    const hours: number[] = [];
    const totalCyclists: number[] = [];
    
    Object.values(sessions).forEach((session: any) => {
        const { start_time, total_cyclists } = session;
        const date = new Date(start_time);
        const hour = date.getHours();
        hours.push(hour);
        totalCyclists.push(total_cyclists);
    });
    
    series.push({
        name: "Total de Ciclistas",
        data: totalCyclists,
        visible: true
    });
    
    return { series, hours };
}

const FlowContainer = ({ data }: { data: any }) => {
    const { directions, summary } = data;
    
    const calculateDirectionFlow = () => {
        const flows = { north: 0, south: 0, east: 0, west: 0 };
        
        Object.values(data.sessions || {}).forEach((session: any) => {
            const { quantitative } = session;
            if (quantitative) {
                flows.north += (quantitative.north_south || 0) + (quantitative.north_east || 0) + (quantitative.north_west || 0);
                flows.south += (quantitative.south_north || 0) + (quantitative.south_east || 0) + (quantitative.south_west || 0);
                flows.east += (quantitative.east_north || 0) + (quantitative.east_south || 0) + (quantitative.east_west || 0);
                flows.west += (quantitative.west_north || 0) + (quantitative.west_south || 0) + (quantitative.west_east || 0);
            }
        });
        
        return flows;
    };
    
    const flows = calculateDirectionFlow();
    const maxFlow = Math.max(...Object.values(flows));
    
    return (
        <div className="bg-white rounded-lg shadow-xl p-6 h-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Fluxo por Direção</h3>
            <div className="space-y-4">
                {Object.entries(directions).map(([key, direction]) => {
                    const flow = flows[key as keyof typeof flows];
                    const percentage = maxFlow > 0 ? (flow / maxFlow) * 100 : 0;
                    
                    return (
                        <div key={key} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700 capitalize">
                                    {direction as string}
                                </span>
                                <span className="text-sm text-gray-600">
                                    {flow} ciclistas
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                    className="bg-ameciclo h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-center">
                    <span className="text-lg font-bold text-ameciclo">
                        {summary.total_cyclists}
                    </span>
                    <p className="text-sm text-gray-600">Total de Ciclistas</p>
                </div>
            </div>
        </div>
    );
};

export default function ContagemIndividual() {
    const { contagem, cover } = useLoaderData<typeof loader>();
    
    const pointsData = getPointsData(contagem);
    const statistics = getCountingStatistics(contagem);
    const cards = getCountingCards(contagem.summary);
    const { series, hours } = getChartData(contagem.sessions);
    
    return (
        <>
            <Banner image={cover?.url || "/projetos.webp"} alt={`Capa da contagem ${contagem.name}`} />
            <Breadcrumb 
                label={contagem.name} 
                slug={`/dados/contagens/${contagem.slug}`} 
                routes={["/", "/dados", "/dados/contagens"]} 
            />
            
            <GeneralCountStatistics title={contagem.name} boxes={statistics} />
            
            <section className="container mx-auto grid lg:grid-cols-3 md:grid-cols-1 auto-rows-auto gap-10 my-8">
                <div className="lg:col-span-2 col-span-3">
                    <CountsMap pointsData={pointsData} height="400px" />
                </div>
                <div className="lg:col-span-1 col-span-3">
                    <FlowContainer data={contagem} />
                </div>
            </section>
            
            <InfoCards cards={cards} />
            <HourlyCyclistsChart series={series} hours={hours} />
        </>
    );
}