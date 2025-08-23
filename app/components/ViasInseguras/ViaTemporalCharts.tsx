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
  const [activeChart, setActiveChart] = useState<'evolucao_anual' | 'meses' | 'dias_semana' | 'horarios'>('evolucao_anual');

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
    switch (activeChart) {
      case 'evolucao_anual':
        return data.map(yearData => ({
          label: yearData.ano,
          value: yearData.sinistros
        }));
        
      case 'meses':
      case 'dias_semana':
      case 'horarios':
        const aggregated = aggregateData(activeChart);
        
        if (activeChart === 'meses') {
          const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
          return meses.map((mes, i) => ({
            label: mes,
            value: aggregated[String(i + 1)] || 0
          }));
        }
        
        if (activeChart === 'dias_semana') {
          const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
          return dias.map((dia, i) => ({
            label: dia,
            value: aggregated[String(i)] || 0
          }));
        }
        
        if (activeChart === 'horarios') {
          return Array.from({ length: 24 }, (_, i) => ({
            label: `${i}h`,
            value: aggregated[String(i)] || 0
          }));
        }
        
        return [];
        
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
            { key: 'evolucao_anual', label: 'Evolução Anual' },
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
        {(activeChart === 'evolucao_anual' || selectedYears.length > 0) && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">
              {
                activeChart === 'evolucao_anual' ? 'Evolução Anual de Sinistros' :
                activeChart === 'meses' ? 'Distribuição de Sinistros - Por Mês' :
                activeChart === 'dias_semana' ? 'Distribuição de Sinistros - Por Dia da Semana' :
                'Distribuição de Sinistros - Por Horário'
              }
            </h4>
            
            <div className="flex items-end justify-center gap-2 h-64 p-4 bg-gray-50 rounded-lg">
              {chartData.map((item, index) => (
                <div key={index} className="flex flex-col items-center justify-end h-full">
                  <div className="text-xs text-gray-600 mb-1 font-medium">
                    {item.value}
                  </div>
                  <div 
                    className={`${activeChart === 'evolucao_anual' ? 'bg-ameciclo' : 'bg-blue-500'} rounded-t w-8 min-h-[4px] transition-all duration-300 hover:opacity-80 flex items-end`}
                    style={{
                      height: `${Math.max(4, (item.value / maxValue) * 200)}px`
                    }}
                    title={`${item.label}: ${item.value} sinistros`}
                  />
                  <div className="text-xs text-center mt-2 font-medium text-gray-700">
                    {item.label}
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

      {/* Resumo Estatístico 
      {(activeChart === 'evolucao_anual' || selectedYears.length > 0) && (
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
                {activeChart === 'evolucao_anual' 
                  ? data.reduce((sum, year) => sum + year.sinistros, 0)
                  : filteredData.reduce((sum, year) => sum + year.sinistros, 0)
                }
              </div>
              <div className="text-gray-600">Total Sinistros</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {activeChart === 'evolucao_anual'
                  ? (data.reduce((sum, year) => sum + year.sinistros, 0) / data.length).toFixed(0)
                  : (filteredData.reduce((sum, year) => sum + year.sinistros, 0) / selectedYears.length).toFixed(0)
                }
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
      )}*/}
    </div>
  );
}