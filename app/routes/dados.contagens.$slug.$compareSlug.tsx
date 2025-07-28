import Banner from "~/components/Commom/Banner";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { loader as compareContagensLoader } from "~/loader/compareContagensLoader";
import React from "react";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { HourlyCyclistsChart } from "~/components/Contagens/HourlyCyclistsChart";
import { CountingComparisionTable } from "~/components/Contagens/CountingComparisionTable";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { colors } from "~/components/Charts/FlowChart/FlowContainer";
import { VerticalStatisticsBoxes } from "~/components/Contagens/VerticalStatisticsBoxes";

interface Series {
  name: string | undefined;
  data: number[];
  visible?: boolean;
}

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

const COUNTINGS_SUMMARY_DATA = "http://api.garfo.ameciclo.org/cyclist-counts";
const COUNTINGS_DATA = "http://api.garfo.ameciclo.org/cyclist-counts/edition";
const COUNTINGS_PAGE_DATA = "https://cms.ameciclo.org/contagens";

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
]);

function getChartData(sessions: CountEditionSession[]) {
    const series: Series[] = [];
    const hours: number[] = [];

    Object.values(sessions).forEach((session) => {
        const { start_time, total_cyclists, characteristics } = session;
        const hour = parseInt(start_time.split('T')[1].split(':')[0]);
        hours.push(hour);

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
        data: hours.map((_, i) => Object.values(sessions)[i].total_cyclists),
        visible: true,
    });

    return { series, hours };
}

function getBoxesForCountingComparision(data: CountEdition[]) {
  const boxes = data.map((d) => {
    const { name, summary } = d;
    return {
      title: name,
      value: summary.total_cyclists,
    };
  });
  return boxes;
}

function getPointsDataForComparingCounting(data: CountEdition[]) {
  const points = data.map((d) => {
    const { name, coordinates } = d;
    const [centralPoint] = coordinates;
    return {
      key: name,
      latitude: centralPoint.point.latitude,
      longitude: centralPoint.point.longitude,
      color: colors[0] // You might want to assign different colors for comparison
    };
  });
  return points;
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const fetchUniqueData = async (slug: string) => {
    const id = slug.split("-")[0];
    const URL = COUNTINGS_DATA + "/" + id;
    const res = await fetch(URL, { cache: "no-cache" });
    const responseJson = await res.json();
    return responseJson;
  };

  const fetchData = async () => {
    const dataRes = await fetch(COUNTINGS_SUMMARY_DATA, { cache: "no-cache" });
    const dataJson = await dataRes.json();
    const otherCounts = dataJson.counts;

    const pageDataRes = await fetch(COUNTINGS_PAGE_DATA, { cache: "no-cache" });
    const pageCover = await pageDataRes.json();
    return { pageCover, otherCounts };
  };

  const slugParam = params.slug || "";
  const compareSlugParam = params.compareSlug || "";
  const toCompare = [slugParam].concat(compareSlugParam.split("_COMPARE_")).filter(Boolean);
  const data = await Promise.all(
    toCompare.map(async (d) => {
      const result = await fetchUniqueData(d);
      return result;
    })
  );

  const { pageCover, otherCounts } = await fetchData();

  const boxesLoaderResult = await compareContagensLoader({ params });
  const boxes = (await boxesLoaderResult.json()).boxes;

  return json({ data, pageCover, otherCounts, toCompare, boxes });
};

export default function Compare() {
  const { data, pageCover, otherCounts, toCompare, boxes } = useLoaderData<typeof loader>();

  let pageData = {
    title: "Comparação de contagens",
    src: pageCover.cover.url,
  };

  const crumb = {
    label: "Comparação entre contagens",
    slug: toCompare.join("-"),
    routes: ["/", "/contagens"],
  };

  return (
    <main className="flex-auto">
      <Banner image={pageData.src} alt={pageData.title} />
      <Breadcrumb {...crumb} customColor="bg-ameciclo" />
      <VerticalStatisticsBoxes
        title={"Comparação entre as contagens"}
        boxes={boxes.map((box: any) => ({ ...box, date: box.date }))}
      />
    </main>
  );
}