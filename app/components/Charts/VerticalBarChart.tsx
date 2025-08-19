import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import React from "react";

interface VerticalBarChartProps {
  title?: string;
  xAxisTitle?: string;
  yAxisTitle?: string;
  series?: any[];
  data?: any[];
  xKey?: string;
  yKeys?: string[];
  colors?: string[];
}

function VerticalBarChart({
  title, 
  xAxisTitle = "Ano", 
  yAxisTitle = "Quantidade", 
  series,
  data,
  xKey,
  yKeys,
  colors
}: VerticalBarChartProps) {
  // Se data, xKey e yKeys são fornecidos, transformar os dados
  let chartSeries = series;
  
  if (data && xKey && yKeys) {
    const categories = data.map(item => item[xKey]);
    
    chartSeries = yKeys.map((key, index) => ({
      name: key === "atendimento_concluido" ? "Atendimento Concluído" :
            key === "removido_particulares" ? "Removido Particulares" :
            key === "removido_bombeiros" ? "Removido Bombeiros" :
            key === "obito_local" ? "Óbito Local" : key,
      data: data.map(item => item[key] || 0),
      color: colors && colors[index] ? colors[index] : undefined
    }));
    
    const options = {
      chart: {
        type: "column",
      },
      title: {
        text: title || null,
      },
      xAxis: {
        categories: categories,
        title: {
          text: xAxisTitle
        }
      },
      yAxis: {
        title: {
          text: yAxisTitle,
        },
      },
      series: chartSeries,
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          dataLabels: {
            enabled: true,
            formatter: function() {
              // Mostrar apenas o total no topo da pilha
              if (this.point.stackY === this.point.total) {
                return this.point.total;
              }
              return null;
            },
            style: {
              fontWeight: 'bold',
              color: '#000000'
            },
            verticalAlign: 'top',
            y: -20
          }
        }
      }
    };

    return (
      <div className="w-full h-full">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    );
  }

  // Fallback para o formato antigo
  const options = {
    chart: {
      type: "column",
    },
    title: {
      text: title,
    },
    xAxis: {
      type: "category",
      title: {
        text: xAxisTitle
      }
    },
    yAxis: {
      title: {
        text: yAxisTitle,
      },
    },
    series: series,
    credits: {
      enabled: false,
    },
  };

  return (
    <div className="shadow-2xl rounded p-10 text-center">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}

export { VerticalBarChart };
export default VerticalBarChart;