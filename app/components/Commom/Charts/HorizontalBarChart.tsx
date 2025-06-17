import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

export default function HorizontalBarChart({title, yAxisTitle = "Quantidade", series}: any) {

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
