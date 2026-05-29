import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import Banner from "~/components/Commom/Banner";
import React from "react";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { CountingComparisionTable } from "~/components/Contagens/CountingComparisionTable";
import { HourlyCyclistsChart } from "~/components/Contagens/HourlyCyclistsChart";
import { RadarChart } from "~/components/Charts/RadarChart";
import { Tooltip } from "~/components/Commom/Tooltip";
import { contagemCompareQueryOptions } from "~/queries/dados.contagens.compare.$slugs";
import { transformOtherCountsForComparison } from "~/services/counting-details.service";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { seo } from "~/utils/seo";

const POINT_COLORS = [
  "#14b8a6", "#ef4444", "#6366f1", "#eab308", "#a855f7",
  "#06b6d4", "#ec4899", "#f97316", "#3b82f6", "#f43f5e",
];

const CHART_COLORS = [
  "#14b8a6", "#ef4444", "#6366f1", "#eab308", "#a855f7",
  "#06b6d4", "#ec4899", "#f97316", "#3b82f6", "#f43f5e",
];

const BOX_PALETTE = [
  { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", accent: "bg-teal-500" },
  { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", accent: "bg-red-500" },
  { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", accent: "bg-indigo-500" },
  { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", accent: "bg-yellow-500" },
  { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", accent: "bg-purple-500" },
  { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", accent: "bg-cyan-500" },
  { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", accent: "bg-pink-500" },
  { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", accent: "bg-orange-500" },
  { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", accent: "bg-blue-500" },
  { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", accent: "bg-rose-500" },
];

const CATEGORIES = [
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

function getPointsData(locations: any[]) {
  return locations
    .map((location, index) => {
      const count = location.selectedCount || {};
      const lat = parseFloat(location.latitude);
      const lng = parseFloat(location.longitude);
      if (isNaN(lat) || isNaN(lng)) return null;
      return {
        key: location.name,
        latitude: lat,
        longitude: lng,
        color: POINT_COLORS[index % POINT_COLORS.length],
        popup: {
          name: location.name,
          total: count.total_cyclists || 0,
          date: count.date ? new Intl.DateTimeFormat("pt-BR").format(new Date(count.date)) : "",
          obs: "",
        },
        size: Math.round((count.total_cyclists || 0) / 250) + 15,
        type: "Contagem",
      };
    })
    .filter(Boolean);
}

function StatRow({ label, value, pct, total, textClass, tooltip }: {
  label: string; value: number; pct: number; total: number;
  textClass: string; tooltip: string;
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-200">
      <Tooltip text={tooltip}>
        <span className="text-base font-medium text-gray-700 cursor-help">
          {label} <span className="text-sm text-gray-500">({pct.toFixed(1)}%)</span>
        </span>
      </Tooltip>
      <Tooltip text={`${value.toLocaleString("pt-BR")} ${tooltip.toLowerCase()}`}>
        <span className={`text-xl font-semibold ${textClass} cursor-help`}>
          {value.toLocaleString("pt-BR")}
        </span>
      </Tooltip>
    </div>
  );
}

export const Route = createFileRoute("/dados/contagens/compare/$slugs")({
  loader: ({ context: { queryClient }, params: { slugs } }) =>
    queryClient.ensureQueryData(contagemCompareQueryOptions(slugs)),
  head: () =>
    seo({
      title: "Comparação de Contagens - Ameciclo",
      description:
        "Comparação entre contagens de ciclistas realizadas pela Ameciclo na Região Metropolitana do Recife.",
      pathname: "/dados/contagens/compare",
      noindex: true,
    }),
  component: Compare,
  pendingComponent: () => <RouteLoading label="Carregando comparação..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function Compare() {
  const { slugs } = Route.useParams();
  const { data: loaderData } = useSuspenseQuery(contagemCompareQueryOptions(slugs));
  const slugList = slugs.split("&").filter(Boolean);
  const data = loaderData.data;
  const pageData = loaderData.pageData;
  const boxes = loaderData.boxes.boxes;
  const sessionsBySlug = loaderData.sessionsBySlug || [];
  const pointsData = getPointsData(data);

  const [selectedCategory, setSelectedCategory] = React.useState("total_cyclists");

  const allHoursSet = new Set<number>();
  sessionsBySlug.forEach((entry: any) => {
    entry.sessions.forEach((s: any) => {
      const match = s.session_label?.match(/^(\d+)/);
      if (match) allHoursSet.add(parseInt(match[1]));
    });
  });
  const chartHours = Array.from(allHoursSet).sort((a, b) => a - b);

  const chartSeries = sessionsBySlug.map((entry: any, i: number) => {
    const cat = CATEGORIES.find((c) => c.key === selectedCategory)!;
    const date = data[i]?.selectedCount?.date || "";
    const year = date ? date.slice(0, 4) : "";
    return {
      name: `${data[i]?.name || `Contagem ${i + 1}`}${year ? ` (${year})` : ""}`,
      data: chartHours.map((h) => {
        const session = entry.sessions.find((s: any) => {
          const match = s.session_label?.match(/^(\d+)/);
          return match && parseInt(match[1]) === h;
        });
        if (!session) return 0;
        return cat.field === "total_cyclists"
          ? session.total_cyclists || 0
          : session.characteristics?.[cat.key] || 0;
      }),
      color: CHART_COLORS[i % CHART_COLORS.length],
    };
  });

  return (
    <main className="flex-auto overflow-x-hidden">
      <Banner image={pageData.pageCover?.cover?.url} alt="Comparação de contagens" />

      <div className="bg-ameciclo text-white py-2 px-4 uppercase flex items-center text-sm md:text-base">
        <div className="container mx-auto">
          <nav className="bg-grey-light rounded-sm font-sans w-full">
            <ol className="list-none p-0 inline-flex text-xs md:text-sm flex-wrap">
              <li className="flex items-center">
                <Link to="/" className="text-white">Página Inicial</Link>
                <svg className="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                  <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
                </svg>
              </li>
              <li className="flex items-center">
                <Link to="/dados" className="text-white">Dados</Link>
                <svg className="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                  <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
                </svg>
              </li>
              <li className="flex items-center">
                <Link to="/dados/contagens" className="text-white">Contagens</Link>
                <svg className="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                  <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
                </svg>
              </li>
              {data.map((location: any, index: number) => (
                <li key={index} className="flex items-center">
                  <Link to="/dados/contagens/$slug" params={{ slug: slugList[index] }} className="text-white">
                    {location?.name || `Contagem ${index + 1}`}
                  </Link>
                  <svg className="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                    <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
                  </svg>
                </li>
              ))}
              <li className="flex items-center">
                <span>Comparação</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <section className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Comparação entre Contagens</h1>
          <p className="text-lg text-gray-600">
            {data.length} {data.length === 1 ? "contagem" : "contagens"} selecionada{data.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className={`grid grid-cols-1 ${data.length >= 3 ? 'xl:grid-cols-3' : 'lg:grid-cols-2'} gap-8 mb-8`}>
          {boxes.map((box: any, index: number) => {
            const location = data[index];
            const colors = BOX_PALETTE[index % BOX_PALETTE.length];

            return (
              <div key={index} className={`${colors.bg} ${colors.border} border-2 rounded-lg p-6 shadow-lg`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 ${colors.accent} rounded-full`}></div>
                    <span className="text-sm font-medium text-gray-600">{location?.name || `Ponto ${index + 1}`}</span>
                  </div>
                  <span className="text-sm text-gray-500">{box.date ? new Intl.DateTimeFormat("pt-BR").format(new Date(box.date)) : ""}</span>
                </div>

                <h2 className={`text-2xl font-bold ${colors.text} mb-6`}>{box.titulo}</h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <Tooltip text="Total geral de ciclistas contabilizados">
                      <span className="text-base font-medium text-gray-700 cursor-help">Total de Ciclistas</span>
                    </Tooltip>
                    <Tooltip text={`${box.value.toLocaleString("pt-BR")} ciclistas no total`}>
                      <span className={`text-3xl font-bold ${colors.text} cursor-help`}>
                        {box.value.toLocaleString("pt-BR")}
                      </span>
                    </Tooltip>
                  </div>

                  {location?.selectedCount && (
                    <>
                      <StatRow
                        label="Mulheres"
                        value={location.selectedCount.characteristics?.women || 0}
                        pct={((location.selectedCount.characteristics?.women || 0) / (location.selectedCount.total_cyclists || 1)) * 100}
                        total={location.selectedCount.total_cyclists}
                        textClass={colors.text}
                        tooltip="Quantidade de mulheres ciclistas"
                      />
                      <StatRow
                        label="Com Capacete"
                        value={location.selectedCount.characteristics?.helmet || 0}
                        pct={((location.selectedCount.characteristics?.helmet || 0) / (location.selectedCount.total_cyclists || 1)) * 100}
                        total={location.selectedCount.total_cyclists}
                        textClass={colors.text}
                        tooltip="Ciclistas usando capacete de segurança"
                      />
                      <StatRow
                        label="Carona"
                        value={location.selectedCount.characteristics?.ride || 0}
                        pct={((location.selectedCount.characteristics?.ride || 0) / (location.selectedCount.total_cyclists || 1)) * 100}
                        total={location.selectedCount.total_cyclists}
                        textClass={colors.text}
                        tooltip="Ciclistas levando carona (uma pessoa leva outra na bicicleta)"
                      />
                      <StatRow
                        label="Serviço"
                        value={location.selectedCount.characteristics?.service || 0}
                        pct={((location.selectedCount.characteristics?.service || 0) / (location.selectedCount.total_cyclists || 1)) * 100}
                        total={location.selectedCount.total_cyclists}
                        textClass={colors.text}
                        tooltip="Bicicletas a serviço: cargueiras com água, frutas, mercadorias ou entregadores de app"
                      />
                      <StatRow
                        label="Carga"
                        value={location.selectedCount.characteristics?.cargo || 0}
                        pct={((location.selectedCount.characteristics?.cargo || 0) / (location.selectedCount.total_cyclists || 1)) * 100}
                        total={location.selectedCount.total_cyclists}
                        textClass={colors.text}
                        tooltip="Bicicletas de carga transportando mercadorias"
                      />
                      <StatRow
                        label="Compartilhada"
                        value={location.selectedCount.characteristics?.shared_bike || 0}
                        pct={((location.selectedCount.characteristics?.shared_bike || 0) / (location.selectedCount.total_cyclists || 1)) * 100}
                        total={location.selectedCount.total_cyclists}
                        textClass={colors.text}
                        tooltip="Bicicletas compartilhadas como Bike Itaú, Bike Tem"
                      />
                      <StatRow
                        label="Calçada"
                        value={location.selectedCount.characteristics?.sidewalk || 0}
                        pct={((location.selectedCount.characteristics?.sidewalk || 0) / (location.selectedCount.total_cyclists || 1)) * 100}
                        total={location.selectedCount.total_cyclists}
                        textClass={colors.text}
                        tooltip="Bicicletas pedalando pela calçada"
                      />
                      <StatRow
                        label="Contramão"
                        value={location.selectedCount.characteristics?.wrong_way || 0}
                        pct={((location.selectedCount.characteristics?.wrong_way || 0) / (location.selectedCount.total_cyclists || 1)) * 100}
                        total={location.selectedCount.total_cyclists}
                        textClass={colors.text}
                        tooltip="Bicicletas que vieram na contramão do trânsito"
                      />
                      <div className="flex justify-between items-center py-2">
                        <Tooltip text="Maior quantidade de ciclistas registrada em uma única hora">
                          <span className="text-base font-medium text-gray-700 cursor-help">
                            Pico em 1h <span className="text-sm text-gray-500">({(((location.selectedCount.max_hour_cyclists || 0) / (location.selectedCount.total_cyclists || 1)) * 100).toFixed(1)}%)</span>
                          </span>
                        </Tooltip>
                        <Tooltip text={`${(location.selectedCount.max_hour_cyclists || 0).toLocaleString("pt-BR")} ciclistas no pico de uma hora`}>
                          <span className={`text-xl font-semibold ${colors.text} cursor-help`}>
                            {(location.selectedCount.max_hour_cyclists || 0).toLocaleString("pt-BR")}
                          </span>
                        </Tooltip>
                      </div>
                    </>
                  )}

                  <div className="pt-4">
                    <Link
                      to="/dados/contagens/$slug"
                      params={{ slug: slugList[index] || "" }}
                      className={`inline-block w-full text-center py-3 px-4 ${colors.accent} text-white rounded-md hover:opacity-90 transition-opacity font-medium`}
                    >
                      Ver Detalhes Completos
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {data.length >= 2 && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <AmecicloMap pointsData={pointsData} height="500px" />
          </div>
        )}

        {sessionsBySlug.length > 0 && sessionsBySlug.some((e: any) => e.sessions.length > 0) && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Quantidade de ciclistas por hora</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat.key
                      ? "bg-ameciclo text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <HourlyCyclistsChart
              series={chartSeries as any}
              hours={chartHours}
              colors={CHART_COLORS}
            />
          </section>
        )}

        {(() => {
          const rawDetails = loaderData.rawDetails || [];
          if (rawDetails.length < 2) return null;

          const FLOW_ORIGIN_DIRS = [
            "north_south", "north_east",
            "east_north", "east_west", "east_south",
            "south_east", "south_north", "south_west",
            "west_south", "west_east", "west_north",
            "north_west",
          ];
          const DESTIN_MAP: Record<string, string[]> = {
            north: ["south_north", "east_north", "west_north"],
            east: ["north_east", "south_east", "west_east"],
            south: ["north_south", "east_south", "west_south"],
            west: ["north_west", "south_west", "east_west"],
          };
          const FLOW_DESTIN_DIRS = ["north", "east", "south", "west"];
          const ORIGIN_LABELS = [
            "N→S", "N→L", "L→N", "L→O", "L→S",
            "S→L", "S→N", "S→O", "O→S", "O→L", "O→N", "N→O",
          ];
          const DESTIN_LABELS = ["Norte", "Leste", "Sul", "Oeste"];

          function brtHour(utcStr: string): number {
            return (new Date(utcStr).getUTCHours() - 3 + 24) % 24;
          }

          const allHours = new Set<number>();
          rawDetails.forEach((d) => {
            Object.values(d.sessions as Record<string, any>).forEach((s: any) => {
              if (s.start_time) allHours.add(brtHour(s.start_time));
            });
          });
          const sortedHours = Array.from(allHours).sort((a, b) => a - b);

          const [hourStart, setHourStart] = React.useState<number | null>(null);
          const [hourEnd, setHourEnd] = React.useState<number | null>(null);
          const [showPercent, setShowPercent] = React.useState(false);

          function handleHourClick(h: number) {
            if (hourStart == null) {
              setHourStart(h);
            } else if (hourEnd == null) {
              setHourEnd(h);
            } else {
              setHourStart(h);
              setHourEnd(null);
            }
          }

          function isHourSelected(h: number) {
            if (hourStart == null) return false;
            if (hourEnd == null) return h === hourStart;
            const lo = Math.min(hourStart, hourEnd);
            const hi = Math.max(hourStart, hourEnd);
            return h >= lo && h <= hi;
          }

          function buildSeries(dirs: string[], destMode: boolean) {
            const filterFn = (s: any) => {
              if (hourStart == null) return true;
              const h = s.start_time ? brtHour(s.start_time) : -1;
              if (hourEnd == null) return h === hourStart;
              const lo = Math.min(hourStart, hourEnd);
              const hi = Math.max(hourStart, hourEnd);
              return h >= lo && h <= hi;
            };
            return rawDetails.map((d) => {
              const agg: Record<string, number> = {};
              for (const dir of dirs) agg[dir] = 0;
              for (const s of Object.values(d.sessions) as any[]) {
                if (!filterFn(s) || !s.quantitative) continue;
                if (destMode) {
                  for (const dir of dirs) {
                    for (const src of DESTIN_MAP[dir]) {
                      agg[dir] += s.quantitative[src] || 0;
                    }
                  }
                } else {
                  for (const dir of dirs) {
                    agg[dir] += s.quantitative[dir] || 0;
                  }
                }
              }
              const values = dirs.map((dir) => agg[dir]);
              if (showPercent) {
                const total = values.reduce((a, b) => a + b, 0) || 1;
                return { name: d.name, data: values.map((v) => (v / total) * 100) };
              }
              return { name: d.name, data: values };
            });
          }

          const flowRadarOrigin = buildSeries(FLOW_ORIGIN_DIRS, false);
          const flowRadarDestin = buildSeries(FLOW_DESTIN_DIRS, true);

          return (
            <section className="mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-sm font-medium text-gray-600 mr-2">Hora:</span>
                {sortedHours.map((h) => (
                  <button
                    key={h}
                    onClick={() => handleHourClick(h)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      isHourSelected(h)
                        ? "bg-ameciclo text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {String(h).padStart(2, "0")}h
                  </button>
                ))}
                <span className="w-2" />
                <button
                  onClick={() => setShowPercent(!showPercent)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    showPercent ? "bg-ameciclo text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  %
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <RadarChart
                    series={flowRadarOrigin}
                    categories={ORIGIN_LABELS}
                    title="Fluxo por Origem"
                    subtitle={showPercent ? "Percentual de ciclistas por direção de origem" : "De onde os ciclistas estão saindo"}
                  />
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <RadarChart
                    series={flowRadarDestin}
                    categories={DESTIN_LABELS}
                    title="Fluxo por Destino"
                    subtitle={showPercent ? "Percentual de ciclistas por destino" : "Para onde os ciclistas estão indo"}
                  />
                </div>
              </div>
            </section>
          );
        })()}

        {(() => {
          const allCounts = transformOtherCountsForComparison(pageData.otherCounts || [], 0);
          return slugList.length > 0 ? (
            <CountingComparisionTable
              data={allCounts}
              compareSlugs={slugList}
            />
          ) : null;
        })()}
      </section>
    </main>
  );
}
