// Observatório Cicloviário: first, how much of the PDC was built; then where, in a map of the Região
// Metropolitana do Recife; then an explorer (one municipality at a time) and the whole list.
import type { CyclingCityStats, CyclingHistoryPoint, CyclingOverview, CyclingProjectRow } from "@ameciclo/db/cycling-read";
import { ExecucaoHistory } from "./ExecucaoHistory";
import { ExecucaoMap } from "./ExecucaoMap";
import { CitiesTable, ProjectsTable } from "./ExecucaoTables";
import { StatusBar } from "./StatusBar";
import { km, percent } from "./status";

interface ExecucaoObservatorioProps {
  title: string;
  explanations: { label: string; text: string }[];
  overview: CyclingOverview;
  projects: CyclingProjectRow[];
  history: CyclingHistoryPoint[];
  ways: GeoJSON.FeatureCollection<GeoJSON.Geometry> | undefined;
  selectedIbge: number;
  onSelect: (ibge: number) => void;
}

const day = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Recife" });
const names = (list: string[]) => new Intl.ListFormat("pt-BR", { style: "long", type: "conjunction" }).format(list);

// A municipality with less than this much of the PDC built counts as "almost nothing".
const ALMOST_NOTHING_KM = 0.1;

// Short sentences about the whole RMR, each with the number behind it.
function highlights(overview: CyclingOverview) {
  const { all, cities } = overview;
  const wrongTypology = all.undesignatedKm;
  const untouched = cities.filter((c) => c.executedInPdcKm < ALMOST_NOTHING_KM);

  return [
    all.existingKm > 0 && {
      lead: percent((all.outsidePdcKm / all.existingKm) * 100),
      text: `da estrutura cicloviária existente está fora do PDC: ${km(all.outsidePdcKm)} de ${km(all.existingKm)} são vias que o plano não previa.`,
    },
    all.executedInPdcKm > 0 && {
      lead: percent((wrongTypology / all.executedInPdcKm) * 100),
      text: `do que o PDC já implantou tem tipologia diferente da prevista: ${km(wrongTypology)} de ${km(all.executedInPdcKm)}.`,
    },
    untouched.length > 0 && {
      lead: `${untouched.length} de ${cities.length} municípios`,
      text: `têm menos de 100 metros do PDC implantado: ${names(untouched.map((c) => c.name))}.`,
    },
  ].filter((h) => h !== false);
}

export default function ExecucaoObservatorio({
  title,
  explanations,
  overview,
  projects,
  history,
  ways,
  selectedIbge,
  onSelect,
}: ExecucaoObservatorioProps) {
  const { all, cities } = overview;
  const city = cities.find((c) => c.ibge === selectedIbge) ?? cities[0];
  if (!city) return null;
  const cityProjects = projects.filter((p) => p.cityIbge === city.ibge);

  return (
    <>
      <header className="container mx-auto px-4 pt-8">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <div className="mt-5 grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
          {explanations.map(({ label, text }) => (
            <section key={label} className="border-t-2 border-ameciclo pt-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ameciclo">{label}</h2>
              <p className="mt-2 max-w-prose leading-relaxed text-gray-700">{text}</p>
            </section>
          ))}
        </div>
      </header>

      <section className="container mx-auto mt-8 px-4" aria-labelledby="resposta">
        <h2 id="resposta" className="sr-only">
          Quanto do PDC saiu do papel
        </h2>
        <div className="rounded-xl border border-gray-200 bg-white p-5 md:p-7">
          <div className="grid gap-6 md:grid-cols-[minmax(0,18rem)_1fr] md:items-center md:gap-10">
            <div>
              <p className="text-6xl font-bold leading-none tabular-nums text-ameciclo">{percent(all.percent)}</p>
              <p className="mt-3 leading-snug text-gray-700">
                do Plano Diretor Cicloviário já saiu do papel na Região Metropolitana do Recife:{" "}
                <strong className="font-semibold tabular-nums">{km(all.executedInPdcKm)}</strong> de{" "}
                <span className="tabular-nums">{km(all.plannedKm)}</span>.
              </p>
            </div>
            <StatusBar designatedKm={all.designatedKm} undesignatedKm={all.undesignatedKm} notExecutedKm={all.notExecutedKm} />
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Dados do OpenStreetMap{overview.updatedAt ? `, atualizados em ${day(overview.updatedAt)}` : ""}. Nas vias de pista dupla, as duas
          pistas contam como uma só. <a href="#metodo" className="underline underline-offset-2 hover:text-gray-700">Como medimos</a>.
        </p>
      </section>

      <section className="container mx-auto mt-8 px-4" aria-labelledby="destaques">
        <h2 id="destaques" className="text-sm uppercase tracking-wide text-gray-500">
          Em destaque
        </h2>
        <p className="mb-3 text-xs text-gray-500">Região Metropolitana do Recife.</p>
        <ul className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
          {highlights(overview).map((h) => (
            <li key={h.lead} className="border-t border-gray-200 pt-3 leading-snug text-gray-800">
              <span className="block text-2xl font-bold tabular-nums text-gray-900">{h.lead}</span>
              {h.text}
            </li>
          ))}
        </ul>
      </section>

      <section className="container mx-auto mt-10 px-4" aria-labelledby="mapa">
        <h2 id="mapa" className="text-xl font-bold text-gray-800">
          Onde estão as estruturas
        </h2>
        <p className="mb-4 mt-1 text-sm text-gray-500">
          Passe o mouse sobre um município para ver os números e clique para abri-lo abaixo. Os mesmos números estão na tabela de todos os
          municípios.
        </p>
        <ExecucaoMap
          cities={cities}
          ways={ways}
          selectedIbge={city.ibge}
          onSelect={(ibge) => {
            onSelect(ibge);
            document.getElementById("explorador")?.scrollIntoView({ behavior: "smooth" });
          }}
        />
      </section>

      <section id="explorador" className="container mx-auto mt-10 grid scroll-mt-20 grid-cols-1 gap-8 px-4 md:grid-cols-[250px_1fr]">
        <nav className="space-y-5 md:sticky md:top-20 md:self-start" aria-label="Município">
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-gray-500">Município</span>
            <select
              value={city.ibge}
              onChange={(e) => onSelect(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
            >
              {[...cities]
                .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
                .map((c) => (
                  <option key={c.ibge} value={c.ibge}>
                    {c.name}
                  </option>
                ))}
            </select>
          </label>
          <p className="text-xs leading-relaxed text-gray-500">
            Escolha aqui, clique no mapa ou na tabela de municípios. O endereço da página guarda o município, para você compartilhar.
          </p>
        </nav>

        <div className="min-w-0 space-y-8">
          <CitySummary city={city} />
          <ExecucaoHistory key={`evolucao-${city.ibge}`} history={history} cities={cities} selectedIbge={city.ibge} />
          <ProjectsTable key={`projetos-${city.ibge}`} projects={cityProjects} cityName={city.name} />
        </div>
      </section>

      <section className="container mx-auto mt-10 px-4" aria-labelledby="todos">
        <h2 id="todos" className="mb-3 text-xl font-bold text-gray-800">
          Todos os municípios
        </h2>
        <CitiesTable cities={cities} selectedIbge={city.ibge} />
      </section>

      <section id="metodo" className="container mx-auto mb-12 mt-10 scroll-mt-20 px-4" aria-labelledby="como-medimos">
        <h2 id="como-medimos" className="text-xl font-bold text-gray-800">
          Como medimos
        </h2>
        <dl className="mt-4 grid max-w-5xl grid-cols-1 gap-x-12 gap-y-5 md:grid-cols-2">
          {[
            [
              "De onde vem",
              "Do OpenStreetMap, lido toda semana: as rotas do PDC e todo trecho de ciclovia, ciclofaixa, ciclorrota ou calçada compartilhada nos 14 municípios da RMR.",
            ],
            [
              "O que conta como implantado",
              "Um trecho previsto no PDC conta como implantado quando existe estrutura cicloviária nele, mesmo que de outra tipologia. Quando a tipologia é a prevista, aparece como \"implantado como previsto\".",
            ],
            [
              "Vias de pista dupla",
              "No mapa elas são duas linhas, mas no plano são uma via só. Para não contar em dobro, cada uma das duas pistas vale metade do comprimento.",
            ],
            [
              "Limites",
              "O que ninguém mapeou no OpenStreetMap não aparece aqui: uma estrutura recém-construída só entra depois que alguém a registra.",
            ],
          ].map(([term, text]) => (
            <div key={term}>
              <dt className="font-semibold text-gray-900">{term}</dt>
              <dd className="mt-1 max-w-prose leading-relaxed text-gray-700">{text}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-sm">
          <a href="/api/execucao-cicloviaria/trechos" className="font-medium text-ameciclo underline underline-offset-2 hover:opacity-80" download="trechos-cicloviarios-rmr.geojson">
            Baixar os trechos (GeoJSON)
          </a>
          <span className="text-gray-500"> · cada trecho com a sua situação, atualizado toda semana.</span>
        </p>
      </section>
    </>
  );
}

function CitySummary({ city }: { city: CyclingCityStats }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800">{city.name}</h2>
      <p className="mb-4 mt-1 text-sm text-gray-600">
        {city.plannedKm > 0 ? (
          <>
            <span className="font-semibold tabular-nums text-gray-900">{percent(city.percent)}</span> do PDC implantado: {km(city.executedInPdcKm)} de{" "}
            {km(city.plannedKm)}.
          </>
        ) : (
          "O PDC não prevê estrutura neste município."
        )}
        {city.outsidePdcKm > 0 && ` Mais ${km(city.outsidePdcKm)} de estrutura existente fora do PDC.`}
      </p>
      {city.plannedKm > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <StatusBar designatedKm={city.designatedKm} undesignatedKm={city.undesignatedKm} notExecutedKm={city.notExecutedKm} />
        </div>
      )}
    </div>
  );
}
