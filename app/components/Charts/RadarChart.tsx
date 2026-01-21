import { useEffect, useState } from "react";
import type HighchartsReact from "highcharts-react-official";
import LoadingSpinner from "../Ideciclo/loading/graphLoading";

export function RadarChart({ series, categories, title = "", subtitle = "" }: any) {
  const [chartProps, setChartProps] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);


  useEffect(() => {
    // Este useEffect roda apenas uma vez no cliente, após a hidratação.
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Este useEffect roda quando isClient se torna true e quando as props mudam.
    if (isClient) {
      const initChart = async () => {
        try {
          const Highcharts = (await import("highcharts")).default;
          const HighchartsReactComponent = (await import("highcharts-react-official")).default;
          const ExportingModule = await import("highcharts/modules/exporting");
          if (typeof ExportingModule === 'function') {
            ExportingModule(Highcharts);
          } else if (ExportingModule && typeof ExportingModule.default === 'function') {
            ExportingModule.default(Highcharts);
          }

          const HighchartsMoreModule = await import("highcharts/highcharts-more");
          if (typeof HighchartsMoreModule === 'function') {
            HighchartsMoreModule(Highcharts);
          } else if (HighchartsMoreModule && typeof HighchartsMoreModule.default === 'function') {
            HighchartsMoreModule.default(Highcharts);
          }

          const options = {
            chart: {
              polar: true,
            },
            credits: {
              enabled: false,
            },
            title: {
              text: title,
            },
            subtitle: {
              text: subtitle,
            },
            pane: {
              size: "70%",
            },
            xAxis: {
              categories: categories,
              tickmarkPlacement: "on",
            },
            yAxis: {
              gridLineInterpolation: "polygon",
              min: 0,
              max: 10,
            },
            tooltip: {
              shared: true,
              pointFormat:
                '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}</b><br/>',
            },
            colors: [
              "#008080",
              "#E02F31",
              "#000000",
              "#DDDF00",
              "#24CBE5",
              "#64E572",
              "#FF9655",
              "#FFF263",
              "#6AF9C4",
            ],
            series: series,
          };

          setChartProps({
            Highcharts: Highcharts,
            Component: HighchartsReactComponent,
            options: options,
          });
        } catch (error) {
          console.error("RadarChart: Erro durante a inicialização do gráfico:", error);
        }
      };

      initChart();
    }
  }, [isClient, series, categories, title, subtitle]);

  if (!isClient || !chartProps || !chartProps.Component) {
    return <div className="w-full p-6 h-full flex items-center justify-center"><LoadingSpinner /></div>;
  }

  const ChartComponent = chartProps.Component;

  return (
    <div className="w-full p-6 h-full">
      <ChartComponent highcharts={chartProps.Highcharts} options={chartProps.options} />
    </div>
  );
}
