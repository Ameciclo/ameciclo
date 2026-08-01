import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import React from "react";

interface StackedBarChartProps {
  title: string;
  xAxisTitle?: string;
  yAxisTitle?: string;
  categories: string[];
  series: Highcharts.SeriesOptionsType[];
}

function StackedBarChart({
  title,
  xAxisTitle = "Ano",
  yAxisTitle = "Quantidade",
  categories,
  series,
}: StackedBarChartProps): React.ReactElement {
  const getOptions = (): Highcharts.Options => {
    return {
      chart: {
        type: "column",
        height: 400,
      },
      title: {
        text: title,
      },
      xAxis: {
        categories: categories,
        title: {
          text: xAxisTitle,
        },
        labels: {
          style: {
            fontWeight: "500"
          }
        },
      },
      yAxis: {
        min: 0,
        title: {
          text: yAxisTitle,
        },
        labels: {
          style: {
            fontWeight: "500"
          }
        },
      },
      legend: {
        align: "center",
        verticalAlign: "bottom",
        backgroundColor: "white",
        borderColor: "#CCC",
        borderWidth: 1,
        shadow: false,
      },
      tooltip: {
        headerFormat: "<b>{point.category}</b><br/>",
        pointFormat: "{series.name}: {point.y}<br/>Total RMR: {point.rmr}",
      },
      plotOptions: {
        column: {
          dataLabels: {
            enabled: true,
            format: "{point.rmr}",
            y: -8,
            style: {
              fontWeight: "600",
              color: "#333",
            },
          },
        },
      },
      series: series,
      credits: {
        enabled: false,
      },
    };
  };

  return (
    <div className="shadow-2xl rounded-sm p-6 pt-4 text-center">
      <HighchartsReact highcharts={Highcharts} options={getOptions()} />
    </div>
  );
}

export default StackedBarChart;