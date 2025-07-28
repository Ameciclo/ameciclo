import { FlowContainer } from "../components/Charts/FlowChart/FlowContainer";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { InfoCards } from "~/components/Contagens/InfoCards";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { colors } from "~/components/Charts/FlowChart/FlowContainer";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
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

const COUNTINGS_SUMMARY_DATA = "http://api.garfo.ameciclo.org/cyclist-counts"
const COUNTINGS_DATA = "http://api.garfo.ameciclo.org/cyclist-counts/edition"
const COUNTINGS_PAGE_DATA = "https://cms.ameciclo.org/contagens"

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
    x: number;
    y: number;
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
    const { name, coordinates } = d;
    const [centralPoint] = coordinates;

    const points = [
        {
            key: name,
            latitude: centralPoint.point.latitude,
            longitude: centralPoint.point.longitude,
        },
        {
            key: `${name}_north`,
            latitude: centralPoint.point.latitude + 0.001,
            longitude: centralPoint.point.longitude,
            color: colors[0]
        },
        {
            key: `${name}_south`,
            latitude: centralPoint.point.latitude - 0.001,
            longitude: centralPoint.point.longitude,
            color: colors[1]
        },
        {
            key: `${name}_east`,
            latitude: centralPoint.point.latitude,
            longitude: centralPoint.point.longitude + 0.001,
            color: colors[2]
        },
        {
            key: `${name}_west`,
            latitude: centralPoint.point.latitude,
            longitude: centralPoint.point.longitude - 0.001,
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

export const loader = async ({ params }: LoaderFunctionArgs) => {
    const fetchUniqueData = async (slug: string) => {
        const id = slug.split("-")[0];
        const URL = COUNTINGS_DATA + "/" + id;
        try {
            const res = await fetch(URL, {
                cache: "no-cache",
            });
            if (!res.ok) {
                
                return null; // Or throw an error
            }
            const responseJson = await res.json();
            
            return responseJson;
        } catch (error) {
            
            return null; // Or throw an error
        }
    };

    const fetchData = async () => {
        let otherCounts = [];
        let pageCover = null;

        try {
            const dataRes = await fetch(COUNTINGS_SUMMARY_DATA, {
                cache: "no-cache",
            });
            if (!dataRes.ok) {
                console.error(`Error fetching summary data: ${dataRes.status} ${dataRes.statusText}`);
            } else {
                const dataJson = await dataRes.json();
                otherCounts = dataJson.counts || [];
            }
        } catch (error) {
            console.error("Error in fetchData (summary data):", error);
        }

        try {
            const pageDataRes = await fetch(COUNTINGS_PAGE_DATA, { cache: "no-cache" });
            if (!pageDataRes.ok) {
                console.error(`Error fetching page data: ${pageDataRes.status} ${pageDataRes.statusText}`);
            } else {
                pageCover = await pageDataRes.json();
                
            }
        } catch (error) {
            console.error("Error in fetchData (page data):", error);
        }
        return { pageCover, otherCounts };
    };

    const data: CountEdition = await fetchUniqueData(params.slug as string);
    const { pageCover, otherCounts } = await fetchData();

    if (!data) {
        throw new Response("Not Found", { status: 404 });
    }

    return json({ data, pageCover, otherCounts });
};

const Contagem = () => {
    const { data, pageCover, otherCounts } = useLoaderData<typeof loader>();

    let pageData = {
        title: data.name,
        src: pageCover.cover.url,
    };

    const crumb = {
        label: data.name,
        slug: data.slug,
        routes: ["/", "/contagens", data.slug],
        customColor: "bg-ameciclo",
    };
    const pointsData = getPointsData(data) as pointData[];
    const { series, hours } = getChartData(data.sessions);
    const [isMapVisible, setIsMapVisible] = useState(false);

    useEffect(() => {
        setIsMapVisible(true);
    }, []);

    return (
        <main className="flex-auto">
            <Banner />
            <Breadcrumb label="Contagens" slug="/contagens" routes={["/", "/dados"]} />
            <StatisticsBox title={data.name} boxes={CountingStatistic(data)} />
            <section className="container mx-auto grid lg:grid-cols-3 md:grid-cols-1 auto-rows-auto gap-10">
                <div
                    className="bg-green-200 rounded shadow-2xl lg:col-span-2 col-span-3"
                    style={{ minHeight: "400px" }}
                >
                    {!isMapVisible && <p>Carregando mapa...</p>}
                    {isMapVisible && <AmecicloMap pointsData={pointsData} height="400px" />}
                </div>
                <div className="rounded shadow-2xl lg:col-span-1 col-span-3 flex justify-between flex-col">
                    <FlowContainer data={data} />
                </div>
            </section>
            <InfoCards cards={getCountingCards(data.summary)} />
            <HourlyCyclistsChart series={series as Series[]} hours={hours} />
            <CountingComparisionTable
                data={otherCounts.filter((d) => d.id !== data.id)}
                firstSlug={data.slug}
            />
        </main>
    );
};

export default Contagem;
