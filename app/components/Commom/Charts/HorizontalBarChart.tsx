import { useEffect, useState } from "react";
import { Users } from "lucide-react";

let Highcharts: any;
let HighchartsReact: any;

export default function HorizontalBarChart({title, yAxisTitle = "Quantidade", series, genderFilter, onGenderChange}: any) {
  const [chartsLoaded, setChartsLoaded] = useState(false);
  const [dynamicTotal, setDynamicTotal] = useState(0);
  const [chartInstance, setChartInstance] = useState<any>(null);

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

  useEffect(() => {
    const totalCount = series.reduce((sum: number, s: any) => {
      return sum + s.data.reduce((dataSum: number, d: any) => dataSum + (d.y || 0), 0);
    }, 0);
    setDynamicTotal(totalCount);
  }, [series]);

  const updateTotal = () => {
    if (chartInstance) {
      let total = 0;
      chartInstance.series.forEach((serie: any) => {
        if (serie.visible) {
          serie.data.forEach((point: any) => {
            total += point.y || 0;
          });
        }
      });
      setDynamicTotal(total);
    }
  };

  if (!chartsLoaded) {
    return <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-96 flex items-center justify-center">Carregando gráfico...</div>;
  }

  const getLabel = () => {
    if (genderFilter === 'Masculino') return 'Masculino';
    if (genderFilter === 'Feminino') return 'Feminino';
    return 'Todos';
  };

const options = {
    chart: {
      type: "bar",
      marginLeft: 120,
      style: {
        fontFamily: 'inherit'
      },
      events: {
        load: function(this: any) {
          setChartInstance(this);
        }
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
        text: `${yAxisTitle} (${dynamicTotal})`,
      },
    },
    plotOptions: {
      series: {
        events: {
          legendItemClick: function() {
            setTimeout(updateTotal, 10);
          }
        }
      }
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <HighchartsReact highcharts={Highcharts} options={options} />
      {onGenderChange && (
        <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">{getLabel()}</span>
          <div className="flex gap-1 border border-gray-300 rounded p-1">
            <button
              onClick={() => onGenderChange('all')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                genderFilter === 'all'
                  ? 'bg-gray-200 text-gray-700'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Todos"
            >
              <Users size={14} />
            </button>
            <button
              onClick={() => onGenderChange('Masculino')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                genderFilter === 'Masculino'
                  ? 'bg-gray-200 text-gray-700'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Masculino"
            >
              M
            </button>
            <button
              onClick={() => onGenderChange('Feminino')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                genderFilter === 'Feminino'
                  ? 'bg-gray-200 text-gray-700'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Feminino"
            >
              F
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
