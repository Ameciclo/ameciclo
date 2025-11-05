import { useState, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { User, Shield, RotateCcw, Users, Package, Wrench, Bike, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

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
        formatter: function () {
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
      formatter: function () {
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
      formatter: function () {
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
      formatter: function () {
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
      formatter: function () {
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
        formatter: function () {
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
      formatter: function () {
        return `${this.y}km/h`;
      }
    }
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

const MountainChart = () => {
  const options = {
    chart: {
      type: 'areaspline',
      height: 300,
      backgroundColor: 'transparent'
    },
    title: {
      text: null
    },
    legend: {
      enabled: true,
      align: 'center',
      verticalAlign: 'top',
      y: 20,
      itemStyle: {
        fontSize: '14px',
        fontWeight: 'normal'
      }
    },
    xAxis: {
      categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      title: {
        text: 'Meses'
      }
    },
    yAxis: {
      title: {
        text: 'Valores'
      },
      min: 0
    },
    plotOptions: {
      areaspline: {
        lineWidth: 3,
        marker: {
          enabled: true,
          radius: 4
        },
        fillOpacity: 0.3
      }
    },
    series: [{
      name: 'Série Azul',
      data: [120, 135, 158, 142, 165, 180, 195, 175, 160, 145, 130, 125],
      color: '#3b82f6',
      fillColor: {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          [0, 'rgba(59, 130, 246, 0.4)'],
          [1, 'rgba(59, 130, 246, 0.1)']
        ]
      }
    }, {
      name: 'Série Verde',
      data: [80, 95, 110, 125, 140, 155, 170, 185, 200, 180, 165, 150],
      color: '#10b981',
      fillColor: {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          [0, 'rgba(16, 185, 129, 0.4)'],
          [1, 'rgba(16, 185, 129, 0.1)']
        ]
      }
    }],
    tooltip: {
      shared: true,
      crosshairs: true
    },
    credits: { enabled: false }
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

const AnimatedPieChart = () => {
  const options = {
    chart: {
      type: 'pie',
      height: 400,
      backgroundColor: 'transparent',
      animation: {
        duration: 2000
      }
    },
    title: { text: null },
    credits: { enabled: false },
    plotOptions: {
      pie: {
        allowPointSelect: false,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          distance: 30,
          format: '{point.name}: {point.percentage:.1f}%',
          style: {
            fontSize: '12px',
            fontWeight: 'normal'
          }
        },
        showInLegend: false,
        innerSize: '40%',
        animation: {
          duration: 2000
        },
        states: {
          hover: {
            enabled: false
          }
        }
      }
    },
    series: [{
      name: 'Raça/Cor',
      colorByPoint: true,
      data: [
        { name: 'Parda', y: 50, color: '#8b5cf6' },
        { name: 'Branca', y: 25, color: '#10b981' },
        { name: 'Preta', y: 15, color: '#f59e0b' },
        { name: 'Outros', y: 3, color: '#6b7280' }
      ],
      animation: {
        duration: 2000
      }
    }],
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full h-full">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </div>
  );
};

export function MuralView() {
  const [activeTab, setActiveTab] = useState('contagens');

  return (
    <div className="h-full bg-gray-50 p-6 overflow-y-auto overflow-x-hidden">
      <div className="w-full max-w-[75vw] mx-auto">
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
          <div className="bg-white rounded-lg shadow h-auto lg:h-[400px] p-6">
            {/* Barra de Filtros */}
            <div className="flex items-center gap-6 pb-4 border-b mb-4">
              <div className="text-lg font-semibold text-gray-800">
                Agamenon Magalhães
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('contagens')}
                  className={`px-3 py-1 text-xs rounded ${activeTab === 'contagens'
                      ? 'bg-teal-100 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  Contagens
                </button>
                <button
                  onClick={() => setActiveTab('sinistros')}
                  className={`px-3 py-1 text-xs rounded ${activeTab === 'sinistros'
                      ? 'bg-red-100 text-red-700'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  Sinistros
                </button>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="flex flex-col lg:flex-row h-auto lg:h-[300px] gap-6">
              {/* Gráfico */}
              <div className="flex-1 h-[250px] lg:h-auto">
                {activeTab === 'contagens' ? <EvolutionChart /> : <SinistrosChart />}
              </div>

              {/* Características */}
              <div className="w-full lg:w-64">
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
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Perfil de ciclistas</h3>
            <p className="text-xs text-gray-500 mb-4">Av. Agamenon Magalhães x Av. Boa Vista</p>
            <div className="flex gap-3 mb-4">
              <div className="flex-1 bg-white rounded-lg shadow h-[150px] p-4 flex flex-col">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-600">Participação feminina</h4>
                    <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center cursor-pointer relative group">
                      <span className="text-xs text-gray-600">i</span>
                      <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-white border rounded-lg shadow-lg text-xs text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit
                      </div>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">19.8%</p>
                </div>
                <div className="flex-1 flex flex-col justify-end">
                  <div className="h-12 mb-2">
                    <div className="w-full h-full relative">
                      <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                        <path
                          d="M0,25 Q25,22 50,18 T100,12"
                          fill="none"
                          stroke="#ec4899"
                          strokeWidth="2"
                        />
                        <path
                          d="M0,25 Q25,22 50,18 T100,12 L100,30 L0,30 Z"
                          fill="url(#womenGradient)"
                        />
                        <defs>
                          <linearGradient id="womenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 flex items-center gap-1">99 mulheres <span className="text-pink-500">♀</span> <span className="text-gray-500">(de 500)</span></p>
                </div>
              </div>

              <div className="flex-1 bg-white rounded-lg shadow h-[150px] p-4 flex flex-col">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-600">Tempo médio de trajeto</h4>
                    <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center cursor-pointer relative group">
                      <span className="text-xs text-gray-600">i</span>
                      <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-white border rounded-lg shadow-lg text-xs text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit
                      </div>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">24min</p>
                </div>
                <div className="flex-1 flex flex-col justify-end">
                  <div className="h-12 mb-2">
                    <div className="w-full h-full relative">
                      <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                        <path
                          d="M0,22 Q25,18 50,20 T100,15"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2"
                        />
                        <path
                          d="M0,22 Q25,18 50,20 T100,15 L100,30 L0,30 Z"
                          fill="url(#timeGradient)"
                        />
                        <defs>
                          <linearGradient id="timeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 flex items-center gap-1">Faixa 5-60min <span className="text-green-500">⏱</span> <span className="text-gray-500">(variável)</span></p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <PerfilTable />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow h-[500px] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Ciclistas por raça/cor</h3>
              <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center cursor-pointer relative group">
                <span className="text-xs text-gray-600">i</span>
                <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-white border rounded-lg shadow-lg text-xs text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  Categoria outros contempla amarelo indígena
                </div>
              </div>
            </div>
            <div className="h-full flex items-center justify-center">
              <AnimatedPieChart />
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="bg-white rounded-lg shadow h-[500px] p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Análise completa dos dados</h3>

            {/* Carrossel de Cards com Swiper */}
            <div className="mb-6 overflow-hidden">
              <Swiper
                spaceBetween={16}
                slidesPerView="auto"
                className="!overflow-visible"
              >
                {[
                  { title: 'Estacionar em Ciclovia', label: 'Infrações registradas', value: '1.247', progress: 85 },
                  { title: 'Trafegar em Ciclofaixa', label: 'Veículos autuados', value: '892', progress: 72 },
                  { title: 'Obstruir Ciclovia', label: 'Multas aplicadas', value: '634', progress: 68 },
                  { title: 'Não Respeitar Preferência', label: 'Acidentes evitados', value: '156', progress: 45 },
                  { title: 'Ultrapassagem Irregular', label: 'Flagrantes de risco', value: '2.103', progress: 91 },
                  { title: 'Fechada de Ciclista', label: 'Ocorrências reportadas', value: '789', progress: 78 },
                  { title: 'Buzinar para Ciclista', label: 'Denúncias recebidas', value: '1.456', progress: 83 },
                  { title: 'Porta Aberta', label: 'Casos documentados', value: '567', progress: 76 },
                  { title: 'Invasão de Faixa', label: 'Registros de conflito', value: '423', progress: 64 },
                  { title: 'Velocidade Excessiva', label: 'Radares em ciclovias', value: '1.892', progress: 89 },
                  { title: 'Parar sobre Faixa', label: 'Bloqueios identificados', value: '345', progress: 55 },
                  { title: 'Desrespeito à Sinalização', label: 'Violações flagradas', value: '2.567', progress: 92 }
                ].map((item, i) => (
                  <SwiperSlide key={i} className="!w-[200px]">
                    <div className="w-[200px] h-[100px] bg-blue-50 rounded-lg border border-blue-200 p-3 flex">
                      <div className="flex-1">
                        <h4 className="text-xs font-semibold text-gray-800 mb-1">{item.title}</h4>
                        <p className="text-xs text-gray-500 mb-2">{item.label}</p>
                        <p className="text-xl font-bold text-gray-900">{item.value}</p>
                      </div>
                      <div className="flex items-center">
                        <div className="relative w-12 h-12">
                          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="2"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#3b82f6"
                              strokeWidth="2"
                              strokeDasharray={`${item.progress}, 100`}
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <div className="h-full">
              <MountainChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PerfilTable() {
  const [sortField, setSortField] = useState('motivacao');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const data = [
    { motivacao: 'É mais rápido e prático', masculino: 211, feminino: 59, total: 270 },
    { motivacao: 'Falta de segurança no trânsito', masculino: 189, feminino: 47, total: 236 },
    { motivacao: 'Mais infraestrutura adequada', masculino: 225, feminino: 58, total: 283 },
    { motivacao: 'É mais saudável', masculino: 75, feminino: 15, total: 90 },
    { motivacao: 'É mais barato', masculino: 73, feminino: 18, total: 91 },
    { motivacao: 'Falta de infraestrutura adequada', masculino: 160, feminino: 38, total: 198 },
    { motivacao: 'Mais segurança no trânsito', masculino: 125, feminino: 35, total: 160 },
    { motivacao: 'Já sofreu colisão', masculino: 117, feminino: 31, total: 148 },
    { motivacao: 'Pedala 7 dias por semana', masculino: 201, feminino: 38, total: 239 },
    { motivacao: 'Pedala há mais de 5 anos', masculino: 258, feminino: 41, total: 299 }
  ];

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortField as keyof typeof a];
    const bVal = b[sortField as keyof typeof b];
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ChevronUp className="w-3 h-3 text-gray-400" />;
    return sortDirection === 'asc' ?
      <ChevronUp className="w-3 h-3 text-gray-600" /> :
      <ChevronDown className="w-3 h-3 text-gray-600" />;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('motivacao')}
                >
                  <div className="flex items-center gap-1">
                    Motivação/Problema
                    <SortIcon field="motivacao" />
                  </div>
                </th>
                <th
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('masculino')}
                >
                  <div className="flex items-center gap-1">
                    M
                    <SortIcon field="masculino" />
                  </div>
                </th>
                <th
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('feminino')}
                >
                  <div className="flex items-center gap-1">
                    F
                    <SortIcon field="feminino" />
                  </div>
                </th>
                <th
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center gap-1">
                    Total
                    <SortIcon field="total" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-xs text-gray-900">{item.motivacao}</td>
                  <td className="px-3 py-2 text-xs text-gray-900">{item.masculino}</td>
                  <td className="px-3 py-2 text-xs text-gray-900">{item.feminino}</td>
                  <td className="px-3 py-2 text-xs font-medium text-gray-900">{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-center mt-2 gap-1 flex-shrink-0">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-3 h-3" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-2 py-1 rounded text-xs font-medium ${currentPage === page
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}