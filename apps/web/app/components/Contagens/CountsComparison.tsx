import { METRICS, type PublicCountDetail, type PublicLocation } from "@ameciclo/db/shared";
import { contagemSlug } from "@ameciclo/db/slug";
import { Link } from "@tanstack/react-router";
import Banner from "~/components/Commom/Banner";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { Tooltip } from "~/components/Commom/Tooltip";
import { CountingComparisionTable } from "~/components/Contagens/CountingComparisionTable";
import { CompareBar } from "~/components/Contagens/comparison/CompareBar";
import { EditSelectionButton } from "~/components/Contagens/comparison/CompareActions";
import { colorAt, TABLE_FROM } from "~/components/Contagens/comparison/constants";
import { ComparisonHourlyChart } from "~/components/Contagens/comparison/ComparisonHourlyChart";
import { MetricsTable } from "~/components/Contagens/comparison/MetricsTable";
import { compareLabel, deltaAgainst } from "~/components/Contagens/comparison/selection";
import { countNote, transformOtherCountsForComparison, type MapPoint } from "~/services/counting-details.service";
import { IntlDateStr, IntlNumber } from "~/services/utils";

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

export type Place = { location: PublicLocation; selected: PublicLocation["counts"][number]; detail: PublicCountDetail | null; canonical: string };

// Counts of one place share coordinates: a single marker is enough. It takes the color of
// the place's first count and describes its newest one.
function getPoints(places: Place[]): MapPoint[] {
  const byPlace = new Map<number, { first: number; newest: Place }>();
  places.forEach((place, index) => {
    const known = byPlace.get(place.location.id);
    if (!known) byPlace.set(place.location.id, { first: index, newest: place });
    else if (place.selected.date > known.newest.selected.date) known.newest = place;
  });
  return [...byPlace.values()].flatMap(({ first, newest: { location, selected, canonical } }) =>
    location.latitude === null || location.longitude === null
      ? []
      : [
          {
            key: canonical,
            latitude: location.latitude,
            longitude: location.longitude,
            color: colorAt(first).hex,
            popup: {
              name: location.name,
              total: selected.total_cyclists,
              date: IntlDateStr(selected.date),
              year: selected.date.slice(0, 4),
              url: `/dados/contagens/${contagemSlug(location.slug, selected)}`,
              obs: "",
              note: countNote(selected),
            },
            size: Math.round(selected.total_cyclists / 250) + 15,
          },
        ],
  );
}

const percentFormat = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 0, signDisplay: "exceptZero" });
const percent = (part: number, total: number) => `${((part / (total > 0 ? total : 1)) * 100).toFixed(1)}%`;

type CountsComparisonProps = {
  places: Place[];
  cover: string | null | undefined;
  locations: PublicLocation[];
  title: string;
  subtitle: string;
  crumb: string;
};

// Cards, map, hourly chart and the "compare with others" table for any number of counts.
export function CountsComparison({ places, cover, locations, title, subtitle, crumb }: CountsComparisonProps) {

  const sameLocation = places.every((p) => p.location.id === places[0].location.id);
  const chartCounts = places.flatMap(({ selected, location, detail }) =>
    detail ? [{ label: compareLabel({ ...selected, name: location.name }), detail }] : [],
  );
  const others = transformOtherCountsForComparison(locations, places.map(({ canonical }) => canonical));

  return (
    <main className="flex-auto overflow-x-hidden">
      <Banner image={cover ?? undefined} alt={title} />

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
              {places.filter((p, i) => places.findIndex((q) => q.location.id === p.location.id) === i).map(({ location }) => (
                <li key={location.id} className="flex items-center">
                  <Link to="/dados/contagens/$slug" params={{ slug: location.slug }} className="text-white">{location.name}</Link>
                  <svg className="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                    <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
                    </svg>
                </li>
              ))}
              <li className="flex items-center">
                <span>{crumb}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <section className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
          <p className="text-lg text-gray-600">{subtitle}</p>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          <ul className="flex flex-wrap justify-center gap-2" aria-label="Contagens comparadas">
            {places.map(({ location, selected, canonical }, index) => (
              <li key={canonical} className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-gray-800">
                <span aria-hidden className="h-3 w-3 rounded-full" style={{ backgroundColor: colorAt(index).hex }} />
                {compareLabel({ ...selected, name: location.name })}
              </li>
            ))}
          </ul>
          <EditSelectionButton
            items={places.map(({ location, selected, canonical }) => ({ slug: canonical, name: location.name, date: selected.date, variant: selected.variant }))}
          />
        </div>

        {places.length >= TABLE_FROM ? (
          <MetricsTable places={places} />
        ) : (
        <div className={`grid grid-cols-1 ${places.length >= 3 ? "xl:grid-cols-3 lg:grid-cols-2" : "lg:grid-cols-2"} gap-8 mb-8`}>
          {places.map(({ location, selected, canonical }, index) => {
            const colors = colorAt(index);
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
              <div key={canonical} className={`${colors.bg} ${colors.border} border-2 rounded-lg p-6 shadow-lg`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 ${colors.accent} rounded-full`}></div>
                    <span className="text-sm font-medium text-gray-600">{sameLocation ? `Edição ${index + 1}` : `Ponto ${index + 1}`}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {IntlDateStr(selected.date)}
                    {note && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">{note}</span>}
                  </span>
                </div>

                <h2 className={`text-2xl font-bold ${colors.text} mb-6`}>
                  {location.name}
                  {selected.variant && <span className="block text-lg font-semibold">{selected.variant}</span>}
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-base font-medium text-gray-700">Total de Ciclistas</span>
                    <span className={`text-3xl font-bold ${colors.text}`}>
                      {IntlNumber(selected.total_cyclists)}
                      {index > 0 && (() => {
                        const delta = deltaAgainst(selected.total_cyclists, places[0].selected.total_cyclists);
                        return delta === null ? null : (
                          <span className="ml-2 text-sm font-medium text-gray-600">{`${percentFormat.format(delta)} vs. 1ª`}</span>
                        );
                      })()}
                    </span>
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
                      params={{ slug: contagemSlug(location.slug, selected) }}
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
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <AmecicloMap pointsData={getPoints(places)} height="500px" />
        </div>

        {chartCounts.length === 0 ? (
          <section className="container mx-auto my-10 shadow-2xl rounded-sm p-12 bg-gray-50">
            <h2 className="text-gray-800 text-2xl font-bold mb-6">Quantidade de Ciclistas por Hora</h2>
            <p className="text-center text-sm text-gray-500 py-12">Não há dados horários para estas contagens.</p>
          </section>
        ) : (
          <ComparisonHourlyChart counts={chartCounts} />
        )}

        <CountingComparisionTable data={others} firstSlug={places[0].canonical} />
      </section>
      <CompareBar />
    </main>
  );
}
