import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
  VIAS_INSEGURAS_SUMMARY,
  VIAS_INSEGURAS_TOP,
  VIAS_INSEGURAS_MAP,
} from "../servers";
import { cmsFetch } from "~/services/cmsFetch";
import { makeApiErrorTracker } from "~/services/apiTracking";

const getPeriodFromRaw = (raw: any): { inicio: string; fim: string } => {
  const years = raw.accidents_per_year
    ? Object.keys(raw.accidents_per_year).sort()
    : [];
  return {
    inicio: years[0] || raw.period?.start_year?.toString() || "",
    fim: years[years.length - 1] || raw.period?.end_year?.toString() || "",
  };
};

const getMostDangerousYear = (raw: any): { ano: string; total: number } | null => {
  if (!raw.accidents_per_year) return null;
  let maxYear = "";
  let maxTotal = 0;
  for (const [year, total] of Object.entries(raw.accidents_per_year)) {
    if (Number(total) > maxTotal) {
      maxTotal = Number(total);
      maxYear = year;
    }
  }
  return maxYear ? { ano: maxYear, total: maxTotal } : null;
};

const fetchViasInseguras = createServerFn().handler(async () => {
  const tracker = makeApiErrorTracker();

  const [summaryDataRaw, topViasDataRaw, mapDataRaw] = await Promise.all([
    cmsFetch<any>(VIAS_INSEGURAS_SUMMARY, {
      ttl: 300,
      timeout: 5000,
      onError: tracker.at(VIAS_INSEGURAS_SUMMARY),
    }),
    cmsFetch<any>(VIAS_INSEGURAS_TOP, {
      ttl: 300,
      timeout: 5000,
      onError: tracker.at(VIAS_INSEGURAS_TOP),
    }),
    cmsFetch<any>(VIAS_INSEGURAS_MAP, {
      ttl: 300,
      timeout: 5000,
      onError: tracker.at(VIAS_INSEGURAS_MAP),
    }),
  ]);

  const period = getPeriodFromRaw(summaryDataRaw);
  const mostDangerousYear = getMostDangerousYear(summaryDataRaw);

  const summaryData = {
    totalSinistros: summaryDataRaw.total_accidents,
    totalVias: Number(summaryDataRaw.total_streets),
    extensaoTotalKm: summaryDataRaw.extensaoTotalKm,
    periodoInicio: period.inicio,
    periodoFim: period.fim,
    viaMaisPerigosa: {
      nome: summaryDataRaw.most_dangerous_street?.name,
      total: summaryDataRaw.most_dangerous_street?.total_accidents,
      percentual: summaryDataRaw.total_accidents
        ? ((summaryDataRaw.most_dangerous_street?.total_accidents || 0) /
            summaryDataRaw.total_accidents) *
          100
        : 0,
    },
  };

  const concentrationMap = new Map(
    (topViasDataRaw.concentration_data || []).map((item: any) => [
      item.ranking,
      {
        ranking: item.ranking,
        total_accidents: item.total_accidents,
        length_km: item.street_extension_km,
      },
    ])
  );

  const viasCompletas = (mapDataRaw.features || []).map((feature: any) => {
    const ranking = feature.properties.ranking;
    const concentrationData: any = concentrationMap.get(ranking) || {};

    return {
      ranking,
      street_name: feature.properties.street_name,
      total_accidents:
        feature.properties.accidents_count ||
        concentrationData.total_accidents ||
        0,
      length_km:
        feature.properties.extension_km || concentrationData.length_km || 0,
      accidents_per_km: feature.properties.extension_km
        ? feature.properties.accidents_count /
          feature.properties.extension_km
        : 0,
      percentage: summaryData.totalSinistros
        ? ((feature.properties.accidents_count || 0) /
            summaryData.totalSinistros) *
          100
        : 0,
      geometry: feature.geometry,
    };
  });

  let accumulatedAccidents = 0;
  let accumulatedKm = 0;

  const topViasData = {
    dados: viasCompletas.map((via: any) => {
      accumulatedAccidents += via.total_accidents;
      accumulatedKm += via.length_km;

      return {
        top: via.ranking,
        nome: via.street_name,
        sinistros: via.total_accidents,
        sinistros_acum: accumulatedAccidents,
        km: via.length_km,
        km_acum: accumulatedKm,
        sinistros_por_km: via.accidents_per_km,
        sinistros_por_km_acum:
          accumulatedKm > 0 ? accumulatedAccidents / accumulatedKm : 0,
        percentual: via.percentage,
        percentual_acum:
          (accumulatedAccidents / summaryData.totalSinistros) * 100,
      };
    }),
    parametros: {
      intervalo: 500,
      periodo: [period.inicio, period.fim].filter(Boolean).join("-"),
      total_sinistros: summaryData.totalSinistros,
      limite: 500,
    },
  };

  const mapData = {
    vias: viasCompletas.map((via: any, index: number) => ({
      id: index + 1,
      nome: via.street_name,
      top: via.ranking,
      sinistros: via.total_accidents,
      km: via.length_km,
      sinistros_por_km: via.accidents_per_km,
      percentual: via.percentage,
      geometria: via.geometry,
    })),
  };

  const statisticsBoxes = [
    {
      title: "Total de sinistros",
      value: summaryData.totalSinistros?.toLocaleString("pt-BR"),
      unit: [period.inicio, period.fim].filter(Boolean).join(" - "),
    },
    ...(mostDangerousYear
      ? [
          {
            title: "Ano mais perigoso",
            value: mostDangerousYear.ano,
            unit: `${mostDangerousYear.total.toLocaleString("pt-BR")} sinistros`,
          },
        ]
      : []),
    {
      title: "Vias identificadas",
      value: summaryData.totalVias?.toLocaleString("pt-BR"),
      unit: "vias analisadas",
    },
    ...(summaryData.viaMaisPerigosa?.nome
      ? [
          {
            title: "Via com mais sinistros",
            value: summaryData.viaMaisPerigosa.percentual
              ? `${summaryData.viaMaisPerigosa.percentual.toFixed(2)}%`
              : `${summaryData.viaMaisPerigosa.total}`,
            unit: summaryData.viaMaisPerigosa.nome,
          },
        ]
      : []),
  ];

  return {
    summaryData,
    topViasData,
    mapData,
    statisticsBoxes,
    ...tracker.summary(),
  };
});

const fetchAvailableYears = createServerFn().handler(async () => {
  const raw = await cmsFetch<any>(VIAS_INSEGURAS_SUMMARY, {
    ttl: 600,
    timeout: 5000,
  });
  const years = raw.accidents_per_year
    ? Object.keys(raw.accidents_per_year).sort()
    : [];
  return years;
});

const appendYearParams = (url: string, start_year?: string, end_year?: string) => {
  if (!start_year && !end_year) return url;
  const params: string[] = [];
  if (start_year) params.push(`start_year=${start_year}`);
  if (end_year) params.push(`end_year=${end_year}`);
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${params.join("&")}`;
};

const fetchRankingTableData = createServerFn()
  .inputValidator((input: { start_year?: string; end_year?: string }) => input)
  .handler(async ({ data }) => {
    const { start_year, end_year } = data;

    const concRaw = await cmsFetch<any>(
      appendYearParams(`${VIAS_INSEGURAS_TOP}`, start_year, end_year),
      { ttl: 300, timeout: 5000, fallback: null }
    );

    const mapRaw = await cmsFetch<any>(
      appendYearParams(`${VIAS_INSEGURAS_MAP}`, start_year, end_year),
      { ttl: 300, timeout: 5000, fallback: null }
    );

    const concData = concRaw?.concentration_data || [];
    const features = mapRaw?.features || [];

    const totalSinistros = concData.reduce(
      (sum: number, c: any) => sum + (c.total_accidents || 0),
      0
    );

    const streetNames = new Map(
      features.map((f: any) => [f.properties.ranking, f.properties.street_name])
    );

    const dados = concData.map((c: any) => ({
      top: c.ranking,
      nome: streetNames.get(c.ranking),
      sinistros: c.total_accidents || 0,
      km: c.street_extension_km || 0,
      sinistros_por_km:
        c.street_extension_km
          ? (c.total_accidents || 0) / c.street_extension_km
          : 0,
      percentual_total: totalSinistros
        ? ((c.total_accidents || 0) / totalSinistros) * 100
        : 0,
    }));

    return {
      dados,
      totalSinistros,
      periodo: [start_year, end_year].filter(Boolean).join(" - "),
    };
  });

export { fetchAvailableYears, fetchRankingTableData };

export const viasInsegurasQueryOptions = () =>
  queryOptions({
    queryKey: ["dados", "vias-inseguras"],
    queryFn: () => fetchViasInseguras(),
  });

export const viasInsegurasAvailableYearsQueryOptions = () =>
  queryOptions({
    queryKey: ["dados", "vias-inseguras", "available-years"],
    queryFn: () => fetchAvailableYears(),
    staleTime: 10 * 60 * 1000,
  });

export const viasInsegurasRankingTableQueryOptions = (
  startYear: string,
  endYear: string,
) =>
  queryOptions({
    queryKey: ["dados", "vias-inseguras", "ranking-table", startYear, endYear],
    queryFn: () =>
      fetchRankingTableData({ data: { start_year: startYear, end_year: endYear } }),
    staleTime: 5 * 60 * 1000,
  });
