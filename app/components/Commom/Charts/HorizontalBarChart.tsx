import { useEffect, useState } from "react";

let Highcharts: any;
let HighchartsReact: any;

export default function HorizontalBarChart({title, yAxisTitle = "Quantidade", series}: any) {
  const [chartsLoaded, setChartsLoaded] = useState(false);

  useEffect(() => {
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

  if (!chartsLoaded) {
    return <div className="shadow-2xl rounded p-4 md:p-10 text-center h-96 flex items-center justify-center">Carregando gráfico...</div>;
  }

const options = {
    chart: {
      type: "bar",
      marginLeft: 120,
      style: {
        fontFamily: 'inherit'
      }
    },
    title: {
      text: title,
    },
    xAxis: {
      type: "category",
    },
    yAxis: {
      title: {
        text: yAxisTitle,
      },
    },
    series: series,
    responsive: {
      rules: [{
        condition: {
          maxWidth: 500
        },
        chartOptions: {
          chart: {
            marginLeft: 80
          },
          legend: {
            align: 'center'
          }
        }
      }]
    },
    credits: {
      enabled: false,
    },
  };

  return (
    <div className="shadow-2xl rounded p-4 md:p-10 text-center">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}
