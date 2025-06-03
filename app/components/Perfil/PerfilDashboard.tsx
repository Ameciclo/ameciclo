/* app/routes/perfil.tsx */
import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "@remix-run/node";
import {
  useLoaderData,
  useFetcher,
  Link, // (<‑‑ continua no código mesmo que não use ainda)
} from "@remix-run/react";
import React, { useEffect, useState } from "react";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import {
  getFiltersKeys,
  getHistogramData,
  getInicialFilters,
} from "~/services/utils";
import HorizontalBarChart from "../Charts/HorizontalBarChart";

/* -------------------------------------------------------- */
/* ---------------------- Utilidades ---------------------- */
/* -------------------------------------------------------- */
type Filtro = { key: string; value: string; checked: boolean };

async function fetchDataWithFilters(filters: Filtro[]) {
  const res = await fetch(
    "https://api.perfil.ameciclo.org/v1/cyclist-profile/summary/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters.filter((f) => f.checked)),
    },
  );

  if (!res.ok) throw new Error(`Falha ao buscar dados: ${res.statusText}`);
  const { data } = (await res.json()) as { data: any };
  return data;
}

/* -------------------------------------------------------- */
/* ------------------------ Loader ------------------------ */
/* -------------------------------------------------------- */
export async function loader({}: LoaderFunctionArgs) {
  const initialFilters = getInicialFilters();
  const dataset = await fetchDataWithFilters(initialFilters);
  return json({ initialFilters, dataset });
}

/* -------------------------------------------------------- */
/* ------------------------ Action ------------------------ */
/* -------------------------------------------------------- */
export async function action({ request }: ActionFunctionArgs) {
  const filters = (await request.json()) as Filtro[];
  const dataset = await fetchDataWithFilters(filters);
  return json({ dataset });
}

/* -------------------------------------------------------- */
/* ------------------ Componente – UI --------------------- */
/* -------------------------------------------------------- */
export default function PerfilDashboard() {
  const { initialFilters, dataset } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  /* -------- estados dos filtros -------- */
  const [filters, setFilters] = useState<Filtro[]>(initialFilters);

  /* -------- estados do dataset --------- */
  const [dayData, setDayData] = useState(dataset.dayAggregate);
  const [yearData, setYearData] = useState(dataset.yearAggregate);
  const [needData, setNeedData] = useState(dataset.needAggregate);
  const [startData, setStartData] = useState(dataset.startAggregate);
  const [continueData, setContinueData] = useState(dataset.continueAggregate);
  const [issueData, setIssueData] = useState(dataset.issueAggregate);
  const [collisionData, setCollisionData] = useState(dataset.collisionAggregate);
  const [distanceOptions, setDistanceOptions] = useState(
    getHistogramData(dataset.distances),
  );

  /* --------‑‑ controla quando os módulos do Highcharts já estão prontos -------- */
  const [hcReady, setHcReady] = useState(false);

  /* -------------------------------------------------------------------------- */
  /* Carrega módulos do Highcharts **uma única vez** no client e libera render  */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return; // só no browser

    Promise.all([
      import("highcharts/highcharts-more"),
      import("highcharts/modules/histogram-bellcurve"),
      import("highcharts/modules/exporting"),
      import("highcharts/modules/accessibility"),
    ]).then(([More, Histogram, Exporting, Accessibility]) => {
      More.default(Highcharts);
      Histogram.default(Highcharts);
      Exporting.default(Highcharts);
      Accessibility.default?.(Highcharts);
      setHcReady(true);
    });
  }, []);

  /* -------------------------------------------------------------------------- */
  /* Ajusta o tamanho dos gráficos quando a janela muda – só depois de prontos  */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!hcReady) return;
    const handle = setTimeout(() => {
      Highcharts.charts.forEach((c) => c && c.reflow());
    }, 300);

    window.addEventListener("resize", () => Highcharts.charts.forEach((c) => c && c.reflow()));
    return () => {
      clearTimeout(handle);
      window.removeEventListener("resize", () => {});
    };
  }, [hcReady]);

  /* -------------------------------------------------------------------------- */
  /* Atualiza os datasets quando o fetcher retorna                             */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.dataset) {
      const d = fetcher.data.dataset;
      setDayData(d.dayAggregate);
      setYearData(d.yearAggregate);
      setNeedData(d.needAggregate);
      setStartData(d.startAggregate);
      setContinueData(d.continueAggregate);
      setIssueData(d.issueAggregate);
      setCollisionData(d.collisionAggregate);
      setDistanceOptions(getHistogramData(d.distances));
    }
  }, [fetcher.state, fetcher.data]);

  /* ---------------- helpers ---------------- */
  const submitFilters = () =>
    fetcher.submit(JSON.stringify(filters), {
      method: "post",
      encType: "application/json",
    });

  const clearFilters = () =>
    setFilters((prev) => prev.map((f) => ({ ...f, checked: false })));

  const toggleFilter = (f: Filtro) =>
    setFilters((prev) =>
      prev.map((item) =>
        item.value === f.value ? { ...item, checked: !item.checked } : item,
      ),
    );

  /* ------------ opções dos gráficos em barra ------------ */
  const barOptions = [
    {
      title:
        "Quantos dias da semana costuma utilizar a bicicleta como meio de transporte",
      series: dayData,
    },
    {
      title: "Há quanto tempo utiliza a bicicleta como meio de transporte",
      series: yearData,
    },
    { title: "O que faria você pedalar mais?", series: needData },
    { title: "Qual foi a sua motivação para começar?", series: startData },
    {
      title: "Qual foi a sua motivação para continuar a pedalar?",
      series: continueData,
    },
    { title: "Qual o seu maior problema ao pedalar?", series: issueData },
    { title: "Já sofreu algum tipo de colisão?", series: collisionData },
  ];

  /* -------------------------------------------------------------------------- */
  /* ------------------------------- Render ----------------------------------- */
  /* -------------------------------------------------------------------------- */
  if (!hcReady) {
    // mantemos os hooks executados, mas devolvemos um placeholder
    return (
      <div className="text-center font-semibold py-16">
        Carregando gráficos…
      </div>
    );
  }

  return (
    <>
      {/* ---------- Filtros ---------- */}
      <section className="container mx-auto shadow-md p-10">
        <h2 className="font-bold text-3xl mt-5">Selecione seus filtros</h2>

        <div className="border-gray-200 border p-8 flex flex-col">
          {getFiltersKeys().map((key) => (
            <div
              key={key.key}
              className="flex flex-wrap items-center space-y-4"
            >
              <h3 className="font-bold text-xl mt-5">{key.title}</h3>
              <span className="mx-2" />
              {filters
                .filter((f) => f.key === key.key)
                .map((f) => (
                  <ToggleButton
                    key={f.value}
                    value={f.value}
                    checked={f.checked}
                    onChange={() => toggleFilter(f)}
                  />
                ))}
            </div>
          ))}
        </div>

        <div className="flex flex-row justify-center items-center mt-8 space-x-4">
          <button
            onClick={submitFilters}
            className="toggle-btn border border-teal-500 text-teal-500 hover:bg-ameciclo hover:text-white rounded px-4 py-2 mt-2 outline-none"
          >
            Aplicar Filtros
          </button>
          <button
            onClick={clearFilters}
            className="toggle-btn border border-teal-500 text-teal-500 hover:bg-ameciclo hover:text-white rounded px-4 py-2 mt-2 outline-none"
          >
            Limpar Filtros
          </button>
        </div>
      </section>

      {/* ---------- Gráficos ---------- */}
      <section className="container mx-auto grid grid-cols-1 sm:grid-cols-2 auto-rows-auto gap-10 my-10">
        {barOptions.map((opt) => (
          <HorizontalBarChart key={opt.title} {...opt} />
        ))}

        <div className="shadow-2xl rounded p-10 text-center">
          <HighchartsReact
            highcharts={Highcharts}
            options={distanceOptions}
          />
        </div>
      </section>
    </>
  );
}

/* -------------------------------------------------------- */
/* -------------------- ToggleButton ---------------------- */
/* -------------------------------------------------------- */
interface ToggleProps {
  value: string;
  checked: boolean;
  onChange: () => void;
}

function ToggleButton({ value, checked, onChange }: ToggleProps) {
  return (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="hidden"
      />
      <span
        className={`toggle-btn rounded-3xl flex w-32 h-10 items-center justify-center border ${
          checked ? "bg-red-500 text-white" : "bg-white text-gray-600"
        } hover:bg-ameciclo hover:text-white`}
      >
        {value}
      </span>
    </label>
  );
}
