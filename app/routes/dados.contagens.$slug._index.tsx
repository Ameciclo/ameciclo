import { FlowContainer } from "../components/Charts/FlowChart/FlowContainer";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { InfoCards } from "~/components/Contagens/InfoCards";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { colors } from "~/components/Charts/FlowChart/FlowContainer";
import { Link, useLoaderData, Await } from "@remix-run/react";
import { loader } from "~/loader/dados.contagens.$slug";
export { loader };
import { Suspense } from "react";
import React, { useEffect, useState } from "react";
// import Table from "~/components/Commom/Table/Table"; // Comentado
// import HighchartsReact from "highcharts-react-official"; // Comentado
// import Highcharts from "highcharts"; // Adicionado

const characteristicsMap = new Map([
  ["total_cyclists", { name: "Total" }],
  ["total_women", { name: "Mulheres" }],
  ["total_child", { name: "Crianças e Adolescentes" }],
  ["total_ride", { name: "Carona" }],
  ["total_helmet", { name: "Capacete" }],
  ["total_service", { name: "Serviço" }],
  ["total_cargo", { name: "Cargueira" }],
  ["total_shared_bike", { name: "Compartilhada" }],
  ["total_sidewalk", { name: "Calçada" }],
  ["total_wrong_way", { name: "Contramão" }],
  ["women", { name: "Mulheres" }],
  ["child", { name: "Crianças e Adolescentes" }],
  ["ride", { name: "Carona" }],
  ["helmet", { name: "Capacete" }],
  ["service", { name: "Serviço" }],
  ["cargo", { name: "Cargueira" }],
  ["shared_bike", { name: "Compartilhada" }],
  ["sidewalk", { name: "Calçada" }],
  ["wrong_way", { name: "Contramão" }],
]);

import { IntlPercentil, IntlNumber, IntlDateStr } from "~/services/utils";
import { HourlyCyclistsChart } from "~/components/Contagens/HourlyCyclistsChart";
import { CountingComparisionTable } from "~/components/Contagens/CountingComparisionTable";

// Placeholder para HourlyCyclistsChartProps
interface HourlyCyclistsChartProps {
  series: Series[];
  hours: number[];
}



type Series = {
  name: string | undefined;
  data: number[];
  visible?: boolean
};

interface CountEditionSummary {
  max_hour: number;
  total_cyclists: number;
  total_cargo: number;
  total_helmet: number;
  total_juveniles: number;
  total_motor: number;
  total_ride: number;
  total_service: number;
  total_shared_bike: number;
  total_sidewalk: number; 
  total_women: number;
  total_wrong_way: number;
}

interface CountEditionCoordinates {
  point: {
    latitude: number;
    longitude: number;
  };
  type: string;
  name: string;
}

interface CountEditionSession {
  start_time: string;
  end_time: string;
  total_cyclists: number;
  characteristics: {
    [key: string]: number;
  };
  quantitative: {
    [key: string]: number;
  };
}

interface CountEditionDirections {
  origin: string;
  destin: string;
  origin_cardinal: string;
  destin_cardinal: string;
}

interface CountEdition {
  id: number;
  slug: string;
  name: string;
  date: string;
  summary: CountEditionSummary;
  coordinates: CountEditionCoordinates[];
  sessions: {
    [key: string]: CountEditionSession;
  };
  directions: {
    [key: string]: CountEditionDirections;
  };
}

type pointData = {
  key: string;
  latitude: number;
  longitude: number;
  popup?: any;
  size?: number;
  color?: string;
  type?: string;
};

function getChartData(sessions: CountEditionSession[]) {
    const series: Series[] = [];
    const hours: number[] = [];
    const totalCyclists: number[] = [];

    Object.values(sessions).forEach((session) => {
        const { start_time, total_cyclists, characteristics } = session;
        const hour = parseInt(start_time.split('T')[1].split(':')[0]);
        hours.push(hour);
        totalCyclists.push(total_cyclists);

        Object.entries(characteristics).forEach(([key, value]) => {
            if (characteristicsMap.has(key)) {
                const characteristic = characteristicsMap.get(key);
                const seriesIndex = series.findIndex(
                    (s) => s.name === characteristic?.name
                );
                if (seriesIndex !== -1) {
                    series[seriesIndex].data.push(value);
                } else {
                    series.push({
                        name: characteristic?.name || "",
                        data: [value],
                        visible: false,
                    });
                }
            }
        });
    });

    series.push({
        name: "Total de Ciclistas",
        data: totalCyclists,
        visible: true,
    });

    return { series, hours };
}
function getCountingCards(data: CountEditionSummary) {
    const {
        total_cyclists,
        total_cargo,
        total_helmet,
        total_juveniles,
        total_motor,
        total_ride,
        total_service,
        total_shared_bike,
        total_sidewalk,
        total_women,
        total_wrong_way,
    } = { ...data };
    return [
        {
            label: "Mulheres",
            icon: "women",
            data: IntlPercentil(total_women / total_cyclists),
        },
        {
            label: "Crianças e Adolescentes",
            icon: "children",
            data: IntlPercentil(total_juveniles / total_cyclists),
        },
        {
            label: "Carona",
            icon: "ride",
            data: IntlPercentil(total_ride / total_cyclists),
        },
        {
            label: "Capacete",
            icon: "helmet",
            data: IntlPercentil(total_helmet / total_cyclists),
        },
        {
            label: "Serviço",
            icon: "service",
            data: IntlPercentil(total_service / total_cyclists),
        },
        {
            label: "Cargueira",
            icon: "cargo",
            data: IntlPercentil(total_cargo / total_cyclists),
        },
        {
            label: "Compartilhada",
            icon: "shared_bike",
            data: IntlPercentil(total_shared_bike / total_cyclists),
        },
        {
            label: "Calçada",
            icon: "sidewalk",
            data: IntlPercentil(total_sidewalk / total_cyclists),
        },
        {
            label: "Contramão",
            icon: "wrong_way",
            data: IntlPercentil(total_wrong_way / total_cyclists),
        },
    ];
}
function getPointsData(d: CountEdition) {
    const { name, coordinates, summary, date, slug, sessions } = d;
    
    if (!coordinates || coordinates.length === 0) {
        console.warn('No coordinates found for:', name);
        return [];
    }
    
    const [centralPoint] = coordinates;
    
    // Verificar se as coordenadas existem e são válidas
    const lat = centralPoint.point.latitude || centralPoint.point.y;
    const lng = centralPoint.point.longitude || centralPoint.point.x;
    
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
        console.warn('Invalid coordinates for:', name, { lat, lng });
        return [];
    }

    // Calcular fluxos por direção
    const flows = {
        north: 0,
        south: 0,
        east: 0,
        west: 0
    };
    
    Object.values(sessions || {}).forEach((session: any) => {
        const { quantitative } = session;
        if (quantitative) {
            flows.north += (quantitative.north_south || 0) + (quantitative.north_east || 0) + (quantitative.north_west || 0);
            flows.south += (quantitative.south_north || 0) + (quantitative.south_east || 0) + (quantitative.south_west || 0);
            flows.east += (quantitative.east_north || 0) + (quantitative.east_south || 0) + (quantitative.east_west || 0);
            flows.west += (quantitative.west_north || 0) + (quantitative.west_south || 0) + (quantitative.west_east || 0);
        }
    });

    const points = [
        {
            key: name,
            latitude: lat,
            longitude: lng,
            popup: {
                name: name,
                total: summary.total_cyclists,
                date: IntlDateStr(date),
                url: `/dados/contagens/${slug}`,
                obs: ""
            },
            size: 20,
            color: "#008888"
        },
        {
            key: `${name}_north`,
            latitude: lat + 0.001,
            longitude: lng,
            popup: {
                name: `${name} - Norte`,
                total: flows.north,
                date: IntlDateStr(date),
                url: "",
                obs: "Fluxo de ciclistas saindo da direção Norte"
            },
            size: Math.max(10, Math.round(flows.north / 10) + 5),
            color: colors[0]
        },
        {
            key: `${name}_south`,
            latitude: lat - 0.001,
            longitude: lng,
            popup: {
                name: `${name} - Sul`,
                total: flows.south,
                date: IntlDateStr(date),
                url: "",
                obs: "Fluxo de ciclistas saindo da direção Sul"
            },
            size: Math.max(10, Math.round(flows.south / 10) + 5),
            color: colors[1]
        },
        {
            key: `${name}_east`,
            latitude: lat,
            longitude: lng + 0.001,
            popup: {
                name: `${name} - Leste`,
                total: flows.east,
                date: IntlDateStr(date),
                url: "",
                obs: "Fluxo de ciclistas saindo da direção Leste"
            },
            size: Math.max(10, Math.round(flows.east / 10) + 5),
            color: colors[2]
        },
        {
            key: `${name}_west`,
            latitude: lat,
            longitude: lng - 0.001,
            popup: {
                name: `${name} - Oeste`,
                total: flows.west,
                date: IntlDateStr(date),
                url: "",
                obs: "Fluxo de ciclistas saindo da direção Oeste"
            },
            size: Math.max(10, Math.round(flows.west / 10) + 5),
            color: colors[3]
        },
    ];

    return points;
}
const CountingStatistic = (data: CountEdition) => {
    const { id, date, summary } = { ...data };
    const { total_cyclists, max_hour } = { ...summary };
    const JSON_URL = `${COUNTINGS_DATA}/${id}`;
    return [
        { title: "Total de ciclistas", value: IntlNumber(total_cyclists) },
        {
            title: "Pico em 1h",
            value: IntlNumber(max_hour),
        },
        { title: "Data da Contagem", value: IntlDateStr(date) },
        {
            type: "LinksBox",
            title: "Dados",
            value: [
                {
                    label: "JSON",
                    url: JSON_URL,
                },
            ],
        },
    ];
};



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
            
            <Breadcrumb label="Contagens" slug="/contagens" routes={["/", "/dados"]} />
            
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32" />}>
                <Await resolve={dataPromise}>
                    {(data) => {
                        if (!data) {
                            throw new Response("Not Found", { status: 404 });
                        }
                        return (
                            <StatisticsBox title={data.name} boxes={CountingStatistic(data)} />
                        );
                    }}
                </Await>
            </Suspense>
            
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96" />}>
                <Await resolve={dataPromise}>
                    {(data) => {
                        if (!data) return null;
                        const pointsData = getPointsData(data) as pointData[];
                        return (
                            <section className="container mx-auto grid lg:grid-cols-3 md:grid-cols-1 auto-rows-auto gap-10">
                                <div
                                    className="bg-green-200 rounded shadow-2xl lg:col-span-2 col-span-3"
                                    style={{ minHeight: "400px" }}
                                >
                                    <AmecicloMap pointsData={pointsData} height="400px" />
                                </div>
                                <div className="rounded shadow-2xl lg:col-span-1 col-span-3 flex justify-between flex-col">
                                    <FlowContainer data={data} />
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
                        return (
                            <InfoCards cards={getCountingCards(data.summary)} />
                        );
                    }}
                </Await>
            </Suspense>
            
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96" />}>
                <Await resolve={dataPromise}>
                    {(data) => {
                        if (!data) return null;
                        const { series, hours } = getChartData(data.sessions);
                        return (
                            <HourlyCyclistsChart series={series as Series[]} hours={hours} />
                        );
                    }}
                </Await>
            </Suspense>
            
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64" />}>
                <Await resolve={Promise.all([dataPromise, pageDataPromise])}>
                    {([data, pageData]) => {
                        if (!data) return null;
                        const filteredData = pageData.otherCounts?.filter((d: any) => d.id !== data.id) || [];
                        return (
                            <CountingComparisionTable
                                data={filteredData}
                                firstSlug={data.slug}
                            />
                        );
                    }}
                </Await>
            </Suspense>
        </main>
    );
};

export default Contagem;
