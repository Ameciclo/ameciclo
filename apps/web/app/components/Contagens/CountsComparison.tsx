import { METRICS, type PublicCountDetail, type PublicLocation } from "@ameciclo/db/shared";
import { contagemSlug } from "@ameciclo/db/slug";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import Banner from "~/components/Commom/Banner";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { Tooltip } from "~/components/Commom/Tooltip";
import { Badge } from "@ameciclo/ui/components/badge";
import { Card } from "@ameciclo/ui/components/card";
import { X } from "lucide-react";
import { OtherCountsTable } from "~/components/Contagens/OtherCountsTable";
import { CompareLink } from "~/components/Contagens/comparison/CompareLink";
import { CompareBar } from "~/components/Contagens/comparison/CompareBar";
import { EditSelectionButton } from "~/components/Contagens/comparison/CompareActions";
import { colorAt, MIN_COMPARE, TABLE_FROM } from "~/components/Contagens/comparison/constants";
import { ComparisonHourlyChart } from "~/components/Contagens/comparison/ComparisonHourlyChart";
import { MetricsTable } from "~/components/Contagens/comparison/MetricsTable";
import { compareLabel, deltaAgainst } from "~/components/Contagens/comparison/selection";
import { countNote, type MapPoint } from "~/services/counting-details.service";
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
  // The selection bar only shows here once the user chose to edit this comparison; before that
  // it could show an unrelated selection left over from another page.
  const [editing, setEditing] = useState(false);

  const sameLocation = places.every((p) => p.location.id === places[0].location.id);
  const chartCounts = places.flatMap(({ selected, location, detail }) =>
    detail ? [{ label: compareLabel({ ...selected, name: location.name }), detail }] : [],
  );

  return (
    <main className="theme-ameciclo flex-auto overflow-x-hidden text-foreground">
      <Banner image={cover ?? undefined} alt={title} />

      <div className="bg-ameciclo text-white py-2 px-4 uppercase flex items-center text-sm md:text-base">
        <div className="container mx-auto">
          <nav className="bg-grey-light rounded-sm font-sans w-full">
            <ol className="list-none p-0 inline-flex flex-wrap text-xs md:text-sm">
              <Crumb to="/">Página Inicial</Crumb>
              <Crumb to="/dados">Dados</Crumb>
              <Crumb to="/dados/contagens">Contagens</Crumb>
              {places.filter((p, i) => places.findIndex((q) => q.location.id === p.location.id) === i).map(({ location }) => (
                <li key={location.id} className="flex items-center">
                  <Link to="/dados/contagens/$slug" params={{ slug: location.slug }} className="text-white">{location.name}</Link>
                  <ChevronIcon />
                </li>
              ))}
              <li className="flex items-center">
                <span>{crumb}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <section className="bg-ameciclo-dark text-white" aria-labelledby="titulo-comparacao">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <p className="text-sm font-semibold tracking-[0.2em] text-white/80 uppercase">Contagens de ciclistas</p>
          <h1 id="titulo-comparacao" className="mt-2 text-3xl leading-tight font-bold sm:text-4xl md:text-5xl">
            {title}
          </h1>
          <p className="mt-2 text-white/90">{subtitle}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ul className="flex flex-wrap gap-2" aria-label="Contagens comparadas">
              {places.map(({ location, selected, canonical }, index) => {
                const label = compareLabel({ ...selected, name: location.name });
                return (
                  <li key={canonical} className="flex items-center gap-2 rounded-full bg-white py-1 pr-1 pl-3 text-sm font-medium text-foreground">
                    <span aria-hidden className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: colorAt(index).hex }} />
                    {label}
                    {places.length > MIN_COMPARE ? (
                      <CompareLink
                        slugs={places.filter((p) => p.canonical !== canonical).map((p) => p.canonical)}
                        className="flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        <X className="size-3.5" aria-hidden />
                        <span className="sr-only">Remover {label} da comparação</span>
                      </CompareLink>
                    ) : (
                      <span className="w-2" />
                    )}
                  </li>
                );
              })}
            </ul>
            <EditSelectionButton
              onEdit={() => setEditing(true)}
              items={places.map(({ location, selected, canonical }) => ({ slug: canonical, name: location.name, date: selected.date, variant: selected.variant }))}
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14" aria-labelledby="resumo-comparacao">
        <h2 id="resumo-comparacao" className="mb-6 text-2xl font-bold md:text-3xl">
          Lado a lado
        </h2>
        {places.length >= TABLE_FROM ? (
          <MetricsTable places={places} />
        ) : (
          <div className={`grid grid-cols-1 gap-6 ${places.length >= 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
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
                <Card key={canonical} className="gap-0 border-t-4 p-6" style={{ borderTopColor: colors.hex }}>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <span aria-hidden className="size-3 rounded-full" style={{ backgroundColor: colors.hex }} />
                      {sameLocation ? `Edição ${index + 1}` : `Ponto ${index + 1}`}
                    </span>
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      {IntlDateStr(selected.date)}
                      {note && <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-900">{note}</Badge>}
                    </span>
                  </div>

                  <h3 className="mb-4 text-xl leading-snug font-bold">
                    {location.name}
                    {selected.variant && <span className="block text-base font-semibold text-muted-foreground">{selected.variant}</span>}
                  </h3>

                  <div className="mb-2 flex items-baseline justify-between gap-3 border-b pb-3">
                    <span className="font-medium">Total de ciclistas</span>
                    <span className="text-3xl font-bold tabular-nums">
                      {IntlNumber(selected.total_cyclists)}
                      {index > 0 && (() => {
                        const delta = deltaAgainst(selected.total_cyclists, places[0].selected.total_cyclists);
                        return delta === null ? null : (
                          <span className={`ml-2 text-sm font-semibold ${delta > 0 ? "text-green-700" : delta < 0 ? "text-red-700" : "text-muted-foreground"}`}>
                            {`${percentFormat.format(delta)} vs. 1ª`}
                          </span>
                        );
                      })()}
                    </span>
                  </div>

                  {rows.map((row) => (
                    <div key={row.key} className="flex items-center justify-between gap-3 border-b py-2 last:border-b-0">
                      <Tooltip text={`${IntlNumber(row.value)} ${row.hint}`}>
                        <span className="cursor-help font-medium">
                          {row.label} <span className="text-sm font-normal text-muted-foreground">({percent(row.value, selected.total_cyclists)})</span>
                        </span>
                      </Tooltip>
                      <span className="text-lg font-semibold tabular-nums">{IntlNumber(row.value)}</span>
                    </div>
                  ))}

                  <Link
                    to="/dados/contagens/$slug"
                    params={{ slug: contagemSlug(location.slug, selected) }}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-md border border-primary py-2 text-sm font-medium text-primary hover:bg-accent"
                  >
                    Ver detalhes completos
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="container mx-auto px-4 pb-10" aria-label="Mapa dos locais">
        <div className="overflow-hidden rounded-xl border shadow-sm">
          <AmecicloMap pointsData={getPoints(places)} width="100%" height="clamp(340px, 50vh, 460px)" />
        </div>
      </section>

      {chartCounts.length === 0 ? (
        <section className="container mx-auto px-4 pb-10">
          <div className="rounded-xl border bg-card p-8 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold">Quantidade de ciclistas por hora</h2>
            <p className="py-8 text-center text-sm text-muted-foreground">Não há dados horários para estas contagens.</p>
          </div>
        </section>
      ) : (
        <ComparisonHourlyChart counts={chartCounts} />
      )}

      <OtherCountsTable locations={locations} shownSlugs={places.map(({ canonical }) => canonical)} firstSlug={places[0].canonical} />
      {editing && <CompareBar />}
    </main>
  );
}

function ChevronIcon() {
  return (
    <svg className="mx-3 h-3 w-3 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" aria-hidden>
      <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
    </svg>
  );
}

function Crumb({ to, children }: { to: string; children: string }) {
  return (
    <li className="flex items-center">
      <Link to={to} className="text-white">
        {children}
      </Link>
      <ChevronIcon />
    </li>
  );
}
