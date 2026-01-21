import { useEffect, useState } from "react";

let Highcharts: any;
let HighchartsReact: any;

interface ConcentrationChartProps {
  data: Array<{
    top: number;
    sinistros: number;
    sinistros_acum: number;
    km_acum: number;
    percentual: number;
    percentual_acum: number;
  }>;
}

export default function ConcentrationChart({ data }: ConcentrationChartProps) {
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

  // Usar dados acumulativos já calculados pela API
  const chartData = data.map((item) => ({
    name: `Top ${item.top}`,
    y: item.percentual_acum,
    sinistros: item.sinistros,
    sinistros_acum: item.sinistros_acum,
    km_acum: item.km_acum,
    individual: item.percentual
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
      text: "Concentração de Sinistros por Ranking de Vias",
    },
    subtitle: {
      text: "Percentual acumulativo dos sinistros nas vias mais perigosas"
    },
    xAxis: {
      title: {
        text: "Ranking das Vias"
      },
      categories: chartData.map(item => item.name)
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
        return `<b>${point.category}</b><br/>
                Percentual acumulativo: <b>${point.y.toFixed(2)}%</b><br/>
                Sinistros acumulados: <b>${point.sinistros_acum.toLocaleString()}</b><br/>
                Km acumulados: <b>${point.km_acum.toFixed(1)} km</b><br/>
                Sinistros individuais: <b>${point.sinistros}</b><br/>
                Percentual individual: <b>${point.individual.toFixed(2)}%</b>`;
      }
    },
    series: [{
      name: "Concentração",
      data: chartData,
      color: "#008080",
      marker: {
        enabled: true,
        radius: 4
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
          <strong>Interpretação:</strong> Este gráfico mostra como os sinistros se concentram 
          em poucas vias. As primeiras {Math.min(10, data.length)} vias mais perigosas 
          concentram {data[Math.min(9, data.length - 1)]?.percentual_acum.toFixed(1)}% de todos os sinistros.
        </p>
      </div>
    </div>
  );
}