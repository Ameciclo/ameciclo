// Observatório de Vias Inseguras: primeiro, quais vias do Recife mais tiveram chamados do SAMU por sinistro; depois um
// explorador (período, mapa, ranking e a via escolhida); por fim, como medimos.
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { atKm, atVias, concentrationByKm, concentrationByVia, type ConcentrationPoint } from "@ameciclo/db/streets-model";
import { isPartialYear, MAP_STREETS, MIN_RATE_CALLS, MIN_RATE_KM, viaQueryOptions, viaSlug, type ViasView } from "~/queries/dados.vias-inseguras";
import { CategoryBars, ConcentrationChart, YearBars } from "./ViasCharts";
import { RankingTable } from "./RankingTable";
import { ViasMap } from "./ViasMap";
import { km, n, pct, perKm } from "./labels";

type Change = { de?: number; ate?: number; via?: string | undefined };

interface Props {
  view: ViasView | null;
  period: { from: number; to: number };
  selectedSlug: string | undefined;
  onSelect: (change: Change) => void;
}

const EXPLANATIONS = [
  {
    label: "O que são vias inseguras?",
    text: "As vias do Recife com mais chamados do SAMU por sinistro de trânsito. Cada chamado é uma pessoa que precisou de atendimento: ferida ou, em alguns casos, morta. A lista mostra onde isso mais acontece, e não de quem é a culpa.",
  },
  {
    label: "Como contamos?",
    text: "Contamos os chamados que tiveram atendimento, por logradouro, e dividimos pela extensão da via na malha da Prefeitura do Recife. Uma via longa tem mais chamados só por ser longa; por isso mostramos também os chamados por quilômetro.",
  },
];

export default function ViasObservatorio({ view, period, selectedSlug, onSelect }: Props) {
  if (!view) {
    return (
      <>
        <PageHeader />
        <section className="container mx-auto my-10 px-4">
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-800">Os dados das vias inseguras não estão disponíveis agora.</p>
            <p className="mt-1 text-sm text-gray-500">Eles vêm dos chamados do SAMU e da malha viária da Prefeitura. Tente de novo em instantes.</p>
          </div>
        </section>
      </>
    );
  }

  const { streets, years, totalCalls, unidentifiedCalls, streetCount, matchedCalls } = view;
  const identified = totalCalls - unidentifiedCalls;
  const top = streets[0];
  const top10Calls = streets.slice(0, 10).reduce((a, s) => a + s.calls, 0);
  const half = (() => {
    let sum = 0;
    for (const s of streets) {
      sum += s.calls;
      if (sum >= identified / 2) return s.rank;
    }
    return undefined;
  })();
  // Chamados por km só fazem sentido em vias de alguma extensão e com chamados suficientes.
  const densest = streets.filter((s) => s.callsPerKm !== null).sort((a, b) => (b.callsPerKm ?? 0) - (a.callsPerKm ?? 0))[0];
  const byVia = concentrationByVia(streets, identified);
  const byKm = concentrationByKm(streets, identified);
  const rated = streets.flatMap((s) => (s.callsPerKm === null ? [] : [s.callsPerKm])).sort((a, b) => a - b);
  const median = rated.length > 0 ? (rated.length % 2 === 1 ? rated[(rated.length - 1) / 2] : (rated[rated.length / 2 - 1] + rated[rated.length / 2]) / 2) : null;
  const top10 = atVias(byVia, 10);
  const totalKm = byVia.at(-1)?.km ?? 0;
  const insights = [
    top10 && `As 10 primeiras vias somam ${km(top10.km)} km e reúnem ${pct(top10.share, 100)} dos chamados com via identificada.`,
    top && `${top.name} tem mais chamados que qualquer outra via (${n(top.calls)})${top.lengthKm !== null ? `, em ${km(top.lengthKm)} km` : ""}${top.callsPerKm !== null ? `: ${perKm(top.callsPerKm)} por km` : ""}.`,
    median !== null && `Entre as ${n(rated.length)} vias do ranking com ${km(MIN_RATE_KM)} km ou mais e ${MIN_RATE_CALLS} chamados ou mais, metade tem mais de ${perKm(median)} chamados por km.`,
    byVia.length > 0 && `As ${n(byVia.length)} vias do ranking somam ${km(totalKm)} km (as sem extensão na malha ficam de fora dessa soma) e reúnem ${pct(byVia.at(-1)?.share ?? 0, 100)} dos chamados com via identificada.`,
  ].filter((t) => typeof t === "string");
  const periodText = period.from === period.to ? `em ${period.from}` : `de ${period.from} a ${period.to}`;
  const partialInPeriod = years.filter((y) => isPartialYear(y) && y.year >= period.from && y.year <= period.to);
  const selected = selectedSlug ? streets.find((s) => viaSlug(s.name) === selectedSlug) : undefined;

  const highlights = [
    { lead: pct(top10Calls, identified), text: `dos chamados com via identificada ${periodText} aconteceram nas 10 primeiras vias do ranking.` },
    half !== undefined && { lead: String(half), text: `vias reúnem metade dos chamados com via identificada ${periodText}, de ${n(streetCount)} vias com algum chamado.` },
    densest && { lead: perKm(densest.callsPerKm), text: `chamados por km em ${densest.name}, a via com mais chamados por quilômetro (só contam vias de ${km(MIN_RATE_KM)} km ou mais e com ${MIN_RATE_CALLS} chamados ou mais).` },
  ].filter((h) => h !== false && h !== undefined);

  return (
    <>
      <PageHeader />

      <section className="container mx-auto mt-8 px-4" aria-labelledby="resposta">
        <h2 id="resposta" className="sr-only">Quantos chamados</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card label="Chamados com atendimento" value={n(totalCalls)} note={periodText} />
          <Card label="Vias com chamado" value={n(streetCount)} note="no Recife" />
          <Card label="Via com mais chamados" value={top ? n(top.calls) : "–"} note={top?.name ?? ""} />
          <Card label="Com via identificada" value={pct(identified, totalCalls)} note={`${n(unidentifiedCalls)} sem a via anotada`} />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Chamados do SAMU por sinistro de trânsito no Recife que tiveram atendimento, de {years[0]?.year} a {years.at(-1)?.year}.{" "}
          {years.some(isPartialYear) && "A fonte não tem todos os meses de alguns anos (marcados com *); eles ficam fora de qualquer comparação. "}
          <a href="#metodo" className="underline underline-offset-2 hover:text-gray-700">Como medimos</a>.
        </p>
      </section>

      <section id="explorador" className="container mx-auto mt-10 grid scroll-mt-20 grid-cols-1 gap-8 px-4 md:grid-cols-[250px_1fr]">
        <nav className="space-y-5 md:sticky md:top-20 md:self-start" aria-label="Filtros">
          <div className="grid grid-cols-2 gap-3">
            <YearSelect label="De" value={period.from} years={years.map((y) => y.year)} partial={years.filter(isPartialYear).map((y) => y.year)} onChange={(de) => onSelect({ de, ate: Math.max(de, period.to), via: undefined })} />
            <YearSelect label="Até" value={period.to} years={years.map((y) => y.year)} partial={years.filter(isPartialYear).map((y) => y.year)} onChange={(ate) => onSelect({ ate, de: Math.min(period.from, ate), via: undefined })} />
          </div>
          {partialInPeriod.length > 0 && (
            <p className="text-xs leading-relaxed text-gray-500">
              O período inclui {partialInPeriod.map((y) => `${y.year}*`).join(", ")}, anos em que a fonte tem só alguns meses. Para comparar, escolha anos completos.
            </p>
          )}
          <p className="text-xs leading-relaxed text-gray-500">O endereço da página guarda as escolhas, para você compartilhar.</p>
        </nav>

        <div className="min-w-0 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Recife, {periodText}</h2>
            <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
              {highlights.map((h) => (
                <li key={h.lead + h.text} className="border-t border-gray-200 pt-3 leading-snug text-gray-800">
                  <span className="block text-2xl font-bold tabular-nums text-gray-900">{h.lead}</span>
                  {h.text}
                </li>
              ))}
            </ul>
          </div>

          <Block title="Onde ficam" note={`${Object.keys(view.geometries).length} das ${Math.min(MAP_STREETS, streets.length)} vias com mais chamados têm traçado na malha da Prefeitura. Passe o mouse para ver os números e clique para abrir a via.`}>
            <ViasMap streets={streets} geometries={view.geometries} selectedKey={selected?.key} onSelect={(slug) => onSelect({ via: slug })} />
          </Block>

          {selected && <SelectedVia slug={selectedSlug ?? ""} name={selected.name} onClose={() => onSelect({ via: undefined })} />}

          <Block title="O ranking" note="Clique nos títulos das colunas para ordenar e use a busca para achar uma via. A extensão vem da malha da Prefeitura; vias sem correspondência ficam sem quilômetros.">
            <RankingTable streets={streets} identified={identified} selectedKey={selected?.key} onSelect={(slug) => onSelect({ via: slug })} />
          </Block>

          <Block title="Poucas vias concentram muito" note="Quanto dos chamados com via identificada cabe nas primeiras vias do ranking, contadas por via e por quilômetro.">
            <ConcentrationCards byVia={byVia} byKm={byKm} />
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-800">Por número de vias</h4>
                <ConcentrationChart points={byVia} axis="vias" />
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-800">Por extensão</h4>
                <ConcentrationChart points={byKm} axis="km" />
              </div>
            </div>
          </Block>

          <Block title="O que os números dizem">
            <ul className="list-disc space-y-2 pl-5 leading-relaxed text-gray-800">
              {insights.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </Block>
        </div>
      </section>

      <section id="metodo" className="container mx-auto mb-10 mt-10 scroll-mt-20 px-4" aria-labelledby="como-medimos">
        <h2 id="como-medimos" className="text-xl font-bold text-gray-800">Como medimos</h2>
        <dl className="mt-4 grid max-w-5xl grid-cols-1 gap-x-12 gap-y-5 md:grid-cols-2">
          {[
            ["De onde vêm os chamados", "Dos atendimentos do SAMU por sinistro de trânsito no Recife. Só contamos os que tiveram atendimento (concluído, remoção ou óbito no local); desistências, trotes e duplicados ficam de fora, como na página de chamados de sinistros."],
            ["De onde vem a via", `O SAMU anota o endereço e a Prefeitura corrige o nome do logradouro. Em ${pct(matchedCalls, identified)} dos chamados com via identificada o nome casa com a malha viária da Prefeitura, e é dela que sai a extensão. Alguns nomes do SAMU para a mesma via (“Av. Norte”, “Via Mangue”) foram juntos ao nome oficial.`],
            ["O que não está aqui", `Chamados sem a via anotada (${pct(unidentifiedCalls, totalCalls)}); sinistros sem atendimento do SAMU, que são a maioria dos com vítimas leves; e o ponto exato do sinistro: contamos por via inteira, não por trecho ou cruzamento.`],
            ["Anos incompletos", "A fonte não tem todos os meses de 2018, 2019, 2022 e 2025. Por isso comparar quantidades entre anos só vale entre os completos, e o ranking de um período com anos incompletos subestima o que houve neles."],
            ["Privacidade", "Mostramos só totais por via e por ano. Nenhum chamado, endereço de residência ou dado de paciente sai do banco."],
          ].map(([term, text]) => (
            <div key={term}>
              <dt className="font-semibold text-gray-900">{term}</dt>
              <dd className="mt-1 max-w-prose leading-relaxed text-gray-700">{text}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}

function ConcentrationCards({ byVia, byKm }: { byVia: ConcentrationPoint[]; byKm: ConcentrationPoint[] }) {
  const cards = [
    ...[10, 50, 100].flatMap((count) => {
      const p = atVias(byVia, count);
      return p ? [{ title: `As ${count} primeiras vias`, share: p.share, note: `somam ${km(p.km)} km` }] : [];
    }),
    ...[150, 300, 450].flatMap((limit) => {
      const p = atKm(byKm, limit);
      return p ? [{ title: `Os primeiros ${limit} km`, share: p.share, note: `em ${n(p.vias)} vias` }] : [];
    }),
  ];
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {cards.map((c) => (
        <li key={c.title} className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">{c.title}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-ameciclo">{pct(c.share, 100)}</p>
          <p className="text-sm leading-snug text-gray-600">dos chamados com via identificada, {c.note}</p>
        </li>
      ))}
    </ul>
  );
}

function PageHeader() {
  return (
    <header className="container mx-auto px-4 pt-8">
      <h1 className="text-3xl font-bold text-gray-900">Observatório de Vias Inseguras</h1>
      <div className="mt-5 grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
        {EXPLANATIONS.map(({ label, text }) => (
          <section key={label} className="border-t-2 border-ameciclo pt-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ameciclo">{label}</h2>
            <p className="mt-2 max-w-prose leading-relaxed text-gray-700">{text}</p>
          </section>
        ))}
      </div>
    </header>
  );
}

function Card({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-ameciclo">{value}</p>
      <p className="mt-1 text-sm leading-snug text-gray-600">{note}</p>
    </div>
  );
}

function Block({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {note && <p className="mb-3 text-sm text-gray-500">{note}</p>}
      <div className={note ? "" : "mt-3"}>{children}</div>
    </div>
  );
}

function YearSelect({ label, value, years, partial, onChange }: { label: string; value: number; years: number[]; partial: number[]; onChange: (y: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wide text-gray-500">{label}</span>
      <select value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm">
        {years.map((y) => (
          <option key={y} value={y}>{partial.includes(y) ? `${y}*` : y}</option>
        ))}
      </select>
    </label>
  );
}

function SelectedVia({ slug, name, onClose }: { slug: string; name: string; onClose: () => void }) {
  const { data } = useQuery(viaQueryOptions(slug));
  const via = data?.via;
  return (
    <div className="rounded-xl border border-gray-300 bg-white p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          {via && (
            <p className="text-sm text-gray-600">
              {n(via.street.calls)} chamados na série inteira · {via.rankOverall}ª das vias do Recife
              {via.street.lengthKm !== null && ` · ${km(via.street.lengthKm)} km · ${perKm(via.street.callsPerKm)} por km`}
            </p>
          )}
        </div>
        <button type="button" onClick={onClose} className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100" aria-label="Fechar a via">
          Fechar
        </button>
      </div>
      {via ? (
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-800">Chamados por ano</h4>
            <YearBars years={via.years} />
          </div>
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-800">Que tipo de sinistro</h4>
            <CategoryBars categories={via.categories} />
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-gray-500">Carregando a via…</p>
      )}
      <Link to="/dados/viasinseguras/$slug" params={{ slug }} className="mt-4 inline-block text-sm font-medium text-ameciclo underline underline-offset-2">
        Abrir a página da via
      </Link>
    </div>
  );
}
