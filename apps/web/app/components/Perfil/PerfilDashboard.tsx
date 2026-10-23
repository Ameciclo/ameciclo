import { useEffect, useMemo, useRef, useState } from "react";
import { Users, Filter, FileText, Download } from "lucide-react";
import {
  PERFIL_RACES,
  type PerfilCell,
  type PerfilCube,
  type PerfilHistogramCell,
  type PerfilSurveyOption,
} from "@ameciclo/db/shared";
import {
  buildHistogram,
  buildSeries,
  type PerfilChartDef as ChartDef,
  type PerfilGender as Gender,
  type PerfilSelection as Selection,
} from "@ameciclo/db/perfil-series";
import HorizontalBarChart from "~/components/Commom/Charts/HorizontalBarChart";

// The server sends counts already crossed by gender and color/race (never
// interviews), so filtering here is just choosing which cells to add up. The
// arithmetic lives in @ameciclo/db/perfil-series, where it is tested.

const COLOR_RACE_COLORS: Record<string, string> = {
  Amarela: "#FFD700",
  Branca: "#B0B0B0",
  Indígena: "#8B4513",
  Parda: "#D2691E",
  Preta: "#2C2C2C",
  // Used for surveys that did not ask color/race: everyone in one series.
  Todos: "#6DBFAC",
};

const colorOf = (name: string) => COLOR_RACE_COLORS[name] ?? "#999";

const CHARTS: ChartDef[] = [
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

function histogramOptions(cells: PerfilHistogramCell[], sel: Selection) {
  const histogram = buildHistogram(cells, sel);
  if (!histogram) return null;
  return {
    chart: { type: "column" },
    title: { text: "Quanto tempo você leva?" },
    subtitle: { text: "Tempo do trajeto mais frequente, em grupos de 5 minutos" },
    xAxis: { categories: histogram.categories, title: { text: "Minutos" } },
    yAxis: { title: { text: "Quantidade" } },
    plotOptions: { column: { pointPadding: 0.05, groupPadding: 0.08 } },
    series: histogram.series.map((s) => ({ ...s, type: "column" as const, color: colorOf(s.name) })),
    credits: { enabled: false },
  };
}

function GenderToggle({ value, onChange }: { value: Gender; onChange: (g: Gender) => void }) {
  const button = (g: Gender, label: string, content: React.ReactNode, bold: boolean) => (
    <button
      onClick={() => onChange(g)}
      className={`px-2 py-1 rounded text-xs transition-colors ${bold ? "font-semibold" : ""} ${
        value === g ? "bg-gray-200 text-gray-700" : "text-gray-400 hover:text-gray-600"
      }`}
      title={label}
    >
      {content}
    </button>
  );
  return (
    <div className="flex gap-1 border border-gray-300 rounded-sm p-1">
      {button("all", "Todos", <Users size={14} />, false)}
      {button("Masculino", "Masculino", "M", true)}
      {button("Feminino", "Feminino", "F", true)}
    </div>
  );
}

function NoData({ title, message = "Sem dados disponíveis", children }: { title: string; message?: string; children?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-8 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
      <div className="h-64 flex flex-col items-center justify-center gap-3">
        <p className="text-gray-500 text-sm">{message}</p>
        {children}
      </div>
    </div>
  );
}

function ChartWithGenderFilter({ def, cells, selection }: { def: ChartDef; cells: PerfilCell[]; selection: Selection }) {
  // Each chart can narrow by gender on its own; the global filter resets it.
  const [gender, setGender] = useState<Gender>(selection.gender);
  useEffect(() => setGender(selection.gender), [selection.gender]);

  const series = useMemo(
    () => buildSeries(cells, def, { ...selection, gender }).map((x) => ({ ...x, color: colorOf(x.name) })),
    [cells, def, selection, gender],
  );

  if (series.length === 0) {
    return (
      <NoData title={def.title} message="Sem dados para este recorte">
        {gender !== "all" && (
          <button onClick={() => setGender("all")} className="text-xs text-ameciclo underline">
            Ver todos os gêneros
          </button>
        )}
      </NoData>
    );
  }
  return <HorizontalBarChart title={def.title} series={series} genderFilter={gender} onGenderChange={setGender} />;
}

function HistogramCard({ cells, selection }: { cells: PerfilHistogramCell[]; selection: Selection }) {
  const [gender, setGender] = useState<Gender>(selection.gender);
  useEffect(() => setGender(selection.gender), [selection.gender]);
  const [hc, setHc] = useState<{ Highcharts: any; HighchartsReact: any } | null>(null);

  useEffect(() => {
    let alive = true;
    void Promise.all([import("highcharts"), import("highcharts-react-official")]).then(([h, r]) => {
      if (alive) setHc({ Highcharts: h.default, HighchartsReact: r.default });
    });
    return () => {
      alive = false;
    };
  }, []);

  const options = useMemo(() => histogramOptions(cells, { ...selection, gender }), [cells, selection, gender]);

  return (
    <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {!hc ? (
        <div className="h-96 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-[#6DBFAC] rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 text-sm">Carregando gráfico...</p>
        </div>
      ) : options ? (
        <hc.HighchartsReact highcharts={hc.Highcharts} options={options} />
      ) : (
        <div className="h-96 flex flex-col items-center justify-center">
          <p className="text-gray-500 text-sm">Sem dados para este recorte</p>
        </div>
      )}
      <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-gray-200">
        <span className="text-sm text-gray-600">{gender === "all" ? "Todos" : gender}</span>
        <GenderToggle value={gender} onChange={setGender} />
      </div>
    </div>
  );
}

function EditionPicker({
  surveys,
  current,
  onSelect,
}: {
  surveys: PerfilSurveyOption[];
  current: PerfilCube["survey"];
  onSelect: (survey: PerfilSurveyOption) => void;
}) {
  const cities = useMemo(
    () => [...new Set(surveys.map((s) => s.city))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [surveys],
  );
  const years = surveys.filter((s) => s.city === current.city).sort((a, b) => a.year - b.year);

  const pickCity = (city: string) => {
    // surveys come newest first, so the first match is the city's latest edition
    const latest = surveys.find((s) => s.city === city);
    if (latest) onSelect(latest);
  };

  return (
    <section className="container mx-auto px-4 pt-8">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <span className="font-medium">Cidade</span>
          <select
            value={current.city}
            onChange={(e) => pickCity(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span className="font-medium">Edição</span>
          <div className="flex flex-wrap gap-2">
            {years.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelect(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  s.id === current.id ? "bg-ameciclo text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s.year}
              </button>
            ))}
          </div>
        </div>
        <span className="text-sm text-gray-500">{current.interviews.toLocaleString("pt-BR")} entrevistas</span>
      </div>
      {current.notes && (
        <details className="mt-3 text-sm text-gray-600">
          <summary className="cursor-pointer text-gray-700">Como esta edição difere das outras</summary>
          <p className="mt-2 leading-relaxed">{current.notes}</p>
        </details>
      )}
    </section>
  );
}

function PerfilClientSide({
  surveys,
  cube,
  onSelect,
}: {
  surveys: PerfilSurveyOption[];
  cube: PerfilCube | null;
  onSelect: (survey: PerfilSurveyOption) => void;
}) {
  const [races, setRaces] = useState<string[]>([]);
  const [globalGender, setGlobalGender] = useState<Gender>("all");
  const [isSticky, setIsSticky] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const hasRace = cube?.hasRace ?? false;

  useEffect(() => {
    const handleScroll = () => {
      if (filterRef.current) setIsSticky(filterRef.current.getBoundingClientRect().top <= 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // A different edition may not have the same races; start over.
  const surveyId = cube?.survey.id;
  useEffect(() => setRaces([]), [surveyId]);

  const selection = useMemo<Selection>(() => ({ gender: globalGender, races, hasRace }), [globalGender, races, hasRace]);

  const toggleRace = (race: string) =>
    setRaces((prev) => (prev.includes(race) ? prev.filter((r) => r !== race) : [...prev, race]));

  return (
    <>
      {cube && <EditionPicker surveys={surveys} current={cube.survey} onSelect={onSelect} />}

      <div ref={filterRef} className="mt-4">
        <section
          className={`transition-all duration-300 ${
            isSticky ? "fixed top-14 left-0 right-0 z-40 bg-white shadow-lg border-b border-gray-200" : "relative bg-gray-50"
          }`}
          role="region"
          aria-label={isSticky ? "Barra de filtros fixada no topo da tela" : "Barra de filtros"}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filtros</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Gênero:</span>
                  <GenderToggle value={globalGender} onChange={setGlobalGender} />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Cor/Raça:</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {PERFIL_RACES.map((race) => (
                      <button
                        key={race}
                        onClick={() => toggleRace(race)}
                        disabled={!hasRace}
                        title={hasRace ? undefined : "Esta edição não perguntou a cor ou raça"}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          races.includes(race) ? "bg-ameciclo text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        } disabled:opacity-50`}
                      >
                        {race}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {isSticky && <div className="h-16"></div>}

      {cube ? (
        <>
          <section className="container mx-auto grid grid-cols-1 sm:grid-cols-2 auto-rows-auto gap-6 my-10 px-4">
            {CHARTS.map((def) => {
              const cells = cube.questions[def.key];
              return cells && cells.length > 0 ? (
                <ChartWithGenderFilter key={`${cube.survey.id}-${def.key}`} def={def} cells={cells} selection={selection} />
              ) : (
                <NoData key={def.key} title={def.title} message="Esta pergunta não foi feita nesta edição" />
              );
            })}
            {cube.histogram.length > 0 ? (
              <HistogramCard key={`${cube.survey.id}-histogram`} cells={cube.histogram} selection={selection} />
            ) : (
              <NoData title="Quanto tempo você leva?" message="Esta pergunta não foi feita nesta edição" />
            )}
          </section>
          <p className="container mx-auto px-4 -mt-4 mb-10 text-xs text-gray-500">
            Os gráficos mostram contagens de respostas. Grupos com menos de {cube.minCell} respostas em um cruzamento
            (por exemplo, mulheres indígenas que responderam a uma pergunta) não são exibidos, por isso os totais podem
            ser um pouco menores que o número de entrevistas.
          </p>
        </>
      ) : (
        <section className="container mx-auto px-4 my-10">
          <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-10 text-center">
            <p className="text-gray-700">Os dados da pesquisa estão indisponíveis no momento.</p>
            <p className="text-sm text-gray-500 mt-1">Tente novamente em alguns instantes.</p>
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 my-16">
        <div className="bg-linear-to-br from-ameciclo/5 to-ameciclo/10 rounded-xl p-8 border border-ameciclo/20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="text-ameciclo" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Estudos e Análises Completas</h2>
              <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                Acesse relatórios técnicos, pesquisas históricas e análises detalhadas sobre mobilidade por bicicleta<br />
                no Recife produzidos pela Ameciclo ao longo dos anos
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="https://drive.google.com/uc?export=download&id=1Ww5YKKtK7loXFg8ELxgm7kkalkI3A0rk"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg p-5 border border-gray-200 hover:border-ameciclo hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 group-hover:text-ameciclo transition-colors">Evolução de Perfil Ciclista Recife - PE</h3>
                  <p className="text-sm text-gray-500 mt-1">2025</p>
                </div>
                <Download className="text-gray-400 group-hover:text-ameciclo transition-colors" size={20} />
              </div>
            </a>

            <a
              href="https://drive.google.com/uc?export=download&id=1yW7sEU-y4BpIdZZeg1LpU0J2buaAuBWB"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg p-5 border border-gray-200 hover:border-ameciclo hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 group-hover:text-ameciclo transition-colors">Pesquisa Perfil do Ciclista</h3>
                  <p className="text-sm text-gray-500 mt-1">2018</p>
                </div>
                <Download className="text-gray-400 group-hover:text-ameciclo transition-colors" size={20} />
              </div>
            </a>

            <a
              href="https://drive.google.com/uc?export=download&id=0BzQ5vNvMmIF4YmRVRnFWd1BTNG8"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg p-5 border border-gray-200 hover:border-ameciclo hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 group-hover:text-ameciclo transition-colors">Pesquisa Perfil do Ciclista</h3>
                  <p className="text-sm text-gray-500 mt-1">2015</p>
                </div>
                <Download className="text-gray-400 group-hover:text-ameciclo transition-colors" size={20} />
              </div>
            </a>

            <a
              href="https://drive.google.com/uc?export=download&id=0BxR5Ri6g5X_ZN0ZaVzdXYTdQSUk"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg p-5 border border-gray-200 hover:border-ameciclo hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 group-hover:text-ameciclo transition-colors">Mobilidade por Bicicleta no Recife</h3>
                  <p className="text-sm text-gray-500 mt-1">Diagnóstico e ações estratégicas (2013)</p>
                </div>
                <Download className="text-gray-400 group-hover:text-ameciclo transition-colors" size={20} />
              </div>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export default PerfilClientSide;
