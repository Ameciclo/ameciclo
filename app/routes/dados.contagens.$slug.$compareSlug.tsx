import Banner from "~/components/Commom/Banner";
import { useLoaderData, Link, Await } from "@remix-run/react";
import { Suspense } from "react";
import { loader } from "~/loader/dados.contagens.$slug.$compareSlug";
export { loader };
import React from "react";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { HourlyCyclistsChart } from "~/components/Contagens/HourlyCyclistsChart";
import { CountingComparisionTable } from "~/components/Contagens/CountingComparisionTable";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { colors } from "~/components/Charts/FlowChart/FlowContainer";
import { VerticalStatisticsBoxes } from "~/components/Contagens/VerticalStatisticsBoxes";

interface Series {
  name: string | undefined;
  data: number[];
  visible?: boolean;
}

interface CountEditionSummary {
  max_hour: number;
  total_cyclists: number;
  total_cargo: number;
  total_helmet: number;
  total_juveniles: number;
  total_motor: number;
  total_ride: number;
  total_service: number;
  total_shared_bike: number;
  total_sidewalk: number;
  total_women: number;
  total_wrong_way: number;
}

interface CountEditionCoordinates {
  point: {
    x: number;
    y: number;
  };
  type: string;
  name: string;
}

interface CountEditionSession {
  start_time: string;
  end_time: string;
  total_cyclists: number;
  characteristics: {
    [key: string]: number;
  };
  quantitative: {
    [key: string]: number;
  };
}

interface CountEditionDirections {
  origin: string;
  destin: string;
  origin_cardinal: string;
  destin_cardinal: string;
}

interface CountEdition {
  id: number;
  slug: string;
  name: string;
  date: string;
  summary: CountEditionSummary;
  coordinates: CountEditionCoordinates[];
  sessions: {
    [key: string]: CountEditionSession;
  };
  directions: {
    [key: string]: CountEditionDirections;
  };
}

type pointData = {
  key: string;
  latitude: number;
  longitude: number;
  popup?: any;
  size?: number;
  color?: string;
  type?: string;
};



const characteristicsMap = new Map([
  ["total_cyclists", { name: "Total" }],
  ["total_women", { name: "Mulheres" }],
  ["total_child", { name: "Crianças e Adolescentes" }],
  ["total_ride", { name: "Carona" }],
  ["total_helmet", { name: "Capacete" }],
  ["total_service", { name: "Serviço" }],
  ["total_cargo", { name: "Cargueira" }],
  ["total_shared_bike", { name: "Compartilhada" }],
  ["total_sidewalk", { name: "Calçada" }],
  ["total_wrong_way", { name: "Contramão" }],
]);

function getChartData(data: CountEdition[]) {
    const series: Series[] = [];
    const hours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

    data.forEach((countData, index) => {
        const countSessions = Object.values(countData.sessions);
        const hourlyData = new Array(hours.length).fill(0);
        
        countSessions.forEach((session) => {
            const hour = parseInt(session.start_time.split('T')[1].split(':')[0]);
            const hourIndex = hours.indexOf(hour);
            if (hourIndex !== -1) {
                hourlyData[hourIndex] += session.total_cyclists;
            }
        });

        series.push({
            name: countData.name,
            data: hourlyData,
            visible: true,
        });
    });

    return { series, hours };
}

function getBoxesForCountingComparision(data: CountEdition[]) {
  const boxes = data.map((d) => {
    const { name, summary } = d;
    return {
      title: name,
      value: summary.total_cyclists,
    };
  });
  return boxes;
}

function getPointsDataForComparingCounting(data: CountEdition[]) {
  const pointColors = ["#FF0000", "#0000FF"]; // Vermelho e Azul
  const points = data.map((d, index) => {
    const { name, coordinates, summary, date, slug } = d;
    const [centralPoint] = coordinates;
    // Ensure coordinates are valid numbers before returning the point
    if (typeof centralPoint.point.longitude === 'number' && typeof centralPoint.point.latitude === 'number' && !isNaN(centralPoint.point.longitude) && !isNaN(centralPoint.point.latitude)) {
      return {
        key: name,
        latitude: centralPoint.point.latitude,
        longitude: centralPoint.point.longitude,
        color: pointColors[index % pointColors.length], // Assign color based on index
        popup: {
          name: name,
          total: summary.total_cyclists,
          date: new Intl.DateTimeFormat("pt-BR").format(new Date(date)),
          url: `/dados/contagens/${slug}`,
          obs: ""
        },
        size: Math.round((summary.total_cyclists || 0) / 250) + 15,
        type: "Contagem",
      };
    }
    return null; // Return null for invalid points
  }).filter(Boolean); // Filter out null values
  return points;
}



const Tooltip = ({ children, text }: { children: React.ReactNode; text: string }) => {
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = React.useState(false);

  const handleMouseEnter = () => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      if (rect.left < 10) {
        setAdjustedPosition(true);
      } else {
        setAdjustedPosition(false);
      }
    }
  };

  return (
    <div className="group relative inline-block" onMouseEnter={handleMouseEnter}>
      {children}
      <div 
        ref={tooltipRef}
        className={`absolute bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap ${
          adjustedPosition ? 'left-2.5' : 'left-1/2 transform -translate-x-1/2'
        }`}
      >
        {text}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
      </div>
    </div>
  );
};

export default function Compare() {
  const { dataPromise, pageDataPromise, boxesPromise, toCompare } = useLoaderData<typeof loader>();

  return (
    <main className="flex-auto">
      <Suspense fallback={<div className="animate-pulse bg-gray-300 h-64" />}>
        <Await resolve={pageDataPromise}>
          {(pageData) => (
            <Banner image={pageData.pageCover.cover.url} alt="Comparação de contagens" />
          )}
        </Await>
      </Suspense>
      
      <Suspense fallback={<div className="bg-ameciclo h-12 animate-pulse" />}>
        <Await resolve={dataPromise}>
          {(data) => (
            <div className="bg-ameciclo text-white py-2 px-4 uppercase flex items-center text-sm md:text-base">
              <div className="container mx-auto">
                <nav className="bg-grey-light rounded font-sans w-full">
                  <ol className="list-none p-0 inline-flex text-xs md:text-sm">
                    <li className="flex items-center">
                      <Link to="/" className="text-white">Página Inicial</Link>
                      <svg className="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                        <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
                      </svg>
                    </li>
                    <li className="flex items-center">
                      <Link to="/dados" className="text-white">Dados</Link>
                      <svg className="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                        <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
                      </svg>
                    </li>
                    <li className="flex items-center">
                      <Link to="/dados/contagens" className="text-white">Contagens</Link>
                      <svg className="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                        <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
                      </svg>
                    </li>
                    {data.map((count: CountEdition, index: number) => (
                      <li key={index} className="flex items-center">
                        <Link to={`/dados/contagens/${count.slug}`} className="text-white">{count.name}</Link>
                        <svg className="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                          <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
                        </svg>
                      </li>
                    ))}
                    <li className="flex items-center">
                      <span>Comparação</span>
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          )}
        </Await>
      </Suspense>
      
      <section className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Comparação entre Contagens</h1>
          <p className="text-lg text-gray-600">Análise comparativa dos dados de contagem de ciclistas</p>
        </div>

        <Suspense fallback={<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"><div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div><div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div></div>}>
          <Await resolve={Promise.all([dataPromise, boxesPromise])}>
            {([data, boxesResult]) => {
              const boxes = boxesResult.boxes;
              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {boxes.map((box: any, index: number) => {
            const colors = {
              bg: index === 0 ? 'bg-red-50' : 'bg-blue-50',
              border: index === 0 ? 'border-red-200' : 'border-blue-200',
              text: index === 0 ? 'text-red-700' : 'text-blue-700',
              accent: index === 0 ? 'bg-red-500' : 'bg-blue-500'
            };
            
                    return (
                      <div key={index} className={`${colors.bg} ${colors.border} border-2 rounded-lg p-6 shadow-lg`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 ${colors.accent} rounded-full`}></div>
                            <span className="text-sm font-medium text-gray-600">{data[index]?.name || `Ponto ${index + 1}`}</span>
                          </div>
                          <span className="text-sm text-gray-500">{box.date}</span>
                        </div>
                        
                        <h2 className={`text-2xl font-bold ${colors.text} mb-6`}>{box.title}</h2>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <Tooltip text="Total geral de ciclistas contabilizados">
                              <span className="text-base font-medium text-gray-700 cursor-help">Total de Ciclistas</span>
                            </Tooltip>
                            <Tooltip text={`${box.value.toLocaleString('pt-BR')} ciclistas no total`}>
                              <span className={`text-3xl font-bold ${colors.text} cursor-help`}>
                                {box.value.toLocaleString('pt-BR')}
                              </span>
                            </Tooltip>
                          </div>
                          
                          {data[index] && (
                            <>
                              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <Tooltip text="Quantidade de mulheres ciclistas">
                                  <span className="text-base font-medium text-gray-700 cursor-help">Mulheres <span className="text-sm text-gray-500">({((data[index].summary.total_women / data[index].summary.total_cyclists) * 100).toFixed(1)}%)</span></span>
                                </Tooltip>
                                <Tooltip text={`${data[index].summary.total_women.toLocaleString('pt-BR')} mulheres ciclistas`}>
                                  <span className={`text-xl font-semibold ${colors.text} cursor-help`}>
                                    {data[index].summary.total_women.toLocaleString('pt-BR')}
                                  </span>
                                </Tooltip>
                              </div>
                              
                              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <Tooltip text="Ciclistas usando capacete de segurança">
                                  <span className="text-base font-medium text-gray-700 cursor-help">Com Capacete <span className="text-sm text-gray-500">({((data[index].summary.total_helmet / data[index].summary.total_cyclists) * 100).toFixed(1)}%)</span></span>
                                </Tooltip>
                                <Tooltip text={`${data[index].summary.total_helmet.toLocaleString('pt-BR')} ciclistas com capacete`}>
                                  <span className={`text-xl font-semibold ${colors.text} cursor-help`}>
                                    {data[index].summary.total_helmet.toLocaleString('pt-BR')}
                                  </span>
                                </Tooltip>
                              </div>
                              
                              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <Tooltip text="Ciclistas levando carona (uma pessoa leva outra na bicicleta)">
                                  <span className="text-base font-medium text-gray-700 cursor-help">Carona <span className="text-sm text-gray-500">({((data[index].summary.total_ride / data[index].summary.total_cyclists) * 100).toFixed(1)}%)</span></span>
                                </Tooltip>
                                <Tooltip text={`${data[index].summary.total_ride.toLocaleString('pt-BR')} ciclistas dando carona`}>
                                  <span className={`text-xl font-semibold ${colors.text} cursor-help`}>
                                    {data[index].summary.total_ride.toLocaleString('pt-BR')}
                                  </span>
                                </Tooltip>
                              </div>
                              
                              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <Tooltip text="Bicicletas a serviço: cargueiras com água, frutas, mercadorias ou entregadores de app">
                                  <span className="text-base font-medium text-gray-700 cursor-help">Serviço <span className="text-sm text-gray-500">({((data[index].summary.total_service / data[index].summary.total_cyclists) * 100).toFixed(1)}%)</span></span>
                                </Tooltip>
                                <Tooltip text={`${data[index].summary.total_service.toLocaleString('pt-BR')} bicicletas a serviço`}>
                                  <span className={`text-xl font-semibold ${colors.text} cursor-help`}>
                                    {data[index].summary.total_service.toLocaleString('pt-BR')}
                                  </span>
                                </Tooltip>
                              </div>
                              
                              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <Tooltip text="Bicicletas de carga transportando mercadorias">
                                  <span className="text-base font-medium text-gray-700 cursor-help">Bicicletas de Carga <span className="text-sm text-gray-500">({((data[index].summary.total_cargo / data[index].summary.total_cyclists) * 100).toFixed(1)}%)</span></span>
                                </Tooltip>
                                <Tooltip text={`${data[index].summary.total_cargo.toLocaleString('pt-BR')} bicicletas de carga`}>
                                  <span className={`text-xl font-semibold ${colors.text} cursor-help`}>
                                    {data[index].summary.total_cargo.toLocaleString('pt-BR')}
                                  </span>
                                </Tooltip>
                              </div>
                              
                              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <Tooltip text="Bicicletas compartilhadas como Bike Itaú, Bike Tem">
                                  <span className="text-base font-medium text-gray-700 cursor-help">Compartilhada <span className="text-sm text-gray-500">({((data[index].summary.total_shared_bike / data[index].summary.total_cyclists) * 100).toFixed(1)}%)</span></span>
                                </Tooltip>
                                <Tooltip text={`${data[index].summary.total_shared_bike.toLocaleString('pt-BR')} bicicletas compartilhadas`}>
                                  <span className={`text-xl font-semibold ${colors.text} cursor-help`}>
                                    {data[index].summary.total_shared_bike.toLocaleString('pt-BR')}
                                  </span>
                                </Tooltip>
                              </div>
                              
                              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <Tooltip text="Bicicletas pedalando pela calçada (não inclui quem está andando)">
                                  <span className="text-base font-medium text-gray-700 cursor-help">Calçada <span className="text-sm text-gray-500">({((data[index].summary.total_sidewalk / data[index].summary.total_cyclists) * 100).toFixed(1)}%)</span></span>
                                </Tooltip>
                                <Tooltip text={`${data[index].summary.total_sidewalk.toLocaleString('pt-BR')} ciclistas na calçada`}>
                                  <span className={`text-xl font-semibold ${colors.text} cursor-help`}>
                                    {data[index].summary.total_sidewalk.toLocaleString('pt-BR')}
                                  </span>
                                </Tooltip>
                              </div>
                              
                              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <Tooltip text="Bicicletas que vieram na contramão do trânsito">
                                  <span className="text-base font-medium text-gray-700 cursor-help">Contramão <span className="text-sm text-gray-500">({((data[index].summary.total_wrong_way / data[index].summary.total_cyclists) * 100).toFixed(1)}%)</span></span>
                                </Tooltip>
                                <Tooltip text={`${data[index].summary.total_wrong_way.toLocaleString('pt-BR')} ciclistas na contramão`}>
                                  <span className={`text-xl font-semibold ${colors.text} cursor-help`}>
                                    {data[index].summary.total_wrong_way.toLocaleString('pt-BR')}
                                  </span>
                                </Tooltip>
                              </div>
                              
                              <div className="flex justify-between items-center py-2">
                                <Tooltip text="Maior quantidade de ciclistas registrada em uma única hora">
                                  <span className="text-base font-medium text-gray-700 cursor-help">Pico em 1h <span className="text-sm text-gray-500">({((data[index].summary.max_hour / data[index].summary.total_cyclists) * 100).toFixed(1)}%)</span></span>
                                </Tooltip>
                                <Tooltip text={`${data[index].summary.max_hour.toLocaleString('pt-BR')} ciclistas no pico de uma hora`}>
                                  <span className={`text-xl font-semibold ${colors.text} cursor-help`}>
                                    {data[index].summary.max_hour.toLocaleString('pt-BR')}
                                  </span>
                                </Tooltip>
                              </div>
                            </>
                          )}
                          
                          <div className="pt-4">
                            <Link 
                              to={`/dados/contagens/${data[index]?.slug}`}
                              className={`inline-block w-full text-center py-3 px-4 ${colors.accent} text-white rounded-md hover:opacity-90 transition-opacity font-medium`}
                            >
                              Ver Detalhes Completos
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }}
          </Await>
        </Suspense>

        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-lg" />}>
          <Await resolve={dataPromise}>
            {(data) => {
              const pointsData = getPointsDataForComparingCounting(data);
              return (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                  <AmecicloMap pointsData={pointsData} height="500px" />
                </div>
              );
            }}
          </Await>
        </Suspense>

        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-lg" />}>
          <Await resolve={dataPromise}>
            {(data) => {
              const { series, hours } = getChartData(data);
              return (
                <HourlyCyclistsChart series={series as Series[]} hours={hours} />
              );
            }}
          </Await>
        </Suspense>

        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64" />}>
          <Await resolve={Promise.all([dataPromise, pageDataPromise])}>
            {([data, pageData]) => {
              const excludeIds = data.map((d: CountEdition) => d.id);
              const filteredData = pageData.otherCounts.filter((d: any) => !excludeIds.includes(d.id));
              return (
                <CountingComparisionTable
                  data={filteredData}
                  firstSlug={data[0]?.slug}
                />
              );
            }}
          </Await>
        </Suspense>
      </section>
    </main>
  );
}