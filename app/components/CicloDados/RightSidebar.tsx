import { useState, useMemo, useEffect } from 'react';
import { MiniContagensChart, MiniSinistrosChart, MiniInfraChart, MiniVelocidadeChart, MiniFluxoChart, MiniGeneroChart, MiniCaracteristicasChart, MiniInfraestruturaChart, MiniAcessibilidadeChart } from './utils/chartData';
import { StreetSelectionModal } from './StreetSelectionModal';
import { fetchContagemData } from '~/services/contagem.service';


interface Street {
  id: string;
  name: string;
  distance: number;
}

interface RightSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  viewMode: 'map' | 'mural';
  mapSelection?: {lat: number, lng: number, radius: number, street?: string, streets?: Street[], clickPosition?: {x: number, y: number}, pointData?: any};
}

interface CardData {
  id: string;
  title: string;
  value: string;
  hasData: boolean;
  chart?: React.ReactNode;
  description?: string;
  metrics?: Array<{label: string, value: string, trend?: 'up'|'down'}>;
}

function ChartDataCards({ mapSelection, collapsedCards, toggleCard }: { mapSelection?: {lat: number, lng: number, radius: number, street?: string, streets?: Street[], clickPosition?: {x: number, y: number}}, collapsedCards: Set<string>, toggleCard: (cardId: string) => void }) {
  const [infraPercentage, setInfraPercentage] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataAvailability, setDataAvailability] = useState<any>(null);
  const [cardData, setCardData] = useState<Record<string, any>>({});
  
  // Fetch counting data when mapSelection changes
  useEffect(() => {
    if (mapSelection?.lat && mapSelection?.lng) {
      // Se temos dados do ponto clicado, usar diretamente
      if (mapSelection.pointData?.totalCyclists !== undefined) {
        console.log('📊 RightSidebar: Usando dados do ponto clicado:', mapSelection.pointData);
        
        // Calcular percentual de mulheres se disponível
        let womenPercentage = '12%'; // fallback
        if (mapSelection.pointData.counts && mapSelection.pointData.counts.length > 0) {
          const latestCount = mapSelection.pointData.counts[0];
          if (latestCount.characteristics?.women && latestCount.total_cyclists > 0) {
            const percentage = Math.round((latestCount.characteristics.women / latestCount.total_cyclists) * 100);
            womenPercentage = `${percentage}%`;
          }
        }
        
        // Calcular valor do card baseado no total de todos os anos
        let cardValue = mapSelection.pointData.totalCyclists.toString();
        if (mapSelection.pointData.counts && mapSelection.pointData.counts.length > 0) {
          // Somar todos os ciclistas de todas as contagens
          const totalAllYears = mapSelection.pointData.counts.reduce((sum: number, count: any) => {
            return sum + (count.total_cyclists || 0);
          }, 0);
          cardValue = totalAllYears.toString();
        }
        
        setCardData({
          contagens: {
            title: mapSelection.street || 'Ponto selecionado',
            value: cardValue,
            details: mapSelection.pointData,
            coordinates: { lat: mapSelection.lat, lng: mapSelection.lng }
          },
          genero: {
            title: 'Percentual de mulheres',
            value: womenPercentage,
            details: mapSelection.pointData
          }
        });
        setDataAvailability({
          available: {
            contagens: true,
            sinistros: true,
            infraestrutura: true,
            sinistrosTotais: true,
            velocidade: true,
            fluxo: true,
            genero: true,
            participacaoFeminina: false,
            caracteristicas: true,
            infraestruturaInfo: true,
            acessibilidade: true
          },
          street: mapSelection.street || 'Ponto selecionado'
        });
        setLoading(false);
        return;
      }
      
      // Caso contrário, buscar dados da API
      setLoading(true);
      setError(null);
      
      fetchContagemData(mapSelection.lat, mapSelection.lng)
        .then(data => {
          console.log('📊 RightSidebar: Dados de contagem recebidos:', data);
          
          setCardData({
            contagens: {
              title: mapSelection.street || 'Ponto selecionado',
              value: '0',
              details: data,
              coordinates: { lat: mapSelection.lat, lng: mapSelection.lng }
            }
          });
          setDataAvailability({
            available: {
              contagens: true,
              sinistros: true,
              infraestrutura: true,
              sinistrosTotais: true,
              velocidade: true,
              fluxo: true,
              genero: true,
              participacaoFeminina: false,
              caracteristicas: true,
              infraestruturaInfo: true,
              acessibilidade: true
            },
            street: mapSelection.street || 'Ponto selecionado'
          });
          setLoading(false);
        })
        .catch(err => {
          console.error('❌ RightSidebar: Erro ao buscar dados de contagem:', err);
          setError('Erro ao carregar dados de contagem');
          setLoading(false);
        });
    } else {
      console.log('🔄 RightSidebar: Nenhuma seleção válida:', mapSelection);
    }
  }, [mapSelection]);
  
  const getCardData = (cardId: string) => cardData[cardId] || null;
  
  // Use real data availability or fallback to mock data
  const mockDataAvailability = {
    contagens: true,
    sinistros: true,
    infraestrutura: true,
    sinistrosTotais: true,
    velocidade: true,
    fluxo: true,
    genero: true,
    participacaoFeminina: false,
    caracteristicas: true,
    infraestruturaInfo: true,
    acessibilidade: true
  };
  
  const availability = dataAvailability?.available || mockDataAvailability;
  
  const contagensChart = useMemo(() => {
    const contagemData = getCardData('contagens')?.details;
    console.log('📊 Chart data:', contagemData);
    
    // Verificar se temos dados do ponto clicado com counts
    if (contagemData?.counts && Array.isArray(contagemData.counts) && contagemData.counts.length > 0) {
      console.log('📊 Processing counts:', contagemData.counts);
      
      // Agrupar dados por ano e somar totais
      const yearlyData = contagemData.counts.reduce((acc: any, count: any) => {
        const year = count.date ? new Date(count.date).getFullYear() : new Date().getFullYear();
        if (!acc[year]) {
          acc[year] = { year, total: 0 };
        }
        acc[year].total += count.total_cyclists || 0;
        return acc;
      }, {});
      
      const chartData = Object.values(yearlyData)
        .sort((a: any, b: any) => a.year - b.year);
      
      console.log('📊 Yearly chart data:', chartData);
      
      if (chartData.length > 0) {
        return (
          <div className="h-12 flex items-end justify-between gap-1">
            {chartData.map((item: any, index: number) => {
              const maxValue = Math.max(...chartData.map((d: any) => d.total));
              const height = Math.max(4, (item.total / maxValue) * 36);
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="bg-blue-500 w-full rounded-t" 
                    style={{ height: `${height}px` }}
                    title={`${item.year}: ${item.total} ciclistas`}
                  />
                  <span className="text-[8px] text-gray-500 mt-1">{item.year}</span>
                </div>
              );
            })}
          </div>
        );
      }
    }
    
    // Fallback para dados do mapSelection.pointData
    if (mapSelection?.pointData?.counts && Array.isArray(mapSelection.pointData.counts)) {
      console.log('📊 Using mapSelection pointData counts:', mapSelection.pointData.counts);
      
      const yearlyData = mapSelection.pointData.counts.reduce((acc: any, count: any) => {
        const year = count.date ? new Date(count.date).getFullYear() : new Date().getFullYear();
        if (!acc[year]) {
          acc[year] = { year, total: 0 };
        }
        acc[year].total += count.total_cyclists || 0;
        return acc;
      }, {});
      
      const chartData = Object.values(yearlyData)
        .sort((a: any, b: any) => a.year - b.year);
      
      if (chartData.length > 0) {
        return (
          <div className="h-12 flex items-end justify-between gap-1">
            {chartData.map((item: any, index: number) => {
              const maxValue = Math.max(...chartData.map((d: any) => d.total));
              const height = Math.max(4, (item.total / maxValue) * 36);
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="bg-blue-500 w-full rounded-t" 
                    style={{ height: `${height}px` }}
                    title={`${item.year}: ${item.total} ciclistas`}
                  />
                  <span className="text-[8px] text-gray-500 mt-1">{item.year}</span>
                </div>
              );
            })}
          </div>
        );
      }
    }
    
    return <MiniContagensChart />;
  }, [cardData, mapSelection]);
  const sinistrosChart = useMemo(() => <MiniSinistrosChart />, []);
  const velocidadeChart = useMemo(() => <MiniVelocidadeChart />, []);
  const fluxoChart = useMemo(() => <MiniFluxoChart />, []);
  const generoChart = useMemo(() => <MiniGeneroChart />, []);
  const caracteristicasChart = useMemo(() => <MiniCaracteristicasChart />, []);
  const infraestruturaChart = useMemo(() => <MiniInfraestruturaChart />, []);
  const acessibilidadeChart = useMemo(() => <MiniAcessibilidadeChart />, []);
  
  // Helper function to get card data with fallback
  const getCardValue = (cardId: string, fallback: string) => {
    const data = getCardData(cardId);
    return data?.value || fallback;
  };
  
  const getCardTitle = (cardId: string, fallback: string) => {
    const data = getCardData(cardId);
    return data?.title || fallback;
  };
  
  // Mock data for infrastructure rating (from IDECiclo API)
  const infraRatingData = {
    notaGeral: 4.4,
    extensaoKm: 8.033,
    avaliacoes: 3,
    caracteristicas: {
      iluminacao: "Boa",
      controleVelocidade: "Ruim",
      situacaoProtecao: "Boa",
      tipoPavimento: "Asfalto",
      protecaoInvasao: "Boa",
      acessoEstrutura: "Bom",
      confortoEstrutura: "Bom"
    }
  };
  
  // Generate specific IDECiclo link based on street name
  const generateIdecicloLink = (streetName: string) => {
    if (streetName.includes('Agamenon Magalhães')) {
      return '/dados/ideciclo/recife-av-governador-agamenon-magalhaes-pista-oeste';
    }
    const slug = streetName
      .toLowerCase()
      .replace(/\./g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    return `/dados/ideciclo/recife-${slug}`;
  };
  
  const getRatingLabel = (nota: number) => {
    if (nota >= 7.5) return { label: "Ótimo", color: "text-green-600" };
    if (nota >= 5.5) return { label: "Bom", color: "text-blue-600" };
    if (nota >= 3.5) return { label: "Ruim", color: "text-orange-600" };
    return { label: "Muito Ruim", color: "text-red-600" };
  };
  
  const rating = getRatingLabel(infraRatingData.notaGeral);
  
  const allCards: CardData[] = [
    {
      id: 'contagens',
      title: getCardTitle('contagens', mapSelection?.street || dataAvailability?.street || "Ponto de Contagem"),
      value: getCardValue('contagens', "2.846"),
      description: (() => {
        const contagemData = getCardData('contagens')?.details;
        if (contagemData?.counts && Array.isArray(contagemData.counts)) {
          const details = [];
          
          if (contagemData.counts.length > 1) {
            const years = contagemData.counts.map((c: any) => new Date(c.date).getFullYear()).sort();
            const firstYear = years[0];
            const lastYear = years[years.length - 1];
            details.push(`${contagemData.counts.length} contagens (${firstYear}-${lastYear})`);
            
            // Calcular tendência
            const firstCount = contagemData.counts.find((c: any) => new Date(c.date).getFullYear() === firstYear);
            const lastCount = contagemData.counts.find((c: any) => new Date(c.date).getFullYear() === lastYear);
            if (firstCount && lastCount) {
              const change = ((lastCount.total_cyclists - firstCount.total_cyclists) / firstCount.total_cyclists) * 100;
              const trend = change > 0 ? 'aumento' : 'redução';
              details.push(`${trend} de ${Math.abs(Math.round(change))}%`);
            }
          } else {
            const count = contagemData.counts[0];
            details.push(`Única contagem em ${new Date(count.date).getFullYear()}`);
          }
          
          return details.join(' • ') + '\nFonte: <a href="/dados/contagens" class="text-blue-600 underline">página de contagens</a>';
        }
        return "contagens de ciclistas\nFonte: <a href='/dados/contagens' class='text-blue-600 underline'>página de contagens</a>";
      })(),
      chart: contagensChart,
      hasData: availability.contagens
    },
    {
      id: 'sinistros',
      title: "Vítimas fatais",
      value: getCardValue('sinistros', "78"),
      chart: sinistrosChart,
      description: "Fonte: <a href='/dados/sinistros' class='text-blue-600 underline'>página de sinistros</a>",
      hasData: availability.sinistros
    },
    {
      id: 'infraestrutura',
      title: "Infra. cicloviária executada",
      value: `${infraPercentage}%`,
      chart: <MiniInfraChart onPercentageChange={setInfraPercentage} />,
      description: "Fonte: <a href='/dados/observatorio/execucao_cicloviaria' class='text-blue-600 underline'>página de execução cicloviária</a>",
      hasData: availability.infraestrutura
    },
    {
      id: 'sinistrosTotais',
      title: "Sinistros Totais",
      value: getCardValue('sinistrosTotais', "581"),
      hasData: availability.sinistrosTotais,
      metrics: [
        {label: "Redução dos Fatais", value: "12%", trend: "up"},
        {label: "Aumento nos não fatais", value: "11%", trend: "down"}
      ],
      description: "Fonte: <a href='/dados/sinistros' class='text-blue-600 underline'>página de sinistros</a>"
    },

    {
      id: 'fluxo',
      title: "Fluxo de ciclistas",
      value: getCardValue('fluxo', "6,560"),
      chart: fluxoChart,
      description: "Horário de pico: 423",
      hasData: availability.fluxo
    },
    {
      id: 'genero',
      title: "Percentual de mulheres",
      value: getCardValue('genero', "12%"),
      chart: generoChart,
      metrics: (() => {
        const generoData = getCardData('genero');
        if (generoData?.details?.counts?.[0]?.characteristics) {
          const chars = generoData.details.counts[0].characteristics;
          const total = generoData.details.counts[0].total_cyclists;
          return [
            {label: "Mulheres", value: `${chars.women || 0}`, trend: undefined},
            {label: "Total", value: `${total}`, trend: undefined}
          ];
        }
        return [{label: "Aumento 4%", value: "(2019)", trend: "up"}];
      })(),
      description: "Fonte: <a href='/dados/perfil' class='text-blue-600 underline'>página de perfil</a>",
      hasData: availability.genero
    },
    {
      id: 'caracteristicas',
      title: "Características dos ciclistas",
      value: "Tipos",
      chart: caracteristicasChart,
      description: "Fonte: <a href='/dados/ideciclo' class='text-blue-600 underline'>IDECiclo</a>",
      hasData: availability.caracteristicas
    },
    {
      id: 'infraestruturaInfo',
      title: "Avaliação da Via",
      value: rating.label,
      chart: infraestruturaChart,
      hasData: availability.infraestruturaInfo,
      description: `Nota: ${infraRatingData.notaGeral} • ${infraRatingData.extensaoKm}km • 2023\nFonte: <a href='${generateIdecicloLink(dataAvailability?.street || "Av. Gov. Agamenon Magalhães")}' class='text-blue-600 underline'>IDECiclo página da via específica</a>`
    },
    {
      id: 'viasInseguras',
      title: "Ranking Vias Inseguras",
      value: "Top 5",
      description: "Fonte: <a href='/dados/vias-inseguras' class='text-blue-600 underline'>página vias inseguras</a>",
      hasData: availability.acessibilidade
    }
  ];
  
  // Filter cards that have data available
  const visibleCards = allCards.filter(card => card.hasData);
  

  
  if (loading) {
    return (
      <div className="px-3 pb-3">
        <div className="text-center py-8 text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm">Carregando dados...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="px-3 pb-3">
        <div className="text-center py-8 text-red-500">
          <p className="text-sm">Erro ao carregar dados</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }
  
  if (visibleCards.length === 0 && !mapSelection) {
    return (
      <div className="px-3 pb-3">
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Nenhum dado disponível</p>
          <p className="text-xs mt-1">para esta localização</p>
          <p className="text-xs mt-2">Clique no mapa para selecionar uma área</p>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('demo-map-selection'))}
            className="mt-3 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors mr-2"
          >
            Demo: Uma via
          </button>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('demo-multiple-streets'))}
            className="mt-3 px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
          >
            Demo: Duas vias
          </button>
        </div>
      </div>
    );
  }
  
  if (visibleCards.length === 0) {
    return (
      <div className="px-3 pb-3">
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Nenhum dado disponível</p>
          <p className="text-xs mt-1">para esta localização</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="px-3 pb-3">

        <div className="space-y-4">
          {visibleCards.map((item) => {
            const isCollapsed = collapsedCards.has(item.id);
            return (
              <div key={item.id} className="border rounded-lg p-3 shadow-sm bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-800 text-sm leading-tight">{item.title}</h3>
                  <button
                    onClick={() => toggleCard(item.id)}
                    className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <svg className={`w-3 h-3 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                {!isCollapsed && (
                  <>
                    {item.value && (
                      <p className={`text-2xl font-bold mb-2 ${
                        item.id === 'infraestruturaInfo' ? rating.color : 'text-black'
                      }`}>
                        {item.value}
                      </p>
                    )}
                    {item.chart && <div className="mb-2">{item.chart}</div>}
                    {item.metrics && (
                      <div className="space-y-1 mb-2">
                        {item.metrics.map((metric, i) => (
                          <p key={i} className="text-xs text-gray-600 flex items-center justify-between">
                            <span>{metric.label}:</span>
                            <span className="font-medium">
                              {metric.value}
                              {metric.trend && (
                                <span className={metric.trend === 'up' ? 'text-green-500 ml-1' : 'text-red-500 ml-1'}>
                                  {metric.trend === 'up' ? '▲' : '▼'}
                                </span>
                              )}
                            </span>
                          </p>
                        ))}
                      </div>
                    )}
                    {item.description && (
                      <p 
                        className="text-xs text-gray-500 mt-2 whitespace-pre-line"
                        dangerouslySetInnerHTML={{ __html: item.description }}
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      

    </>
  );
}

export function RightSidebar({ isOpen, onToggle, viewMode, mapSelection }: RightSidebarProps) {
  const [showStreetModal, setShowStreetModal] = useState(false);
  const [selectedStreet, setSelectedStreet] = useState<string | null>(null);
  const [collapsedCards, setCollapsedCards] = useState<Set<string>>(new Set());
  
  const toggleCard = (cardId: string) => {
    setCollapsedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };
  
  const collapseAll = () => {
    setCollapsedCards(new Set(['contagens', 'sinistros', 'infraestrutura', 'sinistrosTotais', 'fluxo', 'genero', 'caracteristicas', 'infraestruturaInfo', 'viasInseguras']));
  };
  
  const expandAll = () => {
    setCollapsedCards(new Set());
  };
  
  const allCollapsed = collapsedCards.size > 0;

  // Handle multiple streets from mapSelection
  useEffect(() => {
    if (mapSelection?.streets && mapSelection.streets.length > 1) {
      setShowStreetModal(true);
    }
  }, [mapSelection]);

  const handleStreetSelect = (street: Street) => {
    setSelectedStreet(street.name);
    setShowStreetModal(false);
    // Here you would normally update the mapSelection or trigger data loading
  };

  // Demo event listener
  useEffect(() => {
    const handleDemoMultipleStreets = () => {
      setShowStreetModal(true);
    };

    window.addEventListener('demo-multiple-streets', handleDemoMultipleStreets);
    return () => window.removeEventListener('demo-multiple-streets', handleDemoMultipleStreets);
  }, []);

  if (viewMode !== 'map') return null;

  return (
    <>
      <aside className={`hidden md:flex bg-white border-l flex-col transition-all duration-300 flex-shrink-0 overflow-hidden ${
        isOpen ? 'w-80' : 'w-0'
      }`} style={{height: '100%'}}>
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className={`bg-blue-500 flex items-center justify-between ${
            isOpen ? 'p-3 mb-4' : 'p-2 m-2 flex-col gap-2'
          }`}>
            <div className="flex items-center gap-2">
              <button 
                onClick={onToggle}
                className="hover:bg-white hover:bg-opacity-20 rounded text-white transition-colors p-1"
                title={isOpen ? 'Minimizar' : 'Expandir'}
              >
                <svg className={`w-4 h-4 transition-transform ${
                  isOpen ? '' : 'rotate-180'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {isOpen && <h2 className="font-semibold text-white">Dados em gráficos</h2>}
            </div>
            {isOpen && (
              <button
                onClick={allCollapsed ? expandAll : collapseAll}
                className="hover:bg-white hover:bg-opacity-20 rounded text-white transition-colors p-1"
                title={allCollapsed ? 'Expandir todos' : 'Recolher todos'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {allCollapsed ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  ) : (
                    <>
                      <rect x="3" y="3" width="7" height="7" strokeWidth={2} />
                      <rect x="14" y="3" width="7" height="7" strokeWidth={2} />
                      <rect x="3" y="14" width="7" height="7" strokeWidth={2} />
                      <rect x="14" y="14" width="7" height="7" strokeWidth={2} />
                    </>
                  )}
                </svg>
              </button>
            )}
          </div>
          
          {isOpen && <ChartDataCards mapSelection={mapSelection} collapsedCards={collapsedCards} toggleCard={toggleCard} />}
        </div>
      </aside>
      
      {/* Floating toggle button when minimized - hidden on mobile */}
      {!isOpen && (
        <button 
          onClick={onToggle}
          className="hidden md:block fixed top-1/2 -translate-y-1/2 right-4 z-[55] bg-white border rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          title="Expandir gráficos"
        >
          <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
      
      {/* Street Selection Modal - rendered at root level */}
      <StreetSelectionModal
        isOpen={showStreetModal}
        streets={mapSelection?.streets || [
          { id: 'street_1', name: 'Av. Gov. Agamenon Magalhães', distance: 45 },
          { id: 'street_2', name: 'Rua da Aurora', distance: 78 }
        ]}
        onSelectStreet={handleStreetSelect}
        onClose={() => setShowStreetModal(false)}
        clickPosition={mapSelection?.clickPosition || { x: 400, y: 300 }}
      />
    </>
  );
}