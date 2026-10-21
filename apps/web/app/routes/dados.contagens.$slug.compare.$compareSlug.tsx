import { METRICS, type PublicCountDetail, type PublicLocation } from "@ameciclo/db/shared";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import Banner from "~/components/Commom/Banner";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { Tooltip } from "~/components/Commom/Tooltip";
import { CountingComparisionTable } from "~/components/Contagens/CountingComparisionTable";
import { HourlyCyclistsChart } from "~/components/Contagens/HourlyCyclistsChart";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { contagemCompareQueryOptions } from "~/queries/dados.contagens.$slug.compare.$compareSlug";
import { contagensCoverQueryOptions, contagensLocationsQueryOptions } from "~/queries/dados.contagens.$slug";
import { countNote, transformOtherCountsForComparison, type MapPoint } from "~/services/counting-details.service";
import { IntlDateStr, IntlNumber } from "~/services/utils";
import { seo } from "~/utils/seo";

const IdParam = z.coerce.number().int().positive();

const HINTS: Record<string, string> = {
  women: "mulheres ciclistas",
  juveniles: "crianças e adolescentes ciclistas",
  helmet: "ciclistas com capacete de segurança",
  ride: "ciclistas dando carona (uma pessoa leva outra na bicicleta)",
  service: "bicicletas a serviço: cargueiras com água, frutas, mercadorias ou entregadores de app",
  cargo: "bicicletas de carga transportando mercadorias",
  shared_bike: "bicicletas compartilhadas como Bike Itaú, Bike Tem",
  sidewalk: "bicicletas pedalando pela calçada (não inclui quem está andando)",
  wrong_way: "bicicletas que vieram na contramão do trânsito",
};

type Place = { location: PublicLocation; selected: PublicLocation["counts"][number]; detail: PublicCountDetail | null };

function getChartData(places: Place[]) {
  const present = places.flatMap(({ location, detail }) => (detail ? [{ detail, name: location.name }] : []));
  const hours = [...new Set(present.flatMap(({ detail }) => detail.hours))].sort((a, b) => a - b);
  const series = present.map(({ detail, name }) => ({
    name: `${name} (${IntlDateStr(detail.date)})`,
    data: hours.map((h) => {
      const i = detail.hours.indexOf(h);
      return i < 0 ? 0 : (detail.series[0]?.data[i] ?? 0);
    }),
  }));
  return { series, hours };
}

function getPoints(places: Place[]): MapPoint[] {
  const pointColors = ["#008888", "#10b981"];
  return places.flatMap(({ location, selected }, index) =>
    location.latitude === null || location.longitude === null
      ? []
      : [
          {
            key: location.name,
            latitude: location.latitude,
            longitude: location.longitude,
            color: pointColors[index % pointColors.length],
            popup: {
              name: location.name,
              total: selected.total_cyclists,
              date: IntlDateStr(selected.date),
              url: `/dados/contagens/${location.id}`,
              obs: "",
              note: countNote(selected),
            },
            size: Math.round(selected.total_cyclists / 250) + 15,
          },
        ],
  );
}

const percent = (part: number, total: number) => `${((part / (total > 0 ? total : 1)) * 100).toFixed(1)}%`;

export const Route = createFileRoute("/dados/contagens/$slug/compare/$compareSlug")({
  loader: async ({ context: { queryClient }, params }) => {
    const slug = IdParam.safeParse(params.slug);
    const compareSlug = IdParam.safeParse(params.compareSlug);
    if (!slug.success || !compareSlug.success) throw notFound();
    const [places] = await Promise.all([
      queryClient.ensureQueryData(contagemCompareQueryOptions(slug.data, compareSlug.data)),
      queryClient.ensureQueryData(contagensCoverQueryOptions()),
      queryClient.ensureQueryData(contagensLocationsQueryOptions()),
    ]);
    if (!places) throw notFound();
  },
  head: ({ params }) =>
    seo({
      title: "Comparação de Contagens - Ameciclo",
      description:
        "Comparação entre contagens de ciclistas realizadas pela Ameciclo na Região Metropolitana do Recife.",
      pathname: `/dados/contagens/${params.slug}/compare/${params.compareSlug}`,
      noindex: true,
    }),
  component: Compare,
  pendingComponent: () => <RouteLoading label="Carregando comparação..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function Compare() {
  const params = Route.useParams();
  const slug = IdParam.parse(params.slug);
  const compareSlug = IdParam.parse(params.compareSlug);
  const { data: places } = useSuspenseQuery(contagemCompareQueryOptions(slug, compareSlug));
  const { data: cover } = useSuspenseQuery(contagensCoverQueryOptions());
  const { data: locations } = useSuspenseQuery(contagensLocationsQueryOptions());
  if (!places) throw notFound();

  const { series, hours } = getChartData(places);
  const shown = new Set(places.map(({ location }) => location.id));
  const others = transformOtherCountsForComparison(locations, -1).filter((row) => !shown.has(row.id));

  return (
    <main className="flex-auto overflow-x-hidden">
      <Banner image={cover ?? undefined} alt="Comparação de contagens" />

      <div className="bg-ameciclo text-white py-2 px-4 uppercase flex items-center text-sm md:text-base">
        <div className="container mx-auto">
          <nav className="bg-grey-light rounded-sm font-sans w-full">
            <ol className="list-none p-0 inline-flex text-xs md:text-sm">
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
              {places.map(({ location }) => (
                <li key={location.id} className="flex items-center">
                  <Link to="/dados/contagens/$slug" params={{ slug: String(location.id) }} className="text-white">{location.name}</Link>
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
          <p className="text-lg text-gray-600">Análise comparativa dos dados de contagem de ciclistas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {places.map(({ location, selected }, index) => {
            const colors = {
              bg: index === 0 ? "bg-teal-50" : "bg-emerald-50",
              border: index === 0 ? "border-teal-200" : "border-emerald-200",
              text: index === 0 ? "text-teal-700" : "text-emerald-700",
              accent: index === 0 ? "bg-teal-500" : "bg-emerald-500",
            };
            const note = countNote(selected);
            const rows = [
              ...METRICS.filter((m) => m.key !== "motor").map((m) => ({
                key: m.key,
                label: m.label,
                value: selected.characteristics[m.key],
                hint: HINTS[m.key],
              })),
              { key: "peak", label: "Pico em 1h", value: selected.max_hour_cyclists, hint: "maior quantidade de ciclistas registrada em uma única hora" },
            ];

            return (
              <div key={location.id} className={`${colors.bg} ${colors.border} border-2 rounded-lg p-6 shadow-lg`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 ${colors.accent} rounded-full`}></div>
                    <span className="text-sm font-medium text-gray-600">Ponto {index + 1}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {IntlDateStr(selected.date)}
                    {note && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">{note}</span>}
                  </span>
                </div>

                <h2 className={`text-2xl font-bold ${colors.text} mb-6`}>{location.name}</h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-base font-medium text-gray-700">Total de Ciclistas</span>
                    <span className={`text-3xl font-bold ${colors.text}`}>{IntlNumber(selected.total_cyclists)}</span>
                  </div>

                  {rows.map((row) => (
                    <div key={row.key} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <Tooltip text={`${IntlNumber(row.value)} ${row.hint}`}>
                        <span className="text-base font-medium text-gray-700 cursor-help">
                          {row.label} <span className="text-sm text-gray-500">({percent(row.value, selected.total_cyclists)})</span>
                        </span>
                      </Tooltip>
                      <span className={`text-xl font-semibold ${colors.text}`}>{IntlNumber(row.value)}</span>
                    </div>
                  ))}

                  <div className="pt-4">
                    <Link
                      to="/dados/contagens/$slug"
                      params={{ slug: String(location.id) }}
                      search={{ contagem: selected.id }}
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

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <AmecicloMap pointsData={getPoints(places)} height="500px" />
        </div>

        {series.length === 0 || hours.length === 0 ? (
          <section className="container mx-auto my-10 shadow-2xl rounded-sm p-12 bg-gray-50">
            <h2 className="text-gray-800 text-2xl font-bold mb-6">Quantidade de Ciclistas por Hora</h2>
            <p className="text-center text-sm text-gray-500 py-12">Não há dados horários para estas contagens.</p>
          </section>
        ) : (
          <HourlyCyclistsChart series={series} hours={hours} />
        )}

        <CountingComparisionTable data={others} firstSlug={String(slug)} />
      </section>
    </main>
  );
}
