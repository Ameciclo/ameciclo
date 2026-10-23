// Turns the cube's counts into the shares, notes and highlights the Perfil page shows.
import { buildSeries, type PerfilChartDef, type PerfilGender } from "@ameciclo/db/perfil-series";
import type { PerfilCube, PerfilHistogramCell, PerfilNational, PerfilSurveyOption } from "@ameciclo/db/shared";
import type { PerfilPage } from "~/queries/dados.perfil";

export type PerfilProps = {
  surveys: PerfilSurveyOption[];
  cube: PerfilCube | null;
  history: PerfilCube[];
  // The same questions across every city surveyed, one entry per year of `history` that had several cities.
  national: PerfilNational[];
  onSelect: (survey: PerfilSurveyOption) => void;
};

export type Share = { name: string; n: number; pct: number };

export const CHARTS: PerfilChartDef[] = [
  { key: "days", title: "Quantos dias da semana costuma utilizar a bicicleta como meio de transporte?", days: [1, 7] },
  { key: "years", title: "Há quanto tempo utiliza a bicicleta como meio de transporte?", ordered: true },
  { key: "needs", title: "O que faria você pedalar mais?" },
  { key: "start", title: "Qual foi a sua motivação para começar?" },
  { key: "continue", title: "Qual foi a sua motivação para continuar a pedalar?" },
  { key: "issues", title: "Qual o seu maior problema ao pedalar?" },
  { key: "collisions", title: "Já sofreu algum tipo de colisão?", ordered: true },
  { key: "age", title: "Faixa etária", ordered: true },
  { key: "schooling", title: "Escolaridade", ordered: true },
  { key: "income", title: "Faixa salarial", ordered: true },
  { key: "workDays", title: "Dias de uso para trabalho", days: [0, 7] },
  { key: "leisureDays", title: "Dias de uso para lazer", days: [0, 7] },
  { key: "combination", title: "Combinação com transporte", ordered: true },
];

// Questions that are not part of the original set of charts.
const EXTRA_CHARTS: PerfilChartDef[] = [
  { key: "area", title: "Em que região da cidade foi a entrevista?", ordered: true },
  { key: "previousMode", title: "Que meio de transporte usava antes da bicicleta?" },
  { key: "electric", title: "Usa bicicleta elétrica?", ordered: true },
  { key: "shared", title: "Usa bicicleta compartilhada?", ordered: true },
  { key: "theft", title: "Já sofreu furto?", ordered: true },
  { key: "harassment", title: "Já sofreu assédio?", ordered: true },
  { key: "pandemic", title: "A pandemia mudou a frequência com que você pedala?", ordered: true },
  { key: "pandemicChange", title: "Como a pandemia mudou a sua frequência?", ordered: true },
];

const pick = (...keys: string[]) => keys.flatMap((k) => [...CHARTS, ...EXTRA_CHARTS].filter((c) => c.key === k));

export const THEMES: { title: string; defs: PerfilChartDef[] }[] = [
  { title: "Quem pedala", defs: pick("age", "schooling", "income", "area") },
  { title: "Como pedala", defs: pick("days", "workDays", "leisureDays", "years", "combination", "previousMode", "electric", "shared") },
  { title: "Por que pedala", defs: pick("start", "continue") },
  { title: "Pandemia", defs: pick("pandemic", "pandemicChange") },
  { title: "Segurança", defs: pick("collisions", "theft", "harassment") },
  { title: "O que atrapalha", defs: pick("issues", "needs") },
];

export const SHORT: Record<string, string> = {
  days: "Dias de uso por semana",
  years: "Tempo de uso",
  needs: "O que faria pedalar mais",
  start: "Motivação para começar",
  continue: "Motivação para continuar",
  issues: "Maior problema",
  collisions: "Colisão",
  age: "Idade",
  schooling: "Escolaridade",
  income: "Renda",
  workDays: "Dias de uso para trabalho",
  leisureDays: "Dias de uso para lazer",
  combination: "Combina com outro transporte",
  area: "Região",
  previousMode: "Meio usado antes",
  electric: "Bicicleta elétrica",
  shared: "Bicicleta compartilhada",
  theft: "Furto",
  harassment: "Assédio",
  pandemic: "Pandemia mudou a frequência",
  pandemicChange: "Pedala mais ou menos desde a pandemia",
};

// Colisões: how many years back the question asked about, by edition.
const COLLISION_WINDOW: Record<number, number> = { 2015: 3, 2018: 3, 2021: 2 };

// What a reader needs to know before trusting this question in this edition.
export function compareNote(key: string, year: number): string | null {
  if (key === "collisions") {
    const years = COLLISION_WINDOW[year];
    return years
      ? `Nesta edição a pergunta cobre os últimos ${years} anos.`
      : "Não há registro do período que a pergunta cobre nesta edição.";
  }
  if (key === "income" && year === 2024) {
    return "Em 2024 as faixas de renda mudaram (até 1, 1 a 2, 2 a 5 e acima de 5 salários mínimos).";
  }
  if (key === "pandemicChange") return "Só respondeu quem disse que a pandemia mudou a frequência com que pedala.";
  if (key === "area") return "Mostra onde as entrevistas foram feitas, não onde os ciclistas estão.";
  return null;
}

// Whether the answers of two editions can be put side by side.
export function comparable(key: string, a: number, b: number): boolean {
  if (key === "collisions") {
    const wa = COLLISION_WINDOW[a];
    return wa !== undefined && wa === COLLISION_WINDOW[b];
  }
  if (key === "income") return (a === 2024) === (b === 2024);
  return true;
}

// The edition right before this one that asked the question.
export function previousEdition(history: PerfilCube[], cube: PerfilCube, key: string): PerfilCube | undefined {
  return [...history].reverse().find((c) => c.survey.year < cube.survey.year && (c.questions[key]?.length ?? 0) > 0);
}

// Share of answers per option, for everyone or for one gender / color-race.
export function distribution(
  cells: PerfilCube["questions"][string],
  def: PerfilChartDef,
  gender: PerfilGender = "all",
  race?: string,
): Share[] {
  const series = buildSeries(cells, def, { gender, races: race ? [race] : [], hasRace: race !== undefined })[0];
  if (!series) return [];
  const total = series.data.reduce((s, d) => s + d.y, 0);
  return series.data.map((d) => ({ name: d.name, n: d.y, pct: total ? (d.y / total) * 100 : 0 }));
}

export const total = (shares: Share[]) => shares.reduce((s, x) => s + x.n, 0);

function share(cube: PerfilCube, key: string, match: (name: string) => boolean): number | null {
  const def = CHARTS.find((c) => c.key === key);
  const cells = cube.questions[key];
  if (!def || !cells || cells.length === 0) return null;
  return distribution(cells, def)
    .filter((x) => match(x.name))
    .reduce((s, x) => s + x.pct, 0);
}

function womenShare(cube: PerfilCube): number | null {
  const cells = Object.values(cube.questions).find((c) => c.length > 0);
  if (!cells) return null;
  const all = cells.reduce((s, c) => s + c.n, 0);
  const women = cells.filter((c) => c.gender === "Feminino").reduce((s, c) => s + c.n, 0);
  return all ? (women / all) * 100 : null;
}

function medianTrip(h: PerfilHistogramCell[]): number | null {
  const byBucket = new Map<number, number>();
  for (const c of h) byBucket.set(c.bucket, (byBucket.get(c.bucket) ?? 0) + c.n);
  const all = [...byBucket.values()].reduce((a, b) => a + b, 0);
  if (!all) return null;
  let acc = 0;
  for (const [bucket, n] of [...byBucket.entries()].sort((a, b) => a[0] - b[0])) {
    acc += n;
    if (acc >= all / 2) return bucket + 2.5;
  }
  return null;
}

export type Stat = { key: string; label: string; unit: "%" | "min"; value: number | null };

export function keyStats(cube: PerfilCube): Stat[] {
  return [
    { key: "women", label: "são mulheres", unit: "%", value: womenShare(cube) },
    { key: "days", label: "pedalam 5 dias ou mais por semana", unit: "%", value: share(cube, "days", (n) => /^[567] dias$/.test(n)) },
    { key: "combo", label: "combinam a bicicleta com outro transporte", unit: "%", value: share(cube, "combination", (n) => n.startsWith("Utiliza")) },
    { key: "trip", label: "tempo mediano do trajeto", unit: "min", value: medianTrip(cube.histogram) },
    { key: "collision", label: "já sofreram colisão", unit: "%", value: share(cube, "collisions", (n) => n === "Sim") },
  ];
}

export const fmt = (v: number | null, unit: Stat["unit"]) =>
  v === null ? "–" : unit === "%" ? `${Math.round(v)}%` : `~${Math.round(v)} min`;

export type Insight = { key: string; kind: "Segurança" | "Comparação" | "Evolução"; text: string };

const rounded = (v: number) => `${Math.round(v)}%`;

function yes(cube: PerfilCube, key: string, gender: PerfilGender) {
  const def = [...CHARTS, ...EXTRA_CHARTS].find((c) => c.key === key);
  const cells = cube.questions[key];
  if (!def || !cells?.length) return null;
  const rows = distribution(cells, def, gender);
  return { pct: rows.find((r) => r.name === "Sim")?.pct ?? 0, n: total(rows) };
}

// The few findings worth putting before everything else: who suffers most from
// violence, where the city stands out from the rest of the country, and what
// changed most since the edition before. Only editions that can be compared.
export function insights(cube: PerfilCube, history: PerfilCube[], national: PerfilNational | undefined): Insight[] {
  const out: Insight[] = [];
  const year = cube.survey.year;
  const defs = THEMES.flatMap((t) => t.defs);

  const violence: [string, string][] = [
    ["harassment", "assédio"],
    ["theft", "furto"],
    ["collisions", "colisão"],
  ];
  for (const [key, noun] of violence) {
    const women = yes(cube, key, "Feminino");
    const men = yes(cube, key, "Masculino");
    if (!women || !men || women.n < 30 || men.n < 30) continue;
    if (Math.abs(women.pct - men.pct) < 5) continue;
    out.push({
      key,
      kind: "Segurança",
      text: `${rounded(women.pct)} das mulheres e ${rounded(men.pct)} dos homens já sofreram ${noun}.`,
    });
  }

  if (national) {
    const gaps = defs
      .filter((d) => d.key !== "area" && cube.questions[d.key]?.length && national.questions[d.key]?.length)
      .map((def) => {
        const here = distribution(cube.questions[def.key] ?? [], def);
        const there = distribution(national.questions[def.key] ?? [], def);
        const best = here
          .map((h) => ({ name: h.name, a: h.pct, b: there.find((t) => t.name === h.name)?.pct }))
          .flatMap((x) => (x.b === undefined ? [] : [{ ...x, b: x.b, gap: x.a - x.b }]))
          .sort((x, y) => Math.abs(y.gap) - Math.abs(x.gap))[0];
        return best ? { def, ...best } : null;
      })
      .flatMap((x) => (x && Math.abs(x.gap) >= 8 ? [x] : []))
      .sort((x, y) => Math.abs(y.gap) - Math.abs(x.gap))
      .slice(0, 2);
    for (const g of gaps) {
      out.push({
        key: g.def.key,
        kind: "Comparação",
        text: `${SHORT[g.def.key]}: “${g.name}” é ${rounded(g.a)} no ${cube.survey.city}, contra ${rounded(g.b)} nas ${national.cities} cidades pesquisadas em ${year}.`,
      });
    }
  }

  // "Meio usado antes" is only asked of people who changed modes, so its base differs between editions.
  const changes = defs
    .filter((d) => d.key !== "area" && d.key !== "previousMode")
    .flatMap((def) => {
      const prev = previousEdition(history, cube, def.key);
      if (!prev || !comparable(def.key, prev.survey.year, year)) return [];
      const now = distribution(cube.questions[def.key] ?? [], def);
      const before = distribution(prev.questions[def.key] ?? [], def);
      const best = now
        .flatMap((n) => {
          const b = before.find((x) => x.name === n.name);
          return b ? [{ name: n.name, a: b.pct, b: n.pct, delta: n.pct - b.pct }] : [];
        })
        .sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta))[0];
      return best ? [{ def, prev: prev.survey.year, ...best }] : [];
    })
    .filter((x) => Math.abs(x.delta) >= 6)
    .sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta))
    .slice(0, 3);
  for (const c of changes) {
    out.push({
      key: c.def.key,
      kind: "Evolução",
      text: `${SHORT[c.def.key]}: “${c.name}” ${c.delta > 0 ? "subiu" : "caiu"} de ${rounded(c.a)} em ${c.prev} para ${rounded(c.b)} em ${year}.`,
    });
  }
  return out;
}
