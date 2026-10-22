import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { InfoCards } from "~/components/Contagens/InfoCards";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { CountingComparisionTable } from "~/components/Contagens/CountingComparisionTable";
import { HourlyCyclistsChart } from "~/components/Contagens/HourlyCyclistsChart";
import { MovementDiagram } from "@ameciclo/ui/components/movement-diagram";
import { CountSelector } from "~/components/Contagens/CountSelector";
import { EvolutionChart } from "~/components/Contagens/EvolutionChart";
import {
  contagemPageQueryOptions,
  contagensCoverQueryOptions,
  contagensLocationsQueryOptions,
} from "~/queries/dados.contagens.$slug";
import {
  getCountingCards,
  getPointsData,
  getCountingStatistics,
  transformOtherCountsForComparison,
} from "~/services/counting-details.service";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { IntlDateStr, IntlNumber, IntlPercentil } from "~/services/utils";
import { seo } from "~/utils/seo";

const SearchSchema = z.object({ contagem: z.number().int().positive().optional().catch(undefined) });

// A place id that is not a positive integer can never exist.
const parseId = (slug: string) => {
  const id = Number(slug);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const Route = createFileRoute("/dados/contagens/$slug/")({
  validateSearch: SearchSchema,
  loaderDeps: ({ search }) => ({ contagem: search.contagem }),
  loader: async ({ context: { queryClient }, params: { slug }, deps }) => {
    const id = parseId(slug);
    if (id === null) throw notFound();
    const [page, cover] = await Promise.all([
      queryClient.ensureQueryData(contagemPageQueryOptions(id, deps.contagem)),
      queryClient.ensureQueryData(contagensCoverQueryOptions()),
      queryClient.ensureQueryData(contagensLocationsQueryOptions()),
    ]);
    if (!page) throw notFound();
    const { location, selected } = page;
    const facts = [
      `${IntlNumber(selected.total_cyclists)} ciclistas contados em ${IntlDateStr(selected.date)}`,
      `pico de ${IntlNumber(selected.max_hour_cyclists)} em uma hora`,
      selected.total_cyclists > 0 ? `${IntlPercentil(selected.characteristics.women / selected.total_cyclists)} mulheres` : null,
    ];
    return {
      name: location.name,
      summary: `${facts.filter(Boolean).join("; ")}.`,
      cover,
    };
  },
  head: ({ params, loaderData }) => {
    const name = loaderData?.name;
    return seo({
      title: name ? `Contagem ${name} - Ameciclo` : "Contagem - Ameciclo",
      description: name
        ? `Contagem de ciclistas da Ameciclo em ${name}: ${loaderData?.summary}`
        : "Resultados de contagens de ciclistas realizadas pela Ameciclo na Região Metropolitana do Recife.",
      pathname: `/dados/contagens/${params.slug}`,
      image: loaderData?.cover ?? undefined,
      type: "article",
    });
  },
  component: Contagem,
  pendingComponent: () => <RouteLoading label="Carregando contagem..." />,
  pendingMs: 500,
  pendingMinMs: 800,
  errorComponent: RouteErrorBoundary,
});

function Contagem() {
    const { slug } = Route.useParams();
    const { contagem } = Route.useSearch();
    const id = parseId(slug);
    if (id === null) throw notFound();
    const { data: page } = useSuspenseQuery(contagemPageQueryOptions(id, contagem));
    const { data: cover } = useSuspenseQuery(contagensCoverQueryOptions());
    const { data: locations } = useSuspenseQuery(contagensLocationsQueryOptions());
    if (!page) throw notFound();
    const { location, selected, detail } = page;

    const flows = Object.fromEntries((detail?.flows ?? []).map((f) => [`${f.from}-${f.to}`, f.value]));
    const hoursLabel = (hours: number[]) => hours.map((h) => `${h}h`).join(", ");

    const pointsData = getPointsData(location, selected);

    return (
        <main className="flex-auto">
            <Banner image={cover ?? undefined} alt="Capa da contagem" />

            <Breadcrumb
                label={["Contagens", location.name]}
                slug={["/dados/contagens", ""]}
                routes={["/", "/dados"]}
            />

            <StatisticsBox
                title={location.name}
                boxes={getCountingStatistics(selected)}
            />

            <CountSelector locationId={location.id} counts={location.counts} selectedId={selected.id} />

            {detail?.estimated && (
                <p className="container mx-auto my-6 text-center text-sm text-gray-600">
                    Contagem estimada: foram observados apenas os horários {hoursLabel(detail.observedHours ?? [])}; o restante do dia foi projetado.
                </p>
            )}
            {detail?.partial && (
                <p className="container mx-auto my-6 text-center text-sm text-gray-600">
                    Contagem parcial: só há dados em {hoursLabel(detail.observedHours ?? [])}. Os demais horários não foram contados.
                </p>
            )}

            <section className="container mx-auto grid lg:grid-cols-3 md:grid-cols-1 auto-rows-auto gap-10">
                <div className="rounded-sm shadow-2xl lg:col-span-2 col-span-3" style={{ minHeight: "400px" }}>
                    {pointsData.length > 0 ? (
                        <AmecicloMap pointsData={pointsData} height="100%" />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Local sem coordenadas.</p>
                        </div>
                    )}
                </div>
                <div className="rounded-sm shadow-2xl lg:col-span-1 col-span-3 flex flex-col justify-center items-center p-8">
                    <h3 className="text-gray-800 text-xl font-bold mb-4 text-center">Fluxo de Ciclistas por Direção</h3>
                    {detail && detail.approaches.length <= 4 ? (
                        <>
                            <MovementDiagram topology={detail.topology} approaches={detail.approaches} positions={detail.positions} flows={flows} />
                            {!detail.positions && (
                                <p className="text-xs text-gray-500 text-center mt-2">A posição das aproximações no desenho é ilustrativa.</p>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-gray-500 text-center">Não há dados de fluxo para esta contagem.</p>
                    )}
                </div>
            </section>

            <InfoCards cards={getCountingCards(selected)} />

            {detail && detail.hours.length > 0 && <HourlyCyclistsChart series={detail.series} hours={detail.hours} />}

            {location.counts.length > 1 && <EvolutionChart counts={location.counts} selectedId={selected.id} />}

            <CountingComparisionTable
                data={transformOtherCountsForComparison(locations, location.id)}
                firstSlug={String(location.id)}
            />
        </main>
    );
}
