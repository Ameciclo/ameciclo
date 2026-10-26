import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRightLeft,
  Award,
  Bike,
  Building2,
  CheckCircle2,
  Download,
  Filter,
  GitCompareArrows,
  Gauge,
  ListFilter,
  MapPinned,
  Route as RouteIcon,
  Search,
  TimerReset,
  TriangleAlert,
} from "lucide-react";

import { Badge } from "@ameciclo/ui/components/badge";
import { Button } from "@ameciclo/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ameciclo/ui/components/card";
import { Input } from "@ameciclo/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ameciclo/ui/components/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ameciclo/ui/components/table";
import { cn } from "@ameciclo/ui/lib/utils";
import { SegmentsMap } from "~/components/SegmentsMap";
import {
  formatCount,
  formatIndex,
  formatKm,
  formatPercent,
  formatScore,
  getCityIndexMeta,
  getHierarchyBadgeClassName,
  getRatingBadgeClassName,
  getScoreBandMeta,
  getSegmentTypeBadgeClassName,
  normalizeText,
} from "~/lib/public/format";
import { downloadJsonFile } from "~/lib/public/report-downloads";
import {
  buildTypologyStats,
  getComparisonFriendlyTitle,
  getMostCommonTypology,
  getStructureStatusBadgeClassName,
  getStructureStatusLabel,
  getTopAndBottomCriteria,
  PUBLIC_CRITERION_GROUPS,
  type PublicStructureDetail,
} from "~/lib/public/results";
import { manualDownloadUrl } from "~/lib/site-links";
import { cityDetailQueryOptions } from "~/queries/public";

type Search = { compare?: string };

export const Route = createFileRoute("/detalhes-cidades/$cityId/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    compare: typeof search.compare === "string" ? search.compare : undefined,
  }),
  loader: ({ context: { queryClient }, params }) => queryClient.ensureQueryData(cityDetailQueryOptions(params.cityId)),
  component: DetalhesCidades,
});

const STATUS_FILTERS = ["todos", "avaliadas", "pendentes", "validas", "incompativeis"] as const;
type StructureStatusFilter = (typeof STATUS_FILTERS)[number];
const SCORE_FILTERS = ["todos", "altas", "medias", "baixas", "sem-nota"] as const;
type ScoreFilter = (typeof SCORE_FILTERS)[number];
const SORT_OPTIONS = ["nota-desc", "nota-asc", "extensao-desc", "extensao-asc", "nome-asc", "nome-desc"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

const parseStatusFilter = (value: string): StructureStatusFilter => STATUS_FILTERS.find((option) => option === value) ?? "todos";
const parseScoreFilter = (value: string): ScoreFilter => SCORE_FILTERS.find((option) => option === value) ?? "todos";
const parseSortOption = (value: string): SortOption => SORT_OPTIONS.find((option) => option === value) ?? "nota-desc";

const MetricCard = ({
  icon: Icon,
  label,
  value,
    caption,
  tone = "default",
}: {
  icon: typeof Bike;
  label: string;
  value: string;
  caption?: string;
  tone?: "default" | "warm" | "cool" | "alert";
}) => {
  const toneClassName =
    tone === "warm"
      ? "from-[#fce0c4] to-white"
      : tone === "cool"
        ? "from-[#dfeaf5] to-white"
        : tone === "alert"
          ? "from-[#f7d5d0] to-white"
          : "from-white to-white";

  return (
    <Card className={`overflow-hidden rounded-[28px] border-0 shadow-[0_16px_40px_rgba(15,23,42,0.08)]`}>
      <div className={`bg-gradient-to-br ${toneClassName}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-ideciclo-red shadow-sm">
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <CardDescription className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
            {label}
          </CardDescription>
          <CardTitle className="text-3xl text-text-grey">{value}</CardTitle>
        </CardHeader>
        {caption ? (
          <CardContent className="pt-0 text-sm leading-6 text-slate-600">
            {caption}
          </CardContent>
        ) : null}
      </div>
    </Card>
  );
};

const ComparisonStructureCard = ({
  detail,
  cityId,
}: {
  detail: PublicStructureDetail;
  cityId: string;
}) => {
  const topBottom = getTopAndBottomCriteria(detail);

  return (
    <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-2xl leading-tight text-text-grey">
              {getComparisonFriendlyTitle(detail)}
            </CardTitle>
            <CardDescription className="mt-2 text-sm leading-6 text-slate-600">
              {detail.result.lengthKm > 0 ? `${formatKm(detail.result.lengthKm)} km` : "Extensão não informada"} •{" "}
              {detail.result.hierarchyLabel}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={detail.scoreBadgeClassName}>{detail.scoreLabel}</Badge>
            <Badge className={getSegmentTypeBadgeClassName(detail.result.typeLabel)}>
              {detail.result.typeLabel}
            </Badge>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Nota total</div>
            <div className="mt-2 text-2xl font-bold text-text-grey">
              {formatScore(detail.totalScore)}
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</div>
            <Badge className={`mt-2 ${getStructureStatusBadgeClassName(detail.result)}`}>
              {getStructureStatusLabel(detail.result)}
            </Badge>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Detalhamento</div>
            <Button asChild variant="outline" className="mt-2 w-full justify-between rounded-full">
              <Link to="/detalhes-cidades/$cityId/estruturas/$segmentId" params={{ cityId: cityId, segmentId: detail.id }}>
                Ver estrutura
                <ArrowRightLeft className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {detail.sections.map((section) => (
            <div key={section.key} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-text-grey">{section.label}</div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {PUBLIC_CRITERION_GROUPS.find((group) => group.key === section.key)?.description}
                  </p>
                </div>
                <Badge variant="outline">
                  {section.score}/{section.max}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-emerald-50 p-4">
            <div className="text-sm font-semibold text-emerald-900">Pontos fortes</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {topBottom.strengths.length > 0 ? (
                topBottom.strengths.map((criterion) => (
                  <Badge key={criterion.code} className={getRatingBadgeClassName(criterion.rating)}>
                    {criterion.code} • {criterion.label}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-emerald-900/70">Ainda sem destaque consolidado.</span>
              )}
            </div>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4">
            <div className="text-sm font-semibold text-amber-900">Pontos de atenção</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {topBottom.attention.length > 0 ? (
                topBottom.attention.map((criterion) => (
                  <Badge key={criterion.code} className={getRatingBadgeClassName(criterion.rating)}>
                    {criterion.code} • {criterion.label}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-amber-900/70">Nenhum alerta crítico apareceu nesta leitura.</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function DetalhesCidades() {
  const { cityId } = Route.useParams();
  const { compare } = Route.useSearch();
  const { data: detail } = useSuspenseQuery(cityDetailQueryOptions(cityId));
  const structureDetails = detail?.structures ?? [];

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [hierarchyFilter, setHierarchyFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState<StructureStatusFilter>("todos");
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("todos");
  const [sortOption, setSortOption] = useState<SortOption>("nota-desc");

  // A link with ?compare=first,second opens with that pair already chosen.
  const [firstFromLink, secondFromLink] = (compare ?? "").split(",").map((item) => item.trim());
  const linkedFirst = structureDetails.find((item) => item.id === firstFromLink);
  const linkedSecond = structureDetails.find((item) => item.id === secondFromLink);
  const [comparisonType, setComparisonType] = useState(linkedFirst?.result.typeLabel ?? "");
  const [firstComparisonId, setFirstComparisonId] = useState(linkedFirst?.id ?? "");
  const [secondComparisonId, setSecondComparisonId] = useState(
    linkedFirst && linkedSecond && linkedSecond.id !== linkedFirst.id && linkedSecond.result.typeLabel === linkedFirst.result.typeLabel ? linkedSecond.id : "",
  );

  // The two structures must share a typology, so changing it clears them.
  const selectComparisonType = (value: string) => {
    setComparisonType(value);
    setFirstComparisonId("");
    setSecondComparisonId("");
  };

  const mapSegments = structureDetails.map((item) => ({ id: item.id, name: item.segment.name, type: item.segment.type, geometry: item.segment.geometry }));
  const typologyStats = buildTypologyStats(structureDetails);
  const indexMeta = getCityIndexMeta(detail?.index ?? 0);
  const commonTypology = getMostCommonTypology(structureDetails);

  const scored = structureDetails.filter((item) => item.totalScore !== null);
  const bestStructures = [...scored].sort((left, right) => (right.totalScore ?? 0) - (left.totalScore ?? 0)).slice(0, 3);
  const attentionStructures = [...scored].sort((left, right) => (left.totalScore ?? 0) - (right.totalScore ?? 0)).slice(0, 3);

  const structureTypeOptions = [...new Set(structureDetails.map((item) => item.result.typeLabel).filter(Boolean))].sort((left, right) => left.localeCompare(right, "pt-BR"));

  const normalizedSearch = normalizeText(search);
  const filteredStructures = structureDetails
    .filter((item) => {
      const haystack = normalizeText([item.result.displayName, item.segment.name, item.segment.neighborhood, item.result.typeLabel, item.result.hierarchyLabel].filter(Boolean).join(" "));
      const score = item.totalScore;
      return (
        (!normalizedSearch || haystack.includes(normalizedSearch)) &&
        (typeFilter === "todos" || item.result.typeLabel === typeFilter) &&
        (hierarchyFilter === "todos" || item.result.hierarchyLabel === hierarchyFilter) &&
        (statusFilter === "todos" ||
          (statusFilter === "avaliadas" && item.result.evaluated) ||
          (statusFilter === "pendentes" && !item.result.evaluated) ||
          (statusFilter === "validas" && item.result.contributes) ||
          (statusFilter === "incompativeis" && item.result.adequate === false)) &&
        (scoreFilter === "todos" ||
          (scoreFilter === "altas" && (score ?? -1) >= 75) ||
          (scoreFilter === "medias" && (score ?? -1) >= 25 && (score ?? -1) < 75) ||
          (scoreFilter === "baixas" && score !== null && score < 25) ||
          (scoreFilter === "sem-nota" && score === null))
      );
    })
    .sort((left, right) => {
      switch (sortOption) {
        case "nota-asc":
          return (left.totalScore ?? Number.POSITIVE_INFINITY) - (right.totalScore ?? Number.POSITIVE_INFINITY);
        case "extensao-desc":
          return right.result.lengthKm - left.result.lengthKm;
        case "extensao-asc":
          return left.result.lengthKm - right.result.lengthKm;
        case "nome-asc":
          return getComparisonFriendlyTitle(left).localeCompare(getComparisonFriendlyTitle(right), "pt-BR");
        case "nome-desc":
          return getComparisonFriendlyTitle(right).localeCompare(getComparisonFriendlyTitle(left), "pt-BR");
        case "nota-desc":
          return (right.totalScore ?? -1) - (left.totalScore ?? -1);
      }
    });

  const comparisonCandidates = comparisonType
    ? structureDetails
        .filter((item) => item.result.typeLabel === comparisonType)
        .sort((left, right) => getComparisonFriendlyTitle(left).localeCompare(getComparisonFriendlyTitle(right), "pt-BR"))
    : [];
  const firstComparisonDetail = comparisonCandidates.find((item) => item.id === firstComparisonId) ?? null;
  const secondComparisonDetail = comparisonCandidates.find((item) => item.id === secondComparisonId) ?? null;

  const comparisonRows =
    firstComparisonDetail && secondComparisonDetail
      ? PUBLIC_CRITERION_GROUPS.map((group) => ({
          ...group,
          criteria: group.criteria
            .map((code) => ({
              code,
              first: firstComparisonDetail.criteria.find((criterion) => criterion.code === code) ?? null,
              second: secondComparisonDetail.criteria.find((criterion) => criterion.code === code) ?? null,
            }))
            .filter((row) => row.first || row.second),
        })).filter((group) => group.criteria.length > 0)
      : [];

  const handleDownloadCityData = () => {
    if (!detail) return;
    const { city, results, rankingPosition, rankedCount } = detail;
    const slug = city.name.toLowerCase().replace(/\s+/g, "-");
    const describe = (criterion: PublicStructureDetail["criteria"][number]) => ({
      codigo: criterion.code,
      nome: criterion.label,
      conceito: criterion.rating,
      pontos: criterion.points,
      pontos_maximos: criterion.maxPoints,
      descricao_conceito: criterion.scale.find((item) => item.rating === criterion.rating)?.description ?? null,
    });

    downloadJsonFile(
      `dados-${slug}.geojson`,
      {
        type: "FeatureCollection",
        name: `ideciclo-${slug}`,
        metadata: {
          city: { id: city.id, name: city.name, state: city.state },
          summary: {
            ideciclo: detail.index,
            ranking_position: rankingPosition,
            ranked_cities_count: rankedCount,
            total_structures: results.summary.totalStructures,
            evaluated_structures: results.summary.evaluatedStructures,
            total_structure_km: results.summary.totalStructureKm,
            evaluated_structure_km: results.summary.evaluatedStructureKm,
            total_road_km: results.summary.totalRoadKm,
          },
        },
        features: structureDetails.map((item) => ({
          type: "Feature",
          geometry: item.segment.geometry,
          properties: {
            id: item.id,
            nome: getComparisonFriendlyTitle(item),
            tipologia: item.result.typeLabel,
            hierarquia: item.result.hierarchyLabel,
            bairro: item.segment.neighborhood,
            extensao_km: item.result.lengthKm,
            nota_total: item.totalScore,
            conceito: item.scoreLabel,
            status: getStructureStatusLabel(item.result),
            avaliacao_concluida: item.result.evaluated,
            entra_no_indice: item.result.contributes,
            avaliacao_ideciclo: {
              nota_total: item.totalScore,
              conceito_total: item.scoreLabel,
              secoes: item.sections.map((section) => ({
                codigo: section.key,
                nome: section.label,
                pontuacao: section.score,
                pontuacao_maxima: section.max,
                criterios: section.criteria.map(describe),
              })),
              criterios: item.criteria.map(describe),
            },
          },
        })),
      },
      "application/geo+json;charset=utf-8;",
    );
  };

  if (!detail) {
    return (
      <div className="container py-20">
        <Card className="mx-auto max-w-2xl rounded-[28px] border-0 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle className="text-text-grey">Cidade não encontrada</CardTitle>
            <CardDescription>
              Não foi possível localizar os dados públicos dessa cidade no ambiente atual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full bg-ideciclo-red text-white hover:bg-ideciclo-red/90">
              <Link to="/ranking">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao ranking
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { city, results, rankingPosition, rankedCount: rankedCitiesCount } = detail;
  const displayedIndex = detail.index;

  return (
    <div className="pb-20">
      <section
        className="relative overflow-hidden border-b border-slate-200 bg-slate-100"
        style={{ backgroundImage: "url('/pages_covers/ideciclo-navcover.png')" }}
      >
        <div className="absolute inset-0 bg-white/75" />
        <div className="container relative z-10 py-16">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <Link to="/" className="hover:text-ideciclo-red">Início</Link>
            <span>/</span>
            <Link to="/ranking" className="hover:text-ideciclo-red">Ranking</Link>
            <span>/</span>
            <span>Detalhes da cidade</span>
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div>
              <Badge className={indexMeta.badgeClassName}>
                IDECICLO {indexMeta.classification} • {indexMeta.description}
              </Badge>
              <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight text-text-grey md:text-6xl">
                {city.name}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700 md:text-lg">
                Em {city.name}, foram observados {formatKm(results.summary.totalStructureKm)} km de
                infraestrutura cicloviária distribuídos em {formatCount(results.summary.totalStructures)} trechos.
                Desses, {formatCount(results.summary.evaluatedStructures)} já possuem avaliação concluída
                e {formatCount(results.summary.validStructures)} entram hoje no cálculo do índice da cidade.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="rounded-full bg-ideciclo-red text-white hover:bg-ideciclo-red/90">
                  <Link to="/ranking">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar ao ranking
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <a href={manualDownloadUrl} target="_blank" rel="noreferrer">
                    <ListFilter className="h-4 w-4" />
                    Ler manual do IDECICLO
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={handleDownloadCityData}
                >
                  <Download className="h-4 w-4" />
                  Baixar dados
                </Button>
              </div>
            </div>

            <Card className="rounded-[32px] border-0 bg-white/95 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-2xl text-text-grey">Leitura rápida</CardTitle>
                </div>
                <CardDescription>
                  Uma visão direta do que já foi medido e do que hoje pesa mais na leitura pública da cidade.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Posição no ranking</div>
                  <div className="mt-2 text-3xl font-bold text-text-grey">
                    {rankingPosition && rankedCitiesCount > 0
                      ? `#${rankingPosition} de ${rankedCitiesCount}`
                      : "Não ranqueada"}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Malha cicloviária total</div>
                  <div className="mt-2 text-3xl font-bold text-text-grey">{formatKm(results.summary.totalStructureKm)} km</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Tipologia dominante</div>
                  <div className="mt-2 text-lg font-semibold text-text-grey">
                    {commonTypology
                      ? `${commonTypology.label} • ${formatKm(commonTypology.km)} km`
                      : "Sem predominância definida"}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Malha viária total</div>
                  <div className="mt-2 text-lg font-semibold text-text-grey">
                    {formatKm(results.summary.totalRoadKm)} km
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="container -mt-8 space-y-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={Gauge}
            label="Índice IDECICLO"
            value={formatIndex(displayedIndex)}
            caption="Leitura sintética da qualidade cicloviária observada nesta cidade."
            tone="warm"
          />
          <MetricCard
            icon={RouteIcon}
            label="Km avaliados"
            value={`${formatKm(results.summary.evaluatedStructureKm)} km`}
            caption="Trechos que já possuem formulário preenchido e nota calculada."
            tone="cool"
          />
          <MetricCard
            icon={Bike}
            label="Estruturas observadas"
            value={formatCount(results.summary.totalStructures)}
            caption="Trechos cicloviários analisados na leitura pública da cidade."
          />
          <MetricCard
            icon={TriangleAlert}
            label="Trechos incompatíveis"
            value={formatCount(results.summary.incompatibleStructures)}
            caption="Estruturas que hoje não entram no índice por incompatibilidade metodológica."
            tone="alert"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="rounded-[32px] border-0 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl text-text-grey">O que mais se destaca</CardTitle>
                  <CardDescription>
                    Uma síntese para quem quer entender por que a cidade aparece assim hoje.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] bg-[#f8f5ef] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-ideciclo-red">
                  <Award className="h-4 w-4" />
                  Melhor avaliação disponível
                </div>
                {bestStructures[0] ? (
                  <>
                    <p className="mt-3 text-lg font-semibold text-text-grey">
                      {getComparisonFriendlyTitle(bestStructures[0])}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Nota {formatScore(bestStructures[0].totalScore)} • {bestStructures[0].scoreLabel} •{" "}
                      {bestStructures[0].result.typeLabel}
                    </p>
                    <Button asChild variant="outline" className="mt-4 rounded-full">
                      <Link to="/detalhes-cidades/$cityId/estruturas/$segmentId" params={{ cityId: city.id, segmentId: bestStructures[0].id }}>
                        Ver estrutura
                      </Link>
                    </Button>
                  </>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Ainda não há estrutura com nota disponível para ranquear.
                  </p>
                )}
              </div>

              <div className="rounded-[24px] bg-[#f2f7fb] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-ideciclo-blue">
                  <Building2 className="h-4 w-4" />
                  Onde a cidade mais aparece
                </div>
                <p className="mt-3 text-lg font-semibold text-text-grey">
                  {commonTypology
                    ? `${commonTypology.label} é o tipo mais presente`
                    : "Sem predominância clara"}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {commonTypology
                    ? `${formatKm(commonTypology.km)} km em ${formatCount(commonTypology.count)} trechos.`
                    : "Os dados ainda não são suficientes para mostrar um tipo dominante."}
                </p>
              </div>

              <div className="rounded-[24px] bg-[#eff8f2] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Tipos de estrutura na cidade
                </div>
                <p className="mt-3 text-lg font-semibold text-text-grey">
                  {formatCount(typologyStats.length)} tipologias identificadas
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {typologyStats.length > 0
                    ? typologyStats.map((item) => item.label).join(", ")
                    : "Nenhuma tipologia consolidada para esta cidade."}
                </p>
              </div>

              <div className="rounded-[24px] bg-[#fff7e8] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                  <TriangleAlert className="h-4 w-4" />
                  Onde vale investigar primeiro
                </div>
                {attentionStructures[0] ? (
                  <>
                    <p className="mt-3 text-lg font-semibold text-text-grey">
                      {getComparisonFriendlyTitle(attentionStructures[0])}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Nota {formatScore(attentionStructures[0].totalScore)} • {attentionStructures[0].scoreLabel}
                    </p>
                  </>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Ainda não existe estrutura com nota baixa consolidada para destacar.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-0 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl text-text-grey">Tipologias avaliadas</CardTitle>
                  <CardDescription>
                    Quanto da rede observada aparece em cada tipo de infraestrutura.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {typologyStats.length > 0 ? (
                typologyStats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <Badge className={getSegmentTypeBadgeClassName(item.label)}>
                        {item.label}
                      </Badge>
                      <span className="text-sm font-semibold text-text-grey">
                        {formatKm(item.km)} km
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {formatCount(item.count)} trechos, sendo {formatCount(item.evaluated)} com avaliação concluída.
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-slate-600">
                  Nenhuma tipologia foi consolidada para esta cidade.
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {Object.values(results.networks).map((network) => (
            <Card key={network.key} className="rounded-[28px] border-0 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <Badge className={cn("rounded-full px-3 py-1", getHierarchyBadgeClassName(network.key))}>
                    {network.label}
                  </Badge>
                </div>
                <CardTitle className="text-xl text-text-grey">{network.label}</CardTitle>
                <CardDescription>
                  Faixa viária com peso {formatPercent(network.weight * 100)} no cálculo final.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Vias da cidade</div>
                  <div className="mt-2 text-lg font-semibold text-text-grey">{formatKm(network.totalRoadKm)} km</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Infraestrutura observada</div>
                  <div className="mt-2 text-lg font-semibold text-text-grey">{formatKm(network.structureKm)} km</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Trechos válidos</div>
                  <div className="mt-2 text-lg font-semibold text-text-grey">{formatKm(network.adequateKm)} km</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-[32px] border-0 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl text-text-grey">Mapa da cidade</CardTitle>
                  <CardDescription>
                    Visualização dos trechos cicloviários considerados nesta leitura pública.
                  </CardDescription>
                </div>
                <MapPinned className="h-5 w-5 text-ideciclo-red" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-[24px] border border-slate-200">
                <SegmentsMap segments={mapSegments} className="h-96 w-full" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-0 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl text-text-grey">Melhores e piores notas</CardTitle>
                  <CardDescription>
                    Um atalho para as estruturas que mais ajudam ou mais puxam a leitura da cidade.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
              <div>
                <div className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Destaques positivos
                </div>
                <div className="space-y-3">
                  {bestStructures.map((detail) => (
                    <Link
                      key={detail.id}
                      to="/detalhes-cidades/$cityId/estruturas/$segmentId" params={{ cityId: city.id, segmentId: detail.id }}
                      className="block rounded-2xl border border-slate-200 p-4 transition hover:border-ideciclo-teal hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-text-grey">
                            {getComparisonFriendlyTitle(detail)}
                          </div>
                          <div className="mt-1 text-sm text-slate-600">
                            {detail.result.typeLabel} • {formatKm(detail.result.lengthKm)} km
                          </div>
                        </div>
                        <Badge className={detail.scoreBadgeClassName}>
                          {formatScore(detail.totalScore)}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
                  Demandam atenção
                </div>
                <div className="space-y-3">
                  {attentionStructures.map((detail) => (
                    <Link
                      key={detail.id}
                      to="/detalhes-cidades/$cityId/estruturas/$segmentId" params={{ cityId: city.id, segmentId: detail.id }}
                      className="block rounded-2xl border border-slate-200 p-4 transition hover:border-ideciclo-teal hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-text-grey">
                            {getComparisonFriendlyTitle(detail)}
                          </div>
                          <div className="mt-1 text-sm text-slate-600">
                            {detail.result.typeLabel} • {formatKm(detail.result.lengthKm)} km
                          </div>
                        </div>
                        <Badge className={detail.scoreBadgeClassName}>
                          {formatScore(detail.totalScore)}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <Card className="rounded-[32px] border-0 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl text-text-grey">Estruturas avaliadas</CardTitle>
                  <CardDescription>
                    Explore a base com filtros, ordenação e acesso à página individual de cada trecho.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="rounded-full px-4 py-2">
                  {formatCount(filteredStructures.length)} resultados
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                <div className="xl:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Buscar trecho
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className="rounded-full border-slate-200 pl-10"
                      placeholder="Nome, bairro, tipo..."
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Tipologia
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="rounded-full">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      {structureTypeOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Hierarquia
                  </label>
                  <Select value={hierarchyFilter} onValueChange={setHierarchyFilter}>
                    <SelectTrigger className="rounded-full">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      <SelectItem value="Estrutural">Estrutural</SelectItem>
                      <SelectItem value="Alimentadora">Alimentadora</SelectItem>
                      <SelectItem value="Local">Local</SelectItem>
                      <SelectItem value="Sem hierarquia">Sem hierarquia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Situação
                  </label>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(parseStatusFilter(value))}>
                    <SelectTrigger className="rounded-full">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      <SelectItem value="avaliadas">Avaliadas</SelectItem>
                      <SelectItem value="pendentes">Pendentes</SelectItem>
                      <SelectItem value="validas">Entram no índice</SelectItem>
                      <SelectItem value="incompativeis">Incompatíveis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Faixa de nota
                  </label>
                  <Select value={scoreFilter} onValueChange={(value) => setScoreFilter(parseScoreFilter(value))}>
                    <SelectTrigger className="rounded-full">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      <SelectItem value="altas">75 a 100</SelectItem>
                      <SelectItem value="medias">25 a 74,9</SelectItem>
                      <SelectItem value="baixas">0 a 24,9</SelectItem>
                      <SelectItem value="sem-nota">Sem nota</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Ordenar
                  </label>
                  <Select value={sortOption} onValueChange={(value) => setSortOption(parseSortOption(value))}>
                    <SelectTrigger className="rounded-full">
                      <SelectValue placeholder="Nota maior" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nota-desc">Nota maior → menor</SelectItem>
                      <SelectItem value="nota-asc">Nota menor → maior</SelectItem>
                      <SelectItem value="extensao-desc">Extensão maior → menor</SelectItem>
                      <SelectItem value="extensao-asc">Extensão menor → maior</SelectItem>
                      <SelectItem value="nome-asc">Nome A → Z</SelectItem>
                      <SelectItem value="nome-desc">Nome Z → A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-hidden rounded-[24px] border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead>Estrutura</TableHead>
                      <TableHead>Tipologia</TableHead>
                      <TableHead>Hierarquia</TableHead>
                      <TableHead>Situação</TableHead>
                      <TableHead className="text-right">Extensão</TableHead>
                      <TableHead className="text-right">Nota</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStructures.length > 0 ? (
                      filteredStructures.map((detail) => {
                        const scoreMeta = getScoreBandMeta(detail.totalScore);

                        return (
                          <TableRow key={detail.id} className="align-middle">
                            <TableCell>
                              <div className="font-semibold text-text-grey">
                                {getComparisonFriendlyTitle(detail)}
                              </div>
                              {detail.segment.neighborhood ? (
                                <div className="mt-1 text-sm text-slate-500">
                                  {detail.segment.neighborhood}
                                </div>
                              ) : null}
                            </TableCell>
                            <TableCell>
                              <Badge className={getSegmentTypeBadgeClassName(detail.result.typeLabel)}>
                                {detail.result.typeLabel}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getHierarchyBadgeClassName(detail.result.hierarchy?.toString())}>
                                {detail.result.hierarchyLabel}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStructureStatusBadgeClassName(detail.result)}>
                                {getStructureStatusLabel(detail.result)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium text-text-grey">
                              {formatKm(detail.result.lengthKm)} km
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge className={scoreMeta.className}>
                                {formatScore(detail.totalScore)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button asChild variant="outline" className="rounded-full">
                                <Link to="/detalhes-cidades/$cityId/estruturas/$segmentId" params={{ cityId: city.id, segmentId: detail.id }}>
                                  Ver detalhes
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="py-10 text-center text-slate-500">
                          Nenhuma estrutura atende aos filtros atuais.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="comparacao" className="space-y-6">
          <Card className="rounded-[32px] border-0 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl text-text-grey">Comparar estruturas</CardTitle>
                  <CardDescription>
                    Compare duas estruturas da mesma tipologia para entender quais pontos puxam o resultado para cima ou para baixo.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => {
                      setComparisonType("");
                      setFirstComparisonId("");
                      setSecondComparisonId("");
                    }}
                  >
                    <TimerReset className="h-4 w-4" />
                    Limpar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-3">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <Filter className="h-4 w-4" />
                    Tipologia
                  </label>
                  <Select
                    value={comparisonType || "__none__"}
                    onValueChange={(value) => selectComparisonType(value === "__none__" ? "" : value)}
                  >
                    <SelectTrigger className="rounded-full">
                      <SelectValue placeholder="Escolha a tipologia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Escolha a tipologia</SelectItem>
                      {structureTypeOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <GitCompareArrows className="h-4 w-4" />
                    Primeira estrutura
                  </label>
                  <Select
                    value={firstComparisonId || "__none__"}
                    onValueChange={(value) =>
                      setFirstComparisonId(value === "__none__" ? "" : value)
                    }
                    disabled={!comparisonType}
                  >
                    <SelectTrigger className="rounded-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Selecione</SelectItem>
                      {comparisonCandidates
                        .filter((detail) => detail.id !== secondComparisonId)
                        .map((detail) => (
                          <SelectItem key={detail.id} value={detail.id}>
                            {getComparisonFriendlyTitle(detail)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <GitCompareArrows className="h-4 w-4" />
                    Segunda estrutura
                  </label>
                  <Select
                    value={secondComparisonId || "__none__"}
                    onValueChange={(value) =>
                      setSecondComparisonId(value === "__none__" ? "" : value)
                    }
                    disabled={!comparisonType}
                  >
                    <SelectTrigger className="rounded-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Selecione</SelectItem>
                      {comparisonCandidates
                        .filter((detail) => detail.id !== firstComparisonId)
                        .map((detail) => (
                          <SelectItem key={detail.id} value={detail.id}>
                            {getComparisonFriendlyTitle(detail)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {firstComparisonDetail && secondComparisonDetail ? (
                <>
                  <div className="grid gap-6 xl:grid-cols-2">
                    <ComparisonStructureCard detail={firstComparisonDetail} cityId={city.id} />
                    <ComparisonStructureCard detail={secondComparisonDetail} cityId={city.id} />
                  </div>

                  <div className="overflow-hidden rounded-[24px] border border-slate-200">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                          <TableHead>Critério</TableHead>
                          <TableHead>{getComparisonFriendlyTitle(firstComparisonDetail)}</TableHead>
                          <TableHead>{getComparisonFriendlyTitle(secondComparisonDetail)}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {comparisonRows.map((group) => (
                          group.criteria.map((row, index) => (
                            <TableRow key={`${group.key}-${row.code}`}>
                              <TableCell>
                                <div className="flex items-start gap-2">
                                  <div>
                                    {index === 0 ? (
                                      <div className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                        {group.title}
                                      </div>
                                    ) : null}
                                    <div className="font-medium text-text-grey">
                                      {row.code} • {row.first?.label || row.second?.label}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {row.first ? (
                                  <div className="space-y-2">
                                    <Badge className={getRatingBadgeClassName(row.first.rating)}>
                                      {row.first.rating || "-"}
                                      {typeof row.first.points === "number" ? (
                                        <>
                                          <span className="mx-1 opacity-70">·</span>
                                          <span>+ {row.first.points} pts</span>
                                        </>
                                      ) : null}
                                    </Badge>
                                    <p className="text-sm leading-6 text-slate-600">
                                      {row.first.scale.find((item) => item.rating === row.first?.rating)?.description ||
                                        "Sem descrição disponível."}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-sm text-slate-500">Não se aplica</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {row.second ? (
                                  <div className="space-y-2">
                                    <Badge className={getRatingBadgeClassName(row.second.rating)}>
                                      {row.second.rating || "-"}
                                      {typeof row.second.points === "number" ? (
                                        <>
                                          <span className="mx-1 opacity-70">·</span>
                                          <span>+ {row.second.points} pts</span>
                                        </>
                                      ) : null}
                                    </Badge>
                                    <p className="text-sm leading-6 text-slate-600">
                                      {row.second.scale.find((item) => item.rating === row.second?.rating)?.description ||
                                        "Sem descrição disponível."}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-sm text-slate-500">Não se aplica</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                  <ArrowRightLeft className="mx-auto h-10 w-10 text-slate-400" />
                  <p className="mt-4 text-lg font-semibold text-text-grey">
                    {!comparisonType
                      ? "Escolha uma tipologia para iniciar a comparação"
                      : "Escolha duas estruturas para iniciar a comparação"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {!comparisonType
                      ? "A comparação entre estruturas da cidade só fica disponível depois da escolha obrigatória da tipologia."
                      : "Depois disso, veja lado a lado as notas e os principais critérios do manual."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
