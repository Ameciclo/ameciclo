import { useEffect, useState } from "react";

let Highcharts: any;
let HighchartsReact: any;

interface ConcentrationByKmChartProps {
  data: Array<{
    top: number;
    sinistros: number;
    sinistros_acum: number;
    km_acum: number;
    percentual_acum: number;
  }>;
}

export default function ConcentrationByKmChart({ data }: ConcentrationByKmChartProps) {
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

  if (!chartsLoaded || !data || data.length === 0) {
    return (
      <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
        <span className="text-gray-500">
          {!chartsLoaded ? "Carregando gráfico..." : "Nenhum dado disponível"}
        </span>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    x: item.km_acum,
    y: item.percentual_acum,
    sinistros: item.sinistros,
    sinistros_acum: item.sinistros_acum,
    ranking: item.top
  }));

  // Calcular valor máximo para eixo Y dinâmico
  const maxValue = Math.max(...data.map(item => item.percentual_acum));
  const yAxisMax = Math.ceil(maxValue / 5) * 5; // Arredonda para múltiplo de 5

  const options = {
    chart: {
      type: "line",
      style: {
        fontFamily: 'inherit'
      }
    },
    title: {
      text: "Concentração por Extensão Acumulativa",
    },
    subtitle: {
      text: "Percentual de sinistros vs quilômetros de vias analisadas"
    },
    xAxis: {
      title: {
        text: "Quilômetros Acumulativos (km)"
      },
      type: "linear"
    },
    yAxis: {
      title: {
        text: "Percentual Acumulativo (%)"
      },
      max: yAxisMax,
      labels: {
        format: '{value}%'
      }
    },
    tooltip: {
      formatter: function() {
        const point = this.point as any;
        return `<b>Top ${point.ranking}</b><br/>
                Extensão acumulativa: <b>${point.x.toFixed(1)} km</b><br/>
                Percentual acumulativo: <b>${point.y.toFixed(2)}%</b><br/>
                Sinistros acumulados: <b>${point.sinistros_acum.toLocaleString()}</b><br/>
                Sinistros individuais: <b>${point.sinistros}</b>`;
      }
    },
    series: [{
      name: "Concentração por Extensão",
      data: chartData,
      color: "#DC2626",
      marker: {
        enabled: true,
        radius: 3
      }
    }],
    plotOptions: {
      line: {
        dataLabels: {
          enabled: false
        }
      }
    },
    responsive: {
      rules: [{
        condition: {
          maxWidth: 500
        },
        chartOptions: {
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
    <div className="bg-white rounded-lg shadow-lg p-6">
      <HighchartsReact highcharts={Highcharts} options={options} />
      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Interpretação:</strong> Este gráfico mostra a eficiência da concentração 
          de sinistros. Em apenas {data[Math.min(9, data.length - 1)]?.km_acum.toFixed(1)} km 
          das vias mais perigosas ({((data[Math.min(9, data.length - 1)]?.km_acum / 2500) * 100).toFixed(1)}% da extensão total), 
          concentram-se {data[Math.min(9, data.length - 1)]?.percentual_acum.toFixed(1)}% dos sinistros.
        </p>
      </div>
    </div>
  );
}