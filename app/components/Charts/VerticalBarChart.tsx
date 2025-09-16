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
            key === "removido_particulares" ? "Removido por Particulares" :
            key === "removido_bombeiros" ? "Removido pelos Bombeiros" :
            key === "obito_local" ? "Óbito no Local" : key,
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
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            formatter: function() {
              // Mostrar apenas o total no topo da pilha
              if (this.point.stackY === this.point.total) {
                return '<b>' + this.point.total.toLocaleString() + '</b>';
              }
              return null;
            },
            style: {
              fontWeight: 'bold',
              color: '#374151',
              fontSize: '12px',
              textOutline: 'none'
            },
            verticalAlign: 'top',
            y: -25
          }
        }
      },
      tooltip: {
        shared: true,
        useHTML: true,
        formatter: function() {
          let tooltip = '<b>' + this.x + '</b><br/>';
          let total = 0;
          this.points.forEach(function(point) {
            tooltip += '<span style="color:' + point.color + '">●</span> ' + 
                      point.series.name + ': <b>' + point.y.toLocaleString() + '</b><br/>';
            total += point.y;
          });
          tooltip += '<hr style="margin: 5px 0;"/>';
          tooltip += '<b>Total: ' + total.toLocaleString() + '</b>';
          return tooltip;
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