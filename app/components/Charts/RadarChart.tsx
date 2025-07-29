import { useEffect, useState } from "react";

let Highcharts: any;
let HighchartsReact: any;

export function RadarChart({ series, categories, title="", subtitle="" }: any) {
  const [chartsLoaded, setChartsLoaded] = useState(false);

  useEffect(() => {
    const loadHighcharts = async () => {
      if (typeof window !== "undefined") {
        const HighchartsModule = await import("highcharts");
        const HighchartsReactModule = await import("highcharts-react-official");
        const HighchartsExporting = await import("highcharts/modules/exporting");
        const HighchartsMore = await import("highcharts/highcharts-more");
        
        Highcharts = HighchartsModule.default;
        HighchartsReact = HighchartsReactModule.default;
        
        HighchartsExporting.default(Highcharts);
        HighchartsMore.default(Highcharts);
        
        setChartsLoaded(true);
      }
    };
    
    loadHighcharts();
  }, []);

  if (!chartsLoaded) {
    return <div className="w-full p-6 h-96 flex items-center justify-center">Carregando gráfico...</div>;
  }
  function getRadarOptions(series: any, categories: any) {
    return {
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
        //      startAngle: 0,
        //     endAngle: 120
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
  }
  return (
    <div className="w-full p-6">
      <HighchartsReact
        highcharts={Highcharts}
        options={getRadarOptions(series, categories)}
      />
    </div>
  );
}
