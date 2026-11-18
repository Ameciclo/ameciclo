import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@ameciclo/ui/components/chart";
import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart as RechartsRadar } from "recharts";

// O gráfico de radar do IDECiclo: uma série por avaliação (ano), uma ponta por parâmetro, notas de 0 a 10.
type RadarSeries = { name: string | number; data: number[] };

const PALETTE = ["#008080", "#E02F31", "#000000", "#DDDF00", "#24CBE5", "#64E572", "#FF9655", "#6AF9C4"];

export function RadarChart({
  series,
  categories,
  title = "",
  subtitle = "",
}: {
  series: RadarSeries[];
  categories: string[];
  title?: string;
  subtitle?: string;
}) {
  // As séries são chaveadas pela posição (`s0`, `s1`...): o nome (o ano) não serve de variável CSS.
  const config: ChartConfig = Object.fromEntries(series.map((s, i) => [`s${i}`, { label: String(s.name), color: PALETTE[i % PALETTE.length] }]));
  const rows = categories.map((category, i) => ({ category, ...Object.fromEntries(series.map((s, j) => [`s${j}`, s.data[i]])) }));

  return (
    <div className="h-full w-full p-6">
      {title && <h3 className="text-center text-lg font-medium text-gray-700">{title}</h3>}
      {subtitle && <p className="mb-2 text-center text-sm text-gray-500">{subtitle}</p>}
      <ChartContainer config={config} className="mx-auto aspect-auto h-80 w-full">
        <RechartsRadar data={rows} outerRadius="70%">
          <PolarGrid gridType="polygon" />
          <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis domain={[0, 10]} tickCount={6} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent valueFormatter={(v) => Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} />} />
          <Legend />
          {series.map((s, i) => (
            // A avaliação mais antiga (a primeira da lista) vai preenchida; as seguintes só com contorno.
            <Radar key={`s${i}`} dataKey={`s${i}`} name={String(s.name)} stroke={`var(--color-s${i})`} fill={`var(--color-s${i})`} fillOpacity={i === 0 ? 0.25 : 0} strokeWidth={2} />
          ))}
        </RechartsRadar>
      </ChartContainer>
    </div>
  );
}
