import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

// Loaded through React.lazy by LazyChart so Highcharts stays out of the page's main chunk.
export default function HighchartsChart({ options }: { options: Highcharts.Options }) {
  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
