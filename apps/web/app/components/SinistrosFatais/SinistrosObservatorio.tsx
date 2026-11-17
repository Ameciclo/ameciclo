// Observatório de Sinistros Fatais: primeiro, quantas pessoas morreram; depois um explorador (olhar, município,
// período e local do óbito) com quem morre, em que colisão e com que diagnósticos; por fim, todos os municípios.
import type { DeathOverview, DeathStats } from "@ameciclo/db/deaths-read";
import { PLACES, type PlaceKey, type Selection } from "~/queries/dados.sinistros-fatais";
import { CollisionMatrix, ModeChart, VictimProfile } from "./SinistrosCharts";
import { MODE_LABELS, n, pct } from "./labels";
import { MODES } from "@ameciclo/db/deaths-model";

type Basis = "ocorrencia" | "residencia";
type Change = { olhar?: Basis; cidade?: number | undefined; de?: number; ate?: number; local?: PlaceKey | undefined };

interface Props {
  title: string;
  overview: DeathOverview | null;
  stats: DeathStats | null;
  selection: Selection | null;
  supportFiles: { title?: string; name?: string; description?: string; url?: string }[];
  onSelect: (change: Change) => void;
}

const BASES: Basis[] = ["ocorrencia", "residencia"];
const PLACE_KEYS: PlaceKey[] = ["via", "hospital", "outros"];
const BASIS_LABEL: Record<Basis, string> = { ocorrencia: "Onde morreram", residencia: "Onde moravam" };
const BASIS_NOTE: Record<Basis, string> = {
  ocorrencia: "município onde ocorreu o óbito",
  residencia: "município de residência de quem morreu",
};

const EXPLANATIONS = [
  {
    label: "O que são esses dados?",
    text: "Mortes por acidentes de transporte terrestre (CID-10, de V01 a V89, mais o V99, acidente de transporte não especificado) registradas no Sistema de Informações sobre Mortalidade (SIM), do DATASUS, a partir das declarações de óbito. Os números só consideram as pessoas que morreram; feridos não entram.",
  },
  {
    label: "Onde morreram ou onde moravam?",
    text: "“Onde morreram” conta o município em que o óbito foi registrado, que pode não ser o do sinistro: quem é socorrido pode morrer em outro. “Onde moravam” conta pelo município de residência, que pode ser diferente do município onde ocorreu o óbito. Os dois olhares aparecem lado a lado, por isso os totais não coincidem.",
  },
];

export default function SinistrosObservatorio({ title, overview, stats, selection, supportFiles, onSelect }: Props) {
  if (!overview || !selection) {
    return (
      <>
        <PageHeader title={title} />
        <section className="container mx-auto my-10 px-4">
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-800">Os dados do observatório ainda não foram carregados.</p>
            <p className="mt-1 text-sm text-gray-500">Eles chegam com a importação das mortes registradas no DATASUS.</p>
          </div>
        </section>
      </>
    );
  }

  const { basis, city, from, to, place } = selection;
  const series = overview.byBasis[basis];
  // Um ano que o SIM ainda não fechou não entra nas comparações: pareceria uma queda.
  const complete = series.byYear.filter((y) => !overview.partialYears.includes(y.year));
  const last = complete.at(-1);
  const previous = complete.at(-2);
  const worst = complete.reduce((a, b) => (b.total > a.total ? b : a), complete[0]);
  const tenYears = complete.slice(-10).reduce((a, b) => a + b.total, 0);
  const change = last && previous && previous.total > 0 ? ((last.total - previous.total) / previous.total) * 100 : null;
  const cityName = city === undefined ? "a Região Metropolitana do Recife" : (series.byCity.find((c) => c.city === city)?.name ?? "");
  const years = overview.years;
  const periodText = from === to ? `em ${from}` : `de ${from} a ${to}`;

  return (
    <>
      <PageHeader title={title} />

      <section className="container mx-auto mt-8 px-4" aria-labelledby="resposta">
        <h2 id="resposta" className="sr-only">Quantas pessoas morreram</h2>
        <div className="rounded-xl border border-gray-200 bg-white p-5 md:p-7">
          <div className="grid gap-6 md:grid-cols-[minmax(0,20rem)_1fr] md:items-center md:gap-10">
            <div>
              <p className="text-6xl font-bold leading-none tabular-nums text-ameciclo">{last ? n(last.total) : "–"}</p>
              <p className="mt-3 leading-snug text-gray-700">
                pessoas morreram no trânsito da Região Metropolitana do Recife em {last?.year}
                {change !== null && (
                  <>
                    , {change === 0 ? "o mesmo número de" : change > 0 ? `${Math.abs(Math.round(change))}% a mais que em` : `${Math.abs(Math.round(change))}% a menos que em`}{" "}
                    {previous?.year}
                  </>
                )}
                .
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-gray-500">Nos últimos 10 anos</dt>
                <dd className="text-2xl font-bold tabular-nums text-gray-900">{n(tenYears)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Ano mais violento da série</dt>
                <dd className="text-2xl font-bold tabular-nums text-gray-900">
                  {worst.year} <span className="text-base font-normal text-gray-600">({n(worst.total)})</span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Contagem por {BASIS_NOTE[basis]}, de {overview.years[0]} a {overview.updatedThrough}. Fonte: SIM/DATASUS.{overview.partialYears.length > 0 && ` ${overview.partialYears.join(" e ")}* ainda não fechou e fica fora das comparações; os anos mais recentes podem ser preliminares.`}{" "}
          <a href="#metodo" className="underline underline-offset-2 hover:text-gray-700">Como medimos</a>.
        </p>
      </section>

      <section id="explorador" className="container mx-auto mt-10 grid scroll-mt-20 grid-cols-1 gap-8 px-4 md:grid-cols-[250px_1fr]">
        <nav className="space-y-5 md:sticky md:top-20 md:self-start" aria-label="Filtros">
          <fieldset>
            <legend className="mb-1 block text-xs uppercase tracking-wide text-gray-500">Olhar</legend>
            <div className="flex flex-wrap gap-2">
              {BASES.map((b) => (
                <button
                  key={b}
                  type="button"
                  aria-pressed={basis === b}
                  onClick={() => onSelect({ olhar: b === "ocorrencia" ? undefined : b })}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${basis === b ? "bg-ameciclo text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  {BASIS_LABEL[b]}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-gray-500">Município</span>
            <select
              value={city ?? ""}
              onChange={(e) => onSelect({ cidade: e.target.value === "" ? undefined : Number(e.target.value) })}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
            >
              <option value="">Região Metropolitana</option>
              {[...series.byCity]
                .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
                .map((c) => (
                  <option key={c.city} value={c.city}>{c.name}</option>
                ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <YearSelect label="De" value={from} years={years} onChange={(de) => onSelect({ de, ate: Math.max(de, to) })} />
            <YearSelect label="Até" value={to} years={years} onChange={(ate) => onSelect({ ate, de: Math.min(from, ate) })} />
          </div>

          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-gray-500">Local do óbito</span>
            <select
              value={place ?? ""}
              onChange={(e) => onSelect({ local: e.target.value === "via" || e.target.value === "hospital" || e.target.value === "outros" ? e.target.value : undefined })}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
            >
              <option value="">Todos</option>
              {PLACE_KEYS.map((k) => (
                <option key={k} value={k}>{PLACES[k].label}</option>
              ))}
            </select>
          </label>
          <p className="text-xs leading-relaxed text-gray-500">O endereço da página guarda as escolhas, para você compartilhar.</p>
        </nav>

        <div className="min-w-0 space-y-8">
          {stats ? (
            <Results stats={stats} cityName={cityName} periodText={periodText} basis={basis} partialYears={overview.partialYears} />
          ) : (
            <p className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600">Não foi possível carregar os números agora. Tente de novo em instantes.</p>
          )}
        </div>
      </section>

      <section className="container mx-auto mt-10 px-4" aria-labelledby="todos">
        <h2 id="todos" className="mb-1 text-xl font-bold text-gray-800">Todos os municípios</h2>
        <p className="mb-3 text-sm text-gray-500">Mortes por ano, {BASIS_NOTE[basis]}. Clique em um município para abri-lo acima.</p>
        <CitiesTable series={series} years={years} partialYears={overview.partialYears} selectedCity={city} onSelect={(c) => onSelect({ cidade: c })} />
      </section>

      <section id="metodo" className="container mx-auto mb-10 mt-10 scroll-mt-20 px-4" aria-labelledby="como-medimos">
        <h2 id="como-medimos" className="text-xl font-bold text-gray-800">Como medimos</h2>
        <dl className="mt-4 grid max-w-5xl grid-cols-1 gap-x-12 gap-y-5 md:grid-cols-2">
          {[
            ["De onde vem", "Das declarações de óbito do SIM, publicadas pelo DATASUS. Contamos os óbitos cuja causa principal é um acidente de transporte terrestre (CID-10 V01 a V89 e V99) em que o município do óbito ou o de residência é um dos 14 da Região Metropolitana do Recife."],
            ["Quem morreu e em que colisão", "O próprio código da causa diz quem morreu (pedestre, ciclista, motociclista, ocupante de automóvel…) e contra quem ou o quê colidiu. Os códigos de colisão com “não especificado” aparecem como tal."],
            ["O que não está aqui", "Feridos e sinistros sem morte; quem morreu meses depois, de sequelas (cerca de 3 pessoas por ano na região); mortes que o SIM ainda não registrou; e o local exato do sinistro, que a declaração de óbito não traz. Cada ano só entra depois que o DATASUS o publica, o que leva cerca de um ano."],
            ["Privacidade", "Guardamos só o ano e o mês do óbito, sem dia, hora, nascimento ou profissão, e a página mostra apenas totais."],
          ].map(([term, text]) => (
            <div key={term}>
              <dt className="font-semibold text-gray-900">{term}</dt>
              <dd className="mt-1 max-w-prose leading-relaxed text-gray-700">{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      {supportFiles.length > 0 && (
        <section className="container mx-auto mb-12 px-4" aria-labelledby="documentos">
          <h2 id="documentos" className="text-xl font-bold text-gray-800">Documentação sobre segurança viária</h2>
          <ul className="mt-3 max-w-3xl divide-y divide-gray-100">
            {supportFiles.map((f) => (
              <li key={f.url ?? f.title}>
                <a href={f.url} target="_blank" rel="noreferrer" className="block py-3 hover:bg-gray-50">
                  <span className="font-medium text-ameciclo">{f.title || f.name || "Documento"}</span>
                  {f.description && <span className="mt-0.5 block text-sm text-gray-600">{f.description}</span>}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function PageHeader({ title }: { title: string }) {
  return (
    <header className="container mx-auto px-4 pt-8">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
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

function YearSelect({ label, value, years, onChange }: { label: string; value: number; years: number[]; onChange: (y: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wide text-gray-500">{label}</span>
      <select value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm">
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </label>
  );
}

function Results({ stats, cityName, periodText, basis, partialYears }: { stats: DeathStats; cityName: string; periodText: string; basis: Basis; partialYears: number[] }) {
  if (stats.total === 0) {
    return <p className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600">Nenhuma morte registrada com esses filtros.</p>;
  }
  const vulnerable = stats.byMode.pedestre + stats.byMode.ciclista + stats.byMode.motociclista;
  const top = MODES.reduce((a, b) => (stats.byMode[b] > stats.byMode[a] ? b : a), MODES[0]);
  const worst = stats.byYear.filter((y) => !partialYears.includes(y.year)).reduce<(typeof stats.byYear)[number] | undefined>((a, b) => (!a || b.total > a.total ? b : a), undefined);
  const highlights = [
    { lead: n(stats.total), text: `mortes em ${cityName} ${periodText}, ${basis === "ocorrencia" ? "pelo município do óbito" : "pelo município de residência"}.` },
    { lead: pct(vulnerable, stats.total), text: `eram pedestres, ciclistas ou motociclistas: ${n(vulnerable)} de ${n(stats.total)}. ${MODE_LABELS[top]} são o maior grupo, com ${pct(stats.byMode[top], stats.total)}.` },
    worst && stats.byYear.length > 1 && { lead: String(worst.year), text: `foi o ano mais violento do período, com ${n(worst.total)} mortes.` },
  ].filter((h) => h !== false && h !== undefined);

  return (
    <>
      <div>
        <h2 className="text-xl font-bold text-gray-800">{cityName[0].toUpperCase() + cityName.slice(1)}, {periodText}</h2>
        <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
          {highlights.map((h) => (
            <li key={h.lead} className="border-t border-gray-200 pt-3 leading-snug text-gray-800">
              <span className="block text-2xl font-bold tabular-nums text-gray-900">{h.lead}</span>
              {h.text}
            </li>
          ))}
        </ul>
      </div>
      <Block title="Quem morreu, ano a ano" note="Pela causa principal do óbito. Clique em um tipo de vítima para tirá-lo do gráfico.">
        <ModeChart stats={stats} partialYears={partialYears} />
      </Block>
      <Block title="Em que colisão">
        <CollisionMatrix stats={stats} />
      </Block>
      <Block title="Perfil de quem morreu">
        <VictimProfile stats={stats} />
      </Block>
    </>
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

function CitiesTable({ series, years, partialYears, selectedCity, onSelect }: { series: DeathOverview["byBasis"][Basis]; years: number[]; partialYears: number[]; selectedCity: number | undefined; onSelect: (city: number) => void }) {
  const shown = years.slice(-10);
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <caption className="sr-only">Mortes no trânsito por município e ano</caption>
        <thead>
          <tr className="border-b border-gray-200 text-xs text-gray-500">
            <th scope="col" className="px-3 py-2 text-left font-medium">Município</th>
            {shown.map((y, i) => (
              <th key={y} scope="col" className={`px-2 py-2 text-right font-medium ${i < shown.length - 2 ? "hidden md:table-cell" : ""}`}>{y}{partialYears.includes(y) ? "*" : ""}</th>
            ))}
            <th scope="col" className="px-3 py-2 text-right font-medium">Total {years[0]}–{years.at(-1)}</th>
          </tr>
        </thead>
        <tbody>
          {series.byCity.map((c) => (
            <tr key={c.city} className={`border-b border-gray-100 last:border-0 ${c.city === selectedCity ? "bg-gray-50" : ""}`}>
              <th scope="row" className="px-3 py-2 text-left font-medium">
                <button type="button" onClick={() => onSelect(c.city)} className="text-left text-ameciclo underline-offset-2 hover:underline">{c.name}</button>
              </th>
              {shown.map((y, i) => (
                <td key={y} className={`px-2 py-2 text-right tabular-nums text-gray-800 ${i < shown.length - 2 ? "hidden md:table-cell" : ""}`}>{n(c.years[y] ?? 0)}</td>
              ))}
              <td className="px-3 py-2 text-right font-semibold tabular-nums text-gray-900">{n(c.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
