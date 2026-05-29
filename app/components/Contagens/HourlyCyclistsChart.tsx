import React from "react";
import { Series } from "typings";

const COLORS = [
  "#008888", "#E02F31", "#24CBE5", "#6AF9C4", "#8B5CF6",
  "#F97316", "#EC4899", "#6366F1", "#14B8A6", "#EAB308", "#06B6D4",
];

let Highcharts: any;
let HighchartsReact: any;

interface HourlyCyclistsChartProps {
  series: Series[];
  hours: number[];
}

export function HourlyCyclistsChart({ series, hours }: HourlyCyclistsChartProps) {
  const [chartsLoaded, setChartsLoaded] = React.useState(false);

  React.useEffect(() => {
    const loadHighcharts = async () => {
      if (typeof window !== "undefined") {
        const HighchartsModule = await import("highcharts");
        const HighchartsReactModule = await import("highcharts-react-official");
        
        Highcharts = HighchartsModule.default;
        HighchartsReact = HighchartsReactModule.default;
        
        setChartsLoaded(true);
      }
    };
    
    loadHighcharts();
  }, []);

  const options = {
    chart: {
      type: "line",
    },
    colors: COLORS,
    legend: {
      enabled: true,
      align: "center",
      verticalAlign: "bottom",
      layout: "horizontal",
      itemStyle: { fontSize: "12px", fontWeight: "normal" },
    },
    plotOptions: {
      line: {
        marker: { enabled: false },
      },
      series: {
        events: {
          legendItemClick: function (this: any) {
            return true;
          },
        },
      },
    },
    tooltip: {
      shared: true,
      headerFormat: "<b>{point.x}h</b><br/>",
      pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>',
    },
    title: {
      text: "Fluxo horário de ciclistas",
    },
    xAxis: {
      type: "category",
      categories: hours,
      title: {
        text: "Hora",
      },
    },
    yAxis: {
      title: {
        text: "Quantidade",
      },
      scrollbar: {
        enabled: true,
      },
    },
    series,

    credits: {
      enabled: true,
    },
  };

  return (
    <section className="container mx-auto grid grid-cols-1 auto-rows-auto gap-10 my-10">
      <div className="shadow-2xl rounded-sm p-10 text-center overflow-x-scroll">
        <div style={{ minWidth: "500px" }}>
          <h2 className="text-gray-600 text-3xl">Quantidade de ciclistas por hora</h2>
          {chartsLoaded ? <HighchartsReact highcharts={Highcharts} options={options} /> : <div className="h-96 flex items-center justify-center">Carregando gráfico...</div>}
        </div>
      </div>
    </section>
  );
}
