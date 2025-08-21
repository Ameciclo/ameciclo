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

export default function ViaTemporalCharts({ data }: ViaTemporalChartsProps) {
  const [selectedYears, setSelectedYears] = useState<string[]>(
    data.length > 0 ? [data[data.length - 1].ano] : []
  );
  const [activeChart, setActiveChart] = useState<'meses' | 'dias_semana' | 'horarios'>('meses');

  const filteredData = data.filter(d => selectedYears.includes(d.ano));

  const toggleYear = (year: string) => {
    setSelectedYears(prev => 
      prev.includes(year) 
        ? prev.filter(y => y !== year)
        : [...prev, year]
    );
  };

  const aggregateData = (key: 'meses' | 'dias_semana' | 'horarios') => {
    const result: Record<string, number> = {};
    
    filteredData.forEach(yearData => {
      Object.entries(yearData[key]).forEach(([period, count]) => {
        result[period] = (result[period] || 0) + count;
      });
    });
    
    return result;
  };

  const getChartData = () => {
    const aggregated = aggregateData(activeChart);
    
    switch (activeChart) {
      case 'meses':
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return meses.map((mes, i) => ({
          label: mes,
          value: aggregated[String(i + 1)] || 0
        }));
        
      case 'dias_semana':
        const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        return dias.map((dia, i) => ({
          label: dia,
          value: aggregated[String(i)] || 0
        }));
        
      case 'horarios':
        return Array.from({ length: 24 }, (_, i) => ({
          label: `${i}h`,
          value: aggregated[String(i)] || 0
        }));
        
      default:
        return [];
    }
  };

  const chartData = getChartData();
  const maxValue = Math.max(...chartData.map(d => d.value));

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

      {/* Seletor de Tipo de Gráfico */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'meses', label: 'Por Mês' },
            { key: 'dias_semana', label: 'Por Dia da Semana' },
            { key: 'horarios', label: 'Por Horário' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveChart(key as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeChart === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Gráfico de Barras Simples */}
        {selectedYears.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">
              Distribuição de Sinistros - {
                activeChart === 'meses' ? 'Por Mês' :
                activeChart === 'dias_semana' ? 'Por Dia da Semana' :
                'Por Horário'
              }
            </h4>
            
            <div className="grid gap-2" style={{
              gridTemplateColumns: `repeat(${chartData.length}, 1fr)`
            }}>
              {chartData.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-blue-500 rounded-t w-full min-h-[4px] transition-all duration-300 hover:bg-blue-600"
                    style={{
                      height: `${Math.max(4, (item.value / maxValue) * 200)}px`
                    }}
                    title={`${item.label}: ${item.value} sinistros`}
                  />
                  <div className="text-xs text-center mt-2 font-medium">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-600 text-center">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-sm text-gray-600 text-center mt-4">
              Total de sinistros no período selecionado: {' '}
              <span className="font-semibold">
                {chartData.reduce((sum, item) => sum + item.value, 0)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Resumo Estatístico */}
      {selectedYears.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 mb-3">Resumo do Período Selecionado</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {selectedYears.length}
              </div>
              <div className="text-gray-600">Anos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredData.reduce((sum, year) => sum + year.sinistros, 0)}
              </div>
              <div className="text-gray-600">Total Sinistros</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(filteredData.reduce((sum, year) => sum + year.sinistros, 0) / selectedYears.length).toFixed(0)}
              </div>
              <div className="text-gray-600">Média/Ano</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.max(...chartData.map(d => d.value))}
              </div>
              <div className="text-gray-600">Pico</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}