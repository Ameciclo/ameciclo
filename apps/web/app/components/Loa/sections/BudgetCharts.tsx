import Chart from "react-google-charts";
import { ChartLoading } from "~/components/Dom/LoaDataLoading";

interface BudgetChartsProps {
  hasData: boolean;
  data: any;
}

export function BudgetCharts({ hasData, data }: BudgetChartsProps) {
  if (!hasData) {
    return (
      <>
        <ChartLoading />
        <ChartLoading />
      </>
    );
  }

  const chartOptions = {
    colors: ['#38A169', '#3182CE'],
    accessibility: {
      highContrastMode: true
    },
    legend: {
      position: 'bottom',
      alignment: 'center',
      textStyle: {
        fontSize: 13,
        color: '#333333'
      }
    },
    hAxis: {
      textStyle: {
        fontSize: 13,
        color: '#333333'
      }
    },
    vAxis: {
      textStyle: {
        fontSize: 13,
        color: '#333333'
      },
      format: 'short'
    },
    chartArea: {
      width: '80%',
      height: '70%'
    }
  };

  const totalBudgetOptions = {
    ...chartOptions,
    colors: ['#3182CE'],
    chart: {
      subtitle: "Orçamento total 2020-2025",
    }
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
            <Chart
              chartType="Bar"
              data={[
                ["Ano", "Orçado (R$)", 'Executado (R$)'],
                ['2020', data.totalValueBudgeted2020, data.totalValueExecuted2020],
                ['2021', data.totalValueBudgeted2021, data.totalValueExecuted2021],
                ['2022', data.totalValueBudgeted2022, data.totalValueExecuted2022],
                ['2023', data.totalValueBudgeted2023, data.totalValueExecuted2023],
                ['2024', data.totalValueBudgeted2024, data.totalValueExecuted2024],
                ['2025', data.totalValueBudgeted2025, data.totalValueExecuted2025],
              ]}
              width="100%"
              height="300px"
              options={{
                ...chartOptions,
                chart: {
                  subtitle: "Comparativo anual 2020-2025",
                }
              }}
              legendToggle
            />
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
            <Chart
              chartType="Bar"
              data={[
                ["Ano", "Total (R$)"],
                ['2020', data.totalValueActions2020],
                ['2021', data.totalValueActions2021],
                ['2022', data.totalValueActions2022],
                ['2023', data.totalValueActions2023],
                ['2024', data.totalValueActions2024],
                ['2025', data.totalValueActions2025],
              ]}
              width="100%"
              height="300px"
              options={totalBudgetOptions}
              legendToggle
            />
          </div>
        </div>
      </section>
    </>
  );
}
