import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { ChartLoading } from "~/components/Dom/LoaDataLoading";

interface BudgetChartsProps {
  hasData: boolean;
  data: any;
}

const YEARS = ["2020", "2021", "2022", "2023", "2024", "2025"];

function formatShort(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  if (Math.abs(n) >= 1_000_000_000) return `R$ ${(n / 1_000_000_000).toFixed(1)} Bi`;
  if (Math.abs(n) >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1)} Mi`;
  if (Math.abs(n) >= 1_000) return `R$ ${(n / 1_000).toFixed(1)} Mil`;
  return `R$ ${n.toFixed(0)}`;
}

function formatBRL(n: number): string {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

const baseOptions: Highcharts.Options = {
  chart: { type: "column", height: 300 },
  title: { text: "" },
  xAxis: { categories: YEARS },
  yAxis: {
    title: { text: undefined },
    labels: {
      formatter: function () {
        return formatShort(Number(this.value));
      },
    },
  },
  legend: { align: "center", verticalAlign: "bottom" },
  credits: { enabled: false },
  tooltip: {
    shared: true,
    useHTML: true,
    formatter: function () {
      const lines = [`<b>${this.x}</b>`];
      this.points?.forEach((p) => {
        lines.push(
          `<span style="color:${p.color}">●</span> ${p.series.name}: <b>R$ ${formatBRL(Number(p.y))}</b>`
        );
      });
      return lines.join("<br/>");
    },
  },
};

export function BudgetCharts({ hasData, data }: BudgetChartsProps) {
  if (!hasData) {
    return (
      <>
        <ChartLoading />
        <ChartLoading />
      </>
    );
  }

  const comparativeOptions: Highcharts.Options = {
    ...baseOptions,
    subtitle: { text: "Comparativo anual 2020-2025" },
    series: [
      {
        type: "column",
        name: "Orçado (R$)",
        color: "#38A169",
        data: YEARS.map((y) => Number(data[`totalValueBudgeted${y}`] ?? 0)),
      },
      {
        type: "column",
        name: "Executado (R$)",
        color: "#3182CE",
        data: YEARS.map((y) => Number(data[`totalValueExecuted${y}`] ?? 0)),
      },
    ],
  };

  const totalOptions: Highcharts.Options = {
    ...baseOptions,
    subtitle: { text: "Orçamento total 2020-2025" },
    legend: { enabled: false },
    series: [
      {
        type: "column",
        name: "Total (R$)",
        color: "#3182CE",
        data: YEARS.map((y) => Number(data[`totalValueActions${y}`] ?? 0)),
      },
    ],
  };

  return (
    <>
      <section className="h-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Evolução Orçamentária Climática</h2>
        <p className="text-gray-600 mb-4">
          Análise comparativa dos valores orçados e executados em ações para o clima ao longo dos anos entre 2020 e 2025.
        </p>

        <div className="bg-white rounded-lg shadow-lg p-4 mb-6 flex justify-center">
          <div className="w-full max-w-[500px]">
            <HighchartsReact highcharts={Highcharts} options={comparativeOptions} />
          </div>
        </div>
      </section>

      <section className="h-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Orçamento Total por Ano</h2>
        <p className="text-gray-600 mb-4">
          Evolução do orçamento total do estado para todas as ações entre 2020 e 2025
        </p>

        <div className="bg-white rounded-lg shadow-lg p-4 mb-6 flex justify-center">
          <div className="w-full max-w-[500px]">
            <HighchartsReact highcharts={Highcharts} options={totalOptions} />
          </div>
        </div>
      </section>
    </>
  );
}
