import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

export default function HorizontalBarChart({title, yAxisTitle = "Quantidade", series}: any) {

const options = {
    chart: {
      type: "bar",
    },
    title: {
      text:
        title,
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
