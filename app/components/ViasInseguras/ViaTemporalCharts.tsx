import { useState } from "react";

interface YearData {
  ano: string;
  sinistros: number;
  meses: Record<string, number>;
  dias_semana: Record<string, number>;
  horarios: Record<string, number>;
}

interface ViaTemporalChartsProps {
  data: YearData[];
}

function aggregateData(
  filteredData: YearData[],
  key: 'meses' | 'dias_semana' | 'horarios'
): Record<string, number> {
  const result: Record<string, number> = {};

  filteredData.forEach(yearData => {
    const dataObj = yearData[key];
    if (!dataObj) return;
    Object.entries(dataObj).forEach(([period, count]) => {
      let normalizedKey = period;
      if (key === 'horarios') {
        const hourMatch = period.match(/(\d+)/);
        normalizedKey = hourMatch ? hourMatch[1] : period;
      }
      result[normalizedKey] = (result[normalizedKey] || 0) + (count as number);
    });
  });

  return result;
}

function BarChart({
  title,
  items,
  colorClass,
  compact = false,
}: {
  title: string;
  items: { label: string; value: number }[];
  colorClass: string;
  compact?: boolean;
}) {
  const maxValue = Math.max(...items.map(d => d.value), 1);
  const barWidth = compact ? 'w-3' : 'w-8';
  const gap = compact ? 'gap-1' : 'gap-2';
  const valueSize = compact ? 'text-[10px]' : 'text-xs';
  const labelSize = compact ? 'text-[10px]' : 'text-xs';

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold">{title}</h4>

      <div className={`flex items-end justify-center ${gap} h-64 p-4 bg-gray-50 rounded-lg overflow-x-auto`}>
        {items.map((item, index) => (
          <div key={index} className="flex flex-col items-center justify-end h-full shrink-0">
            <div className={`${valueSize} text-gray-600 mb-1 font-medium`}>
              {item.value}
            </div>
            <div
              className={`${colorClass} ${barWidth} rounded-t min-h-[4px] transition-all duration-300 hover:opacity-80 flex items-end`}
              style={{
                height: `${Math.max(4, (item.value / maxValue) * 200)}px`,
              }}
              title={`${item.label}: ${item.value} sinistros`}
            />
            <div className={`${labelSize} text-center mt-2 font-medium text-gray-700`}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-600 text-center mt-4">
        Total de sinistros no período selecionado:{' '}
        <span className="font-semibold">
          {items.reduce((sum, item) => sum + item.value, 0)}
        </span>
      </div>
    </div>
  );
}

export default function ViaTemporalCharts({ data }: ViaTemporalChartsProps) {
  const [selectedYears, setSelectedYears] = useState<string[]>(
    data.length > 0 ? [data[data.length - 1].ano] : []
  );

  const filteredData = data.filter(d => selectedYears.includes(d.ano));

  const toggleYear = (year: string) => {
    setSelectedYears(prev =>
      prev.includes(year)
        ? prev.filter(y => y !== year)
        : [...prev, year]
    );
  };

  const evolucaoAnual = data.map(yearData => ({
    label: yearData.ano,
    value: yearData.sinistros,
  }));

  const aggregatedMeses = aggregateData(filteredData, 'meses');
  const mesesChart = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    .map((mes, i) => ({
      label: mes,
      value: aggregatedMeses[String(i + 1)] || 0,
    }));

  const aggregatedDias = aggregateData(filteredData, 'dias_semana');
  const diasChart = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    .map((dia, i) => ({
      label: dia,
      value: aggregatedDias[String(i)] || 0,
    }));

  const aggregatedHorarios = aggregateData(filteredData, 'horarios');
  const horariosChart = Array.from({ length: 24 }, (_, i) => ({
    label: `${i}h`,
    value: aggregatedHorarios[String(i)] || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Seletor de Anos */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Selecionar Período</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedYears(data.map(d => d.ano))}
            className="px-4 py-2 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 mr-4"
          >
            Todos os Anos
          </button>
          {data.map(yearData => (
            <button
              key={yearData.ano}
              onClick={() => toggleYear(yearData.ano)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedYears.includes(yearData.ano)
                  ? 'bg-ameciclo text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {yearData.ano}
              <span className="ml-2 text-sm">
                ({yearData.sinistros})
              </span>
            </button>
          ))}
        </div>

        {selectedYears.length === 0 && (
          <p className="text-red-600 text-sm mt-2">
            Selecione pelo menos um ano para visualizar os dados.
          </p>
        )}
      </div>

      {/* Gráficos em grid 2 colunas (md+) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico 1: Evolução Anual (todos os anos, ignora seleção) */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <BarChart
            title="Evolução Anual de Sinistros"
            items={evolucaoAnual}
            colorClass="bg-ameciclo"
          />
        </div>

        {/* Gráfico 2: Por Mês */}
        {selectedYears.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <BarChart
              title="Distribuição de Sinistros - Por Mês"
              items={mesesChart}
              colorClass="bg-blue-500"
            />
          </div>
        )}

        {/* Gráfico 3: Por Dia da Semana */}
        {selectedYears.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <BarChart
              title="Distribuição de Sinistros - Por Dia da Semana"
              items={diasChart}
              colorClass="bg-blue-500"
            />
          </div>
        )}

        {/* Gráfico 4: Por Horário */}
        {selectedYears.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <BarChart
              title="Distribuição de Sinistros - Por Horário"
              items={horariosChart}
              colorClass="bg-blue-500"
              compact
            />
          </div>
        )}
      </div>
    </div>
  );
}