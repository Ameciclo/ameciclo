import { useEffect, useState } from "react";

let Highcharts: any;
let HighchartsReact: any;

interface YearData {
  ano: number;
  sinistros: number;
  meses: Record<string, number>;
  dias_semana: Record<string, number>;
  horarios: Record<string, number>;
  dias_com_dados: number;
  dias_com_sinistros: number;
}

interface TemporalAnalysisProps {
  data: YearData[];
  selectedVia?: string;
}

export default function TemporalAnalysis({ data, selectedVia }: TemporalAnalysisProps) {
  const [chartsLoaded, setChartsLoaded] = useState(false);
  const [activeChart, setActiveChart] = useState<'yearly' | 'monthly' | 'weekly' | 'hourly'>('yearly');

  useEffect(() => {
    const loadHighcharts = async () => {
      if (typeof window !== "undefined") {
        const HighchartsModule = await import("highcharts");
        const HighchartsReactModule = await import("highcharts-react-official");
        
        Highcharts = HighchartsModule.default;
        HighchartsReact = HighchartsReactModule.default;
        
        setChartsLoaded(true);
      }
    };
    
    loadHighcharts();
  }, []);

  if (!chartsLoaded || !data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Análise Temporal</h3>
        <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
          <span className="text-gray-500">
            {!chartsLoaded ? "Carregando gráficos..." : "Nenhum dado temporal disponível"}
          </span>
        </div>
      </div>
    );
  }

  // Preparar dados para diferentes visualizações
  const yearlyData = data.map(item => [item.ano, item.sinistros]);
  
  const monthlyData = data.length > 0 ? Object.keys(data[0].meses).map(month => {
    const total = data.reduce((sum, year) => sum + (year.meses[month] || 0), 0);
    return [parseInt(month), total];
  }) : [];

  const weeklyData = data.length > 0 ? Object.keys(data[0].dias_semana).map(day => {
    const total = data.reduce((sum, year) => sum + (year.dias_semana[day] || 0), 0);
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return [dayNames[parseInt(day)], total];
  }) : [];

  const hourlyData = data.length > 0 ? Object.keys(data[0].horarios).map(hour => {
    const total = data.reduce((sum, year) => sum + (year.horarios[hour] || 0), 0);
    return [parseInt(hour), total];
  }) : [];

  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  const getChartOptions = () => {
    const baseOptions = {
      chart: {
        style: { fontFamily: 'inherit' }
      },
      credits: { enabled: false },
      colors: ['#008080'],
      responsive: {
        rules: [{
          condition: { maxWidth: 500 },
          chartOptions: {
            legend: { align: 'center' }
          }
        }]
      }
    };

    switch (activeChart) {
      case 'yearly':
        return {
          ...baseOptions,
          chart: { ...baseOptions.chart, type: 'line' },
          title: { text: 'Evolução Anual dos Sinistros' },
          xAxis: {
            title: { text: 'Ano' },
            type: 'category'
          },
          yAxis: {
            title: { text: 'Número de Sinistros' }
          },
          series: [{
            name: 'Sinistros',
            data: yearlyData,
            marker: { enabled: true }
          }]
        };

      case 'monthly':
        return {
          ...baseOptions,
          chart: { ...baseOptions.chart, type: 'column' },
          title: { text: 'Distribuição Mensal dos Sinistros' },
          xAxis: {
            categories: monthNames,
            title: { text: 'Mês' }
          },
          yAxis: {
            title: { text: 'Número de Sinistros' }
          },
          series: [{
            name: 'Sinistros',
            data: monthlyData.map(([month, value]) => value)
          }]
        };

      case 'weekly':
        return {
          ...baseOptions,
          chart: { ...baseOptions.chart, type: 'column' },
          title: { text: 'Distribuição por Dia da Semana' },
          xAxis: {
            categories: weeklyData.map(([day]) => day),
            title: { text: 'Dia da Semana' }
          },
          yAxis: {
            title: { text: 'Número de Sinistros' }
          },
          series: [{
            name: 'Sinistros',
            data: weeklyData.map(([, value]) => value)
          }]
        };

      case 'hourly':
        return {
          ...baseOptions,
          chart: { ...baseOptions.chart, type: 'area' },
          title: { text: 'Distribuição por Horário do Dia' },
          xAxis: {
            title: { text: 'Hora do Dia' },
            min: 0,
            max: 23,
            tickInterval: 2
          },
          yAxis: {
            title: { text: 'Número de Sinistros' }
          },
          series: [{
            name: 'Sinistros',
            data: hourlyData,
            fillOpacity: 0.3
          }]
        };

      default:
        return baseOptions;
    }
  };

  const totalSinistros = data.reduce((sum, year) => sum + year.sinistros, 0);
  const avgPerYear = totalSinistros / data.length;
  const peakYear = data.reduce((max, year) => year.sinistros > max.sinistros ? year : max, data[0]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Análise Temporal</h3>
          {selectedVia && (
            <p className="text-sm text-gray-600">Via: {selectedVia}</p>
          )}
        </div>
        
        {/* Botões de navegação */}
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          {[
            { key: 'yearly', label: 'Anual' },
            { key: 'monthly', label: 'Mensal' },
            { key: 'weekly', label: 'Semanal' },
            { key: 'hourly', label: 'Horário' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveChart(key as any)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                activeChart === key
                  ? 'bg-ameciclo text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Estatísticas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-ameciclo">{totalSinistros.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total de sinistros</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-ameciclo">{Math.round(avgPerYear)}</div>
          <div className="text-sm text-gray-600">Média por ano</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-ameciclo">{peakYear.ano}</div>
          <div className="text-sm text-gray-600">Ano com mais sinistros</div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-80">
        <HighchartsReact highcharts={Highcharts} options={getChartOptions()} />
      </div>

      {/* Insights baseados no gráfico ativo */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Insights</h4>
        <div className="text-sm text-blue-800">
          {activeChart === 'yearly' && (
            <p>O ano de {peakYear.ano} registrou o maior número de sinistros ({peakYear.sinistros}), 
            representando um pico na série histórica.</p>
          )}
          {activeChart === 'monthly' && (
            <p>A análise mensal mostra padrões sazonais nos sinistros, 
            com variações que podem estar relacionadas a fatores climáticos e de tráfego.</p>
          )}
          {activeChart === 'weekly' && (
            <p>A distribuição semanal revela diferenças entre dias úteis e fins de semana, 
            indicando padrões relacionados ao fluxo de tráfego urbano.</p>
          )}
          {activeChart === 'hourly' && (
            <p>O padrão horário mostra picos durante horários de rush, 
            evidenciando a relação entre volume de tráfego e sinistros.</p>
          )}
        </div>
      </div>
    </div>
  );
}