// Pesquisa Perfil do Ciclista: headlines first, then an explorer (one question at a time, as a dot plot
// comparing groups and, optionally, the rest of the country) with share/download, plus a map of the interview points.
import { lazy, Suspense, useRef, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Download, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { PERFIL_RACES } from "@ameciclo/db/shared";
import type { PerfilGender } from "@ameciclo/db/perfil-series";
import type { PerfilPage } from "~/queries/dados.perfil";
import {
  compareNote,
  comparable,
  distribution,
  fmt,
  insights,
  keyStats,
  previousEdition,
  SHORT,
  THEMES,
  total,
  type Share,
  type PerfilProps,
} from "./perfilData";
import { DotRow, GroupLegend, roundedAxis, type DotValue } from "./DotPlot";
import EditionPicker from "./EditionPicker";
import ReportsSection from "./ReportsSection";

const PointsMap = lazy(() => import("./PointsMap"));

export type Dimension = "all" | "gender" | "race";
export type CParams = { q?: string; dim?: Dimension; nac?: boolean };

type Group = { name: string; label: string; color: string; gender: PerfilGender; race?: string; hollow?: boolean };
type GroupWithRows = Group & { rows: Share[] };

const DIMENSIONS: [Dimension, string][] = [
  ["all", "Geral"],
  ["gender", "Gênero"],
  ["race", "Cor/raça"],
];
const GENDER_GROUPS: Group[] = [
  { name: "Masculino", label: "Homens", color: "#3b82f6", gender: "Masculino" },
  { name: "Feminino", label: "Mulheres", color: "#ec4899", gender: "Feminino" },
];
const RACE_COLORS: Record<string, string> = {
  Amarela: "#eab308",
  Branca: "#6b7280",
  Indígena: "#92400e",
  Parda: "#ea580c",
  Preta: "#111827",
};
const RACE_GROUPS: Group[] = PERFIL_RACES.map((r) => ({
  name: r,
  label: r,
  color: RACE_COLORS[r] ?? "#999",
  gender: "all",
  race: r,
}));
const NATIONAL_COLOR = "#6b7280";
const SAFETY_KEYS = ["collisions", "theft", "harassment"];

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function download(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.click();
}

const csvCell = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`;

export default function PerfilExplorer({
  page,
  surveys,
  cube,
  history,
  national,
  onSelect,
  params,
  onParams,
}: PerfilProps & { page: PerfilPage; params: CParams; onParams: (p: CParams) => void }) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!cube) {
    return (
      <section className="container mx-auto px-4 my-10">
        <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-10 text-center">
          <p className="text-gray-700">Os dados da pesquisa estão indisponíveis no momento.</p>
          <p className="text-sm text-gray-500 mt-1">Tente novamente em alguns instantes.</p>
        </div>
      </section>
    );
  }

  const year = cube.survey.year;
  const city = cube.survey.city;
  const pool = national.find((n) => n.year === year);

  const themes = THEMES.map((t) => ({ ...t, defs: t.defs.filter((d) => (cube.questions[d.key]?.length ?? 0) > 0) })).filter(
    (t) => t.defs.length > 0,
  );
  const available = themes.flatMap((t) => t.defs);
  const def = available.find((d) => d.key === params.q) ?? available[0];
  if (!def) return null;

  const cells = cube.questions[def.key] ?? [];
  const dimension = params.dim ?? "gender";
  const nationalCells = pool?.questions[def.key] ?? [];
  const showNational = nationalCells.length > 0 && params.nac !== false;

  const baseGroups: Group[] =
    dimension === "all"
      ? [{ name: "all", label: city, color: "#2ba88f", gender: "all" }]
      : dimension === "gender"
        ? GENDER_GROUPS
        : cube.hasRace
          ? RACE_GROUPS
          : [];
  const cityGroups: GroupWithRows[] = baseGroups
    .map((g) => ({ ...g, rows: distribution(cells, def, g.gender, g.race) }))
    .filter((g) => g.rows.length > 0);
  const nationalGroups: GroupWithRows[] =
    showNational && pool
      ? [
          {
            name: "national",
            label: `Todas as ${pool.cities} cidades`,
            color: NATIONAL_COLOR,
            gender: "all",
            hollow: true,
            rows: distribution(nationalCells, def),
          },
        ]
      : [];
  const shown = [...cityGroups, ...nationalGroups];

  const overall = distribution(cells, def);
  const prev = previousEdition(history, cube, def.key);
  const prevOverall = prev && comparable(def.key, prev.survey.year, year) ? distribution(prev.questions[def.key] ?? [], def) : null;

  const table = overall.map((o) => {
    const values: DotValue[] = shown.map((g) => {
      const r = g.rows.find((x) => x.name === o.name);
      return { name: g.name, label: g.label, color: g.color, hollow: g.hollow, pct: r?.pct ?? 0, n: r?.n ?? 0 };
    });
    const own = values.filter((v) => !v.hollow).map((v) => v.pct);
    const before = prevOverall?.find((x) => x.name === o.name);
    return {
      name: o.name,
      values,
      spread: own.length > 1 ? Math.max(...own) - Math.min(...own) : 0,
      delta: before ? o.pct - before.pct : null,
    };
  });
  // Comparing groups: the rows where they differ most come first.
  const bySpread = dimension !== "all";
  const ordered = def.ordered || def.days || !bySpread ? table : [...table].sort((a, b) => b.spread - a.spread);
  const axisMax = roundedAxis(Math.max(0, ...table.flatMap((t) => t.values.map((v) => v.pct))));

  const notes = [
    compareNote(def.key, year),
    prev && !prevOverall ? `Não comparável com a edição de ${prev.survey.year}.` : null,
  ].flatMap((n) => (n ? [n] : []));

  const stats = keyStats(cube);
  const highlights = insights(cube, history, pool);

  const safety = SAFETY_KEYS.flatMap((key) => {
    const d = THEMES.flatMap((t) => t.defs).find((x) => x.key === key);
    const c = cube.questions[key];
    if (!d || !c?.length) return [];
    const group = (g: Group): DotValue => {
      const rows = distribution(c, d, g.gender);
      return { name: g.name, label: g.label, color: g.color, pct: rows.find((r) => r.name === "Sim")?.pct ?? 0, n: total(rows) };
    };
    return [{ key, label: SHORT[key] ?? key, values: GENDER_GROUPS.map(group) }];
  });
  const showSafety = cube.questions.theft?.length || cube.questions.harassment?.length;

  const filename = `perfil-${slug(city)}-${year}-${def.key}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const saveCsv = () => {
    const rows: (string | number)[][] = [["Pergunta", "Cidade", "Ano", "Grupo", "Opção", "Respostas", "Percentual"]];
    for (const g of shown) {
      for (const r of g.rows) {
        rows.push([def.title, g.name === "national" ? "Todas as cidades pesquisadas" : city, year, g.label, r.name, r.n, r.pct.toFixed(1)]);
      }
    }
    const blob = new Blob(["﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    download(url, `${filename}.csv`);
    URL.revokeObjectURL(url);
  };
  const savePng = async () => {
    if (!exportRef.current) return;
    setBusy(true);
    try {
      const { toPng } = await import("html-to-image");
      download(await toPng(exportRef.current, { pixelRatio: 2, backgroundColor: "#ffffff" }), `${filename}.png`);
    } finally {
      setBusy(false);
    }
  };

  // The explorer sits below the highlights, so show it once the question changes.
  const showQuestion = (key: string) => {
    onParams({ ...params, q: key });
    document.getElementById("explorador")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toolButton = "inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50";

  return (
    <>
      <header className="container mx-auto px-4 pt-8">
        <h1 className="text-3xl font-bold text-gray-900">Perfil do ciclista</h1>
        <div className="mt-5 grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
          {[
            ["O que é?", page.description],
            ["Para o que serve?", page.objective],
          ].map(([label, text]) =>
            text ? (
              <section key={label} className="border-t-2 border-ameciclo pt-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-ameciclo">{label}</h2>
                <p className="mt-2 max-w-prose text-gray-700 leading-relaxed">{text}</p>
              </section>
            ) : null,
          )}
        </div>
      </header>

      <EditionPicker surveys={surveys} current={cube.survey} onSelect={onSelect} />

      <section className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {stats.map((s) => (
            <div key={s.key} className="rounded-xl bg-white border border-gray-200 p-4">
              <div className="text-3xl font-bold text-gray-900 tabular-nums">{fmt(s.value, s.unit)}</div>
              <div className="text-sm text-gray-600 mt-1 leading-snug">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {highlights.length > 0 && (
        <section className="container mx-auto px-4 mt-8">
          <h2 className="text-sm uppercase tracking-wide text-gray-500">Em destaque</h2>
          <p className="text-xs text-gray-500 mb-3 max-w-3xl">
            Escolhidos automaticamente entre as maiores diferenças. Mudanças entre edições podem refletir a amostra ou o
            questionário, não só a realidade; clique para ver a pergunta completa.
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {highlights.map((h) => (
              <li key={`${h.kind}-${h.key}`}>
                <button
                  onClick={() => showQuestion(h.key)}
                  className="w-full text-left rounded-xl border border-gray-200 bg-white p-4 hover:border-ameciclo transition-colors"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-ameciclo">{h.kind}</span>
                  <span className="block mt-1 text-gray-800 leading-snug">{h.text}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {showSafety && (
        <section className="container mx-auto px-4 mt-10">
          <h2 className="text-xl font-bold text-gray-800">Violência contra quem pedala</h2>
          <p className="text-sm text-gray-500 mt-1">Porcentagem de pessoas que já sofreram, por gênero.</p>
          <div className="mt-3">
            <GroupLegend groups={GENDER_GROUPS} />
          </div>
          <ul className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white px-4">
            {safety.map((row) => (
              <DotRow
                key={row.key}
                label={row.label}
                values={row.values}
                axisMax={roundedAxis(Math.max(...safety.flatMap((r) => r.values.map((v) => v.pct))))}
                badge={Math.abs(row.values[0].pct - row.values[1].pct) >= 5 ? `${Math.round(Math.abs(row.values[0].pct - row.values[1].pct))} p.p.` : undefined}
              />
            ))}
          </ul>
          {compareNote("collisions", year) && <p className="text-xs text-gray-500 mt-2">Colisão: {compareNote("collisions", year)}</p>}
        </section>
      )}

      <section id="explorador" className="container mx-auto px-4 mt-10 grid scroll-mt-20 grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
        <nav className="space-y-5 md:sticky md:top-20 md:self-start">
          {themes.map((t) => (
            <div key={t.title}>
              <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">{t.title}</div>
              {t.defs.map((d) => (
                <button
                  key={d.key}
                  onClick={() => onParams({ ...params, q: d.key })}
                  className={`block w-full text-left text-sm rounded px-2 py-1 leading-snug ${
                    d.key === def.key ? "bg-ameciclo text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {d.title}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className="flex gap-1 rounded-full bg-gray-100 p-1">
              {DIMENSIONS.map(([d, label]) => (
                <button
                  key={d}
                  onClick={() => onParams({ ...params, dim: d })}
                  className={`px-3 py-1 rounded-full ${dimension === d ? "bg-white shadow-sm font-medium" : "text-gray-500"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {pool && (
              <label className="flex items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  checked={params.nac !== false}
                  onChange={(e) => onParams({ ...params, nac: e.target.checked })}
                />
                Comparar com as outras cidades
              </label>
            )}
            <div className="ml-auto flex flex-wrap gap-2">
              <button onClick={copyLink} className={toolButton}>
                <LinkIcon size={14} /> {copied ? "Link copiado" : "Copiar link"}
              </button>
              <button onClick={saveCsv} className={toolButton}>
                <Download size={14} /> CSV
              </button>
              <button onClick={savePng} disabled={busy} className={toolButton}>
                <ImageIcon size={14} /> {busy ? "Gerando..." : "Imagem"}
              </button>
            </div>
          </div>

          <div ref={exportRef} className="mt-4 rounded-xl bg-white p-5">
            <h2 className="text-xl font-bold text-gray-800">{def.title}</h2>
            {notes.map((n) => (
              <p key={n} className="mt-2 text-sm rounded-md bg-amber-50 border border-amber-200 text-amber-900 px-3 py-2">
                {n}
              </p>
            ))}
            {dimension === "race" && !cube.hasRace && <p className="mt-6 text-gray-500">Esta edição não perguntou a cor ou raça.</p>}

            <div className="mt-4">
              <GroupLegend groups={shown.map((g) => ({ ...g, n: total(g.rows) }))} />
            </div>

            <ul className="mt-2 divide-y divide-gray-100">
              {ordered.map((row) => (
                <DotRow
                  key={row.name}
                  label={row.name}
                  values={row.values}
                  axisMax={axisMax}
                  badge={row.spread >= 5 ? `${Math.round(row.spread)} p.p.` : undefined}
                  sub={
                    row.delta !== null && prev && Math.abs(row.delta) >= 1 ? (
                      <>
                        {row.delta > 0 ? "▲" : "▼"} {Math.abs(Math.round(row.delta))} p.p. desde {prev.survey.year}
                      </>
                    ) : undefined
                  }
                />
              ))}
            </ul>
            <div className="grid sm:grid-cols-[minmax(0,2fr)_3fr] gap-x-6">
              <span />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0%</span>
                <span>{axisMax}% das respostas do grupo</span>
              </div>
            </div>
            <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
              Fonte: Pesquisa Perfil do Ciclista, {city} {year} ({cube.survey.interviews.toLocaleString("pt-BR")} entrevistas) · Ameciclo
              {showNational && pool ? ` · comparação: ${pool.cities} cidades pesquisadas em ${year}` : ""}
            </p>
          </div>
        </div>
      </section>

      {cube.points.length > 0 && (
        <section className="container mx-auto px-4 mt-12">
          <h2 className="text-xl font-bold text-gray-800">Onde as entrevistas foram feitas</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-3xl">
            Cada círculo é um ponto de coleta: o tamanho mostra quantas pessoas foram entrevistadas ali e a cor, a porcentagem de
            mulheres (mais escuro, mais mulheres). São pontos fixos escolhidos pela pesquisa, então o mapa não mede quantos ciclistas
            passam em cada lugar. Pontos com menos de 10 entrevistas não aparecem.
          </p>
          <div className="mt-4 h-[460px] overflow-hidden rounded-xl border border-gray-200">
            <ClientOnly fallback={<div className="h-full bg-gray-100" />}>
              <Suspense fallback={<div className="h-full bg-gray-100" />}>
                <PointsMap points={cube.points} />
              </Suspense>
            </ClientOnly>
          </div>
        </section>
      )}

      <p className="container mx-auto px-4 mt-10 text-xs text-gray-500 max-w-4xl">
        A amostra é de pessoas abordadas em pontos de coleta, não uma amostra aleatória de todos os ciclistas. Grupos com menos de{" "}
        {cube.minCell} respostas em um cruzamento não são exibidos. As comparações entre cidades somam todas as entrevistas do ano,
        então cidades com mais entrevistas pesam mais.
      </p>
      <ReportsSection />
    </>
  );
}
