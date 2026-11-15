import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { Button } from "@ameciclo/ui/components/button";
import { Card } from "@ameciclo/ui/components/card";
import { CountHero } from "~/components/Contagens/CountHero";
import { CountsProfile } from "~/components/Contagens/CountsOverview";
import { OtherCountsTable } from "~/components/Contagens/OtherCountsTable";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { HourlyCyclistsChart } from "~/components/Contagens/HourlyCyclistsChart";
import { MovementDiagram } from "@ameciclo/ui/components/movement-diagram";
import { CompareBar } from "~/components/Contagens/comparison/CompareBar";
import { CompareActions } from "~/components/Contagens/comparison/CompareActions";
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
} from "~/services/counting-details.service";
import { RouteLoading, RouteErrorBoundary } from "~/components/Commom/RouteBoundaries";
import { IntlDateStr, IntlNumber, IntlPercentil } from "~/services/utils";
import { seo } from "~/utils/seo";

const SearchSchema = z.object({ contagem: z.number().int().positive().optional().catch(undefined) });

export const Route = createFileRoute("/dados/contagens/$slug/")({
  validateSearch: SearchSchema,
  loaderDeps: ({ search }) => ({ contagem: search.contagem }),
  loader: async ({ context: { queryClient }, params: { slug }, deps }) => {
    const [page, cover] = await Promise.all([
      queryClient.ensureQueryData(contagemPageQueryOptions(slug, deps.contagem)),
      queryClient.ensureQueryData(contagensCoverQueryOptions()),
      queryClient.ensureQueryData(contagensLocationsQueryOptions()),
    ]);
    if (!page) throw notFound();
    // Links from before slugs named the place by id: send them to the count's own URL.
    if (page.legacy) {
      throw redirect({ to: "/dados/contagens/$slug", params: { slug: page.canonical }, search: {}, statusCode: 301 });
    }
    const { location, selected } = page;
    const facts = [
      `${IntlNumber(selected.total_cyclists)} ciclistas contados em ${IntlDateStr(selected.date)}`,
      `pico de ${IntlNumber(selected.max_hour_cyclists)} em uma hora`,
      selected.total_cyclists > 0 ? `${IntlPercentil(selected.characteristics.women / selected.total_cyclists)} mulheres` : null,
    ];
    return {
      canonical: page.canonical,
      name: location.name,
      summary: `${facts.filter(Boolean).join("; ")}.`,
      cover,
    };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.name;
    return seo({
      title: name ? `Contagem ${name} - Ameciclo` : "Contagem - Ameciclo",
      description: name
        ? `Contagem de ciclistas da Ameciclo em ${name}: ${loaderData?.summary}`
        : "Resultados de contagens de ciclistas realizadas pela Ameciclo na Região Metropolitana do Recife.",
      pathname: `/dados/contagens/${loaderData?.canonical ?? ""}`,
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
    const { data: page } = useSuspenseQuery(contagemPageQueryOptions(slug, contagem));
    const { data: cover } = useSuspenseQuery(contagensCoverQueryOptions());
    const { data: locations } = useSuspenseQuery(contagensLocationsQueryOptions());
    if (!page) throw notFound();
    const { location, selected, detail } = page;

    const flows = Object.fromEntries((detail?.flows ?? []).map((f) => [`${f.from}-${f.to}`, f.value]));
    const hoursLabel = (hours: number[]) => hours.map((h) => `${h}h`).join(", ");

    const pointsData = getPointsData(location, selected);

    return (
        <main className="theme-ameciclo flex-auto text-foreground">
            <Banner image={cover ?? undefined} alt="Capa da contagem" />

            <Breadcrumb
                label={["Contagens", location.name]}
                slug={["/dados/contagens", ""]}
                routes={["/", "/dados"]}
            />

            <CountHero location={location} selected={selected} />

            <section className="border-b bg-muted/60">
                <div className="container mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4">
                    <CountSelector placeSlug={location.slug} counts={location.counts} selectedId={selected.id} />
                    <CompareActions
                        item={{ slug: page.canonical, name: location.name, date: selected.date, variant: selected.variant }}
                        location={location}
                    />
                </div>
            </section>

            {(detail?.estimated || detail?.partial) && (
                <div className="container mx-auto mt-6 px-4">
                    <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                        {detail.estimated
                            ? `Contagem estimada: foram observados apenas os horários ${hoursLabel(detail.observedHours ?? [])}; o restante do dia foi projetado.`
                            : `Contagem parcial: só há dados em ${hoursLabel(detail.observedHours ?? [])}. Os demais horários não foram contados.`}
                    </p>
                </div>
            )}

            <CountsProfile
                cards={getCountingCards(selected)}
                title="Características dos ciclistas"
                description="Participação de cada característica no total de ciclistas desta contagem."
            />

            <section className="container mx-auto grid gap-6 px-4 pb-10 lg:grid-cols-3" aria-label="Local e fluxo">
                <div className="overflow-hidden rounded-xl border shadow-sm lg:col-span-2">
                    {pointsData.length > 0 ? (
                        <AmecicloMap pointsData={pointsData} width="100%" height="clamp(340px, 50vh, 460px)" />
                    ) : (
                        <div className="flex h-72 items-center justify-center">
                            <p className="text-muted-foreground">Local sem coordenadas.</p>
                        </div>
                    )}
                </div>
                <Card className="items-center justify-center gap-3 p-6 lg:col-span-1">
                    <h2 className="text-center text-lg font-bold">Fluxo de ciclistas por direção</h2>
                    {detail && detail.approaches.length <= 4 ? (
                        <>
                            <MovementDiagram topology={detail.topology} approaches={detail.approaches} positions={detail.positions} flows={flows} />
                            {!detail.positions && (
                                <p className="text-center text-xs text-muted-foreground">A posição das aproximações no desenho é ilustrativa.</p>
                            )}
                        </>
                    ) : (
                        <p className="text-center text-sm text-muted-foreground">Não há dados de fluxo para esta contagem.</p>
                    )}
                </Card>
            </section>

            {detail && detail.hours.length > 0 && <HourlyCyclistsChart series={detail.series} hours={detail.hours} />}

            {location.counts.length > 1 && <EvolutionChart counts={location.counts} selectedId={selected.id} />}

            {location.counts.length > 1 && (
                <section className="container mx-auto px-4 pb-10">
                    <Button asChild size="lg">
                        <Link to="/dados/contagens/$slug/evolucao" params={{ slug: location.slug }}>
                            Ver a evolução deste ponto ({location.counts.length} contagens)
                        </Link>
                    </Button>
                </section>
            )}

            <OtherCountsTable
                locations={locations}
                shownSlugs={[page.canonical]}
                firstSlug={page.canonical}
            />
            <CompareBar />
        </main>
    );
}
