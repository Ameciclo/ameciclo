import { useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { User, Shield, RotateCcw, Users, Package, Wrench, Bike } from 'lucide-react';

const CyclistChart = () => {
  const options = {
    chart: {
      type: 'column',
      height: 64,
      backgroundColor: 'transparent',
      margin: [0, 0, 15, 0],
      spacing: [0, 0, 0, 0]
    },
    title: { text: null },
    legend: { enabled: false },
    credits: { enabled: false },
    xAxis: {
      categories: ['0h', '1h', '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h', '20h', '21h', '22h', '23h'],
      labels: {
        enabled: true,
        style: {
          fontSize: '9px',
          color: '#6b7280'
        },
        formatter: function() {
          return ['6h', '12h', '18h'].includes(this.value) ? this.value : '';
        }
      },
      lineWidth: 0,
      tickWidth: 0
    },
    yAxis: {
      visible: false,
      min: 0
    },
    plotOptions: {
      column: {
        color: '#10b981',
        borderWidth: 0,
        pointPadding: 0.1,
        groupPadding: 0.05
      }
    },
    series: [{
      name: 'Ciclistas',
      data: [50, 30, 20, 15, 25, 80, 150, 320, 280, 200, 180, 160, 140, 160, 180, 220, 280, 350, 423, 380, 250, 180, 120, 80],
      showInLegend: false
    }],
    tooltip: {
      formatter: function() {
        return `${this.y} ciclistas`;
      }
    }
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

const WomenChart = () => {
  const options = {
    chart: {
      type: 'areaspline',
      height: 64,
      backgroundColor: 'transparent',
      margin: [0, 5, 15, 5],
      spacing: [0, 0, 0, 0]
    },
    title: { text: null },
    legend: { enabled: false },
    credits: { enabled: false },
    xAxis: {
      categories: ['2015', '2016', '2017', '2018', '2019'],
      labels: {
        enabled: true,
        style: {
          fontSize: '9px',
          color: '#6b7280'
        }
      },
      lineWidth: 0,
      tickWidth: 0
    },
    yAxis: {
      visible: false,
      min: 0
    },
    plotOptions: {
      areaspline: {
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(236, 72, 153, 0.8)'],
            [1, 'rgba(236, 72, 153, 0.1)']
          ]
        },
        lineColor: '#ec4899',
        lineWidth: 2,
        marker: {
          enabled: true,
          radius: 1.5,
          fillColor: '#be185d'
        }
      }
    },
    series: [{
      name: 'Percentual',
      data: [8, 9, 10, 11, 12],
      showInLegend: false
    }],
    tooltip: {
      formatter: function() {
        return `${this.y}%`;
      }
    }
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

const SinistrosChart = () => {
  const options = {
    chart: {
      type: 'line',
      height: 280,
      backgroundColor: 'transparent'
    },
    title: {
      text: 'Evolução do Número de Sinistros',
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#374151'
      }
    },
    xAxis: {
      categories: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'],
      title: {
        text: 'Ano'
      }
    },
    yAxis: {
      title: {
        text: 'Número de Sinistros'
      },
      min: 0
    },
    plotOptions: {
      line: {
        lineWidth: 3,
        color: '#dc2626',
        marker: {
          enabled: true,
          radius: 4,
          fillColor: '#b91c1c'
        }
      }
    },
    series: [{
      name: 'Sinistros',
      data: [28, 32, 38, 45, 52, 58, 65, 72, 78],
      showInLegend: false
    }],
    tooltip: {
      formatter: function() {
        return `<b>${this.x}</b><br/>${this.y} sinistros`;
      }
    },
    credits: { enabled: false }
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

const EvolutionChart = () => {
  const options = {
    chart: {
      type: 'line',
      height: 280,
      backgroundColor: 'transparent'
    },
    title: {
      text: 'Evolução do Número Total de Ciclistas',
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#374151'
      }
    },
    xAxis: {
      categories: ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
      title: {
        text: 'Ano'
      }
    },
    yAxis: {
      title: {
        text: 'Número de Ciclistas'
      },
      min: 0
    },
    plotOptions: {
      line: {
        lineWidth: 3,
        color: '#10b981',
        marker: {
          enabled: true,
          radius: 4,
          fillColor: '#059669'
        }
      }
    },
    series: [{
      name: 'Ciclistas',
      data: [1200, 1450, 1680, 1920, 2150, 2380, 2650, 2200, 2450, 2800, 3100, 3350, 3600],
      showInLegend: false
    }],
    tooltip: {
      formatter: function() {
        return `<b>${this.x}</b><br/>${this.y} ciclistas`;
      }
    },
    credits: { enabled: false }
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

const SpeedChart = () => {
  const options = {
    chart: {
      type: 'areaspline',
      height: 64,
      backgroundColor: 'transparent',
      margin: [0, 0, 15, 0],
      spacing: [0, 0, 0, 0]
    },
    title: { text: null },
    legend: { enabled: false },
    credits: { enabled: false },
    xAxis: {
      categories: ['0h', '1h', '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h', '20h', '21h', '22h', '23h'],
      labels: {
        enabled: true,
        style: {
          fontSize: '9px',
          color: '#6b7280'
        },
        formatter: function() {
          return ['6h', '12h', '18h'].includes(this.value) ? this.value : '';
        }
      },
      lineWidth: 0,
      tickWidth: 0
    },
    yAxis: {
      visible: false,
      min: 0
    },
    plotOptions: {
      areaspline: {
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(59, 130, 246, 0.8)'],
            [1, 'rgba(59, 130, 246, 0.1)']
          ]
        },
        lineColor: '#3b82f6',
        lineWidth: 2,
        marker: {
          enabled: true,
          radius: 1.5,
          fillColor: '#1e40af'
        }
      }
    },
    series: [{
      name: 'Velocidade',
      data: [15, 12, 10, 8, 10, 14, 18, 28, 25, 22, 20, 19, 18, 20, 22, 24, 25, 26, 28, 24, 20, 18, 16, 15],
      showInLegend: false
    }],
    tooltip: {
      formatter: function() {
        return `${this.y}km/h`;
      }
    }
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export function MuralView() {
  const [activeTab, setActiveTab] = useState('contagens');
  
  return (
    <div className="h-full bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="bg-white rounded-lg shadow h-[200px] p-4 flex flex-col">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Sinistros Totais</h3>
              <p className="text-3xl font-bold text-gray-900">581</p>
              <p className="text-sm text-gray-600 flex items-center gap-1">Redução dos Fatais 12% <span className="text-green-500">▲</span></p>
              <p className="text-sm text-gray-600 flex items-center gap-1">Aumento nos não fatais 11% <span className="text-red-500">▼</span></p>
            </div>
            <div className="flex-1"></div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">Ano anterior: 482</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow h-[200px] p-4 flex flex-col">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Velocidade média</h3>
              <p className="text-3xl font-bold text-gray-900">24km/h</p>
            </div>
            <div className="flex-1 flex flex-col justify-end">
              <div className="h-16 mb-2">
                <SpeedChart />
              </div>
              <p className="text-sm text-gray-500">Fluxo de automóveis: 65.214</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow h-[200px] p-4 flex flex-col">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Fluxo de ciclistas</h3>
              <p className="text-3xl font-bold text-gray-900">6,560</p>
            </div>
            <div className="flex-1 flex flex-col justify-end">
              <div className="h-16 mb-2">
                <CyclistChart />
              </div>
              <p className="text-sm text-gray-500">Horário de pico: 423</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow h-[200px] p-4 flex flex-col">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Percentual de mulheres</h3>
              <p className="text-3xl font-bold text-gray-900">12%</p>
            </div>
            <div className="flex-1 flex flex-col justify-end">
              <div className="h-16 mb-2">
                <WomenChart />
              </div>
              <p className="text-sm text-gray-600 flex items-center gap-1">Aumento 4% <span className="text-green-500">▲</span> <span className="text-gray-500">(2019)</span></p>
            </div>
          </div>
        </div>
        
        <div className="mt-5">
          <div className="bg-white rounded-lg shadow h-[400px] p-6">
            {/* Barra de Filtros */}
            <div className="flex items-center gap-6 pb-4 border-b mb-4">
              <div className="text-lg font-semibold text-gray-800">
                Agamenon Magalhães
              </div>
              
              <div className="flex gap-1">
                <button 
                  onClick={() => setActiveTab('contagens')}
                  className={`px-3 py-1 text-xs rounded ${
                    activeTab === 'contagens' 
                      ? 'bg-teal-100 text-teal-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Contagens
                </button>
                <button 
                  onClick={() => setActiveTab('sinistros')}
                  className={`px-3 py-1 text-xs rounded ${
                    activeTab === 'sinistros' 
                      ? 'bg-red-100 text-red-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Sinistros
                </button>
              </div>
            </div>
            
            {/* Conteúdo Principal */}
            <div className="flex h-[300px] gap-6">
              {/* Gráfico */}
              <div className="flex-1">
                {activeTab === 'contagens' ? <EvolutionChart /> : <SinistrosChart />}
              </div>
              
              {/* Características */}
              <div className="w-64">
                <h3 className="font-semibold text-gray-800 mb-2">Características</h3>
                <div className="space-y-1">
                  <div className="flex justify-between items-center px-2 py-1 bg-gray-50 rounded text-sm">
                    <div className="flex items-center gap-1">
                      <span className="w-4 h-4 bg-pink-500 text-white rounded-full flex items-center justify-center"><User size={10} /></span>
                      <span className="font-medium">Mulheres</span>
                    </div>
                    <span className="font-bold text-gray-900">323</span>
                  </div>
                  
                  <div className="flex justify-between items-center px-2 py-1 bg-gray-50 rounded text-sm">
                    <div className="flex items-center gap-1">
                      <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center"><Shield size={10} /></span>
                      <span className="font-medium">Capacete</span>
                    </div>
                    <span className="font-bold text-gray-900">234</span>
                  </div>
                  
                  <div className="flex justify-between items-center px-2 py-1 bg-gray-50 rounded text-sm">
                    <div className="flex items-center gap-1">
                      <span className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center"><RotateCcw size={10} /></span>
                      <span className="font-medium">Contramão</span>
                    </div>
                    <span className="font-bold text-gray-900">123</span>
                  </div>
                  
                  <div className="flex justify-between items-center px-2 py-1 bg-gray-50 rounded text-sm">
                    <div className="flex items-center gap-1">
                      <span className="w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center"><Users size={10} /></span>
                      <span className="font-medium">Caronas</span>
                    </div>
                    <span className="font-bold text-gray-900">141</span>
                  </div>
                  
                  <div className="flex justify-between items-center px-2 py-1 bg-gray-50 rounded text-sm">
                    <div className="flex items-center gap-1">
                      <span className="w-4 h-4 bg-purple-500 text-white rounded-full flex items-center justify-center"><Package size={10} /></span>
                      <span className="font-medium">Cargueiras</span>
                    </div>
                    <span className="font-bold text-gray-900">452</span>
                  </div>
                  
                  <div className="flex justify-between items-center px-2 py-1 bg-gray-50 rounded text-sm">
                    <div className="flex items-center gap-1">
                      <span className="w-4 h-4 bg-indigo-600 text-white rounded-full flex items-center justify-center"><Wrench size={10} /></span>
                      <span className="font-medium">Serviço</span>
                    </div>
                    <span className="font-bold text-gray-900">783</span>
                  </div>
                  
                  <div className="flex justify-between items-center px-2 py-1 bg-gray-50 rounded text-sm">
                    <div className="flex items-center gap-1">
                      <span className="w-4 h-4 bg-orange-500 text-white rounded-full flex items-center justify-center"><Bike size={10} /></span>
                      <span className="font-medium">Compartilhadas</span>
                    </div>
                    <span className="font-bold text-gray-900">312</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-lg shadow h-[500px] p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Perfil de ciclistas</h3>
            <div className="h-full flex items-center justify-center text-gray-500">
              Gráfico do perfil de ciclistas
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow h-[500px] p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ciclistas por gênero</h3>
            <div className="h-full flex items-center justify-center text-gray-500">
              Gráfico de ciclistas por gênero
            </div>
          </div>
        </div>
        
        <div className="mt-5">
          <div className="bg-white rounded-lg shadow h-[500px] p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Análise completa dos dados</h3>
            <div className="h-full flex items-center justify-center text-gray-500">
              Gráfico de análise completa
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}