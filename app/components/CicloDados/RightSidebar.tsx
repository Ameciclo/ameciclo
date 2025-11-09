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
  mapSelection?: {lat: number, lng: number, radius: number, street?: string, streets?: Street[], clickPosition?: {x: number, y: number}};
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
      setLoading(true);
      setError(null);
      
      fetchContagemData(mapSelection.lat, mapSelection.lng)
        .then(data => {
          console.log('📊 RightSidebar: Dados de contagem recebidos:', data);
          
          // Processar dados da FeatureCollection
          let totalCount = 0;
          let details = data;
          
          if (data?.features && Array.isArray(data.features)) {
            // Somar todos os counts dos features
            totalCount = data.features.reduce((sum: number, feature: any) => {
              return sum + (feature.properties?.count || 0);
            }, 0);
          } else if (data?.summary?.total_locations) {
            totalCount = data.summary.total_locations;
          }
          
          setCardData({
            contagens: {
              title: mapSelection.street || 'Ponto selecionado',
              value: totalCount.toString(),
              details: details,
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
  
  const contagensChart = useMemo(() => <MiniContagensChart />, []);
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
        if (contagemData?.features && Array.isArray(contagemData.features)) {
          const details = [];
          
          // Mostrar coordenadas do ponto selecionado
          if (mapSelection?.lat && mapSelection?.lng) {
            details.push(`Coordenadas: ${mapSelection.lat.toFixed(5)}, ${mapSelection.lng.toFixed(5)}`);
          }
          

          
          const totalFeatures = contagemData.features.length;
          details.push(`${totalFeatures} ponto${totalFeatures > 1 ? 's' : ''} próximo${totalFeatures > 1 ? 's' : ''}`);
          
          return details.join(' • ') + '\nFonte: <a href="/dados/contagens" class="text-blue-600 underline">página de contagens</a>';
        } else if (contagemData) {
          const details = [];
          if (contagemData.male_count) details.push(`Homens: ${contagemData.male_count}`);
          if (contagemData.female_count) details.push(`Mulheres: ${contagemData.female_count}`);
          if (contagemData.date) details.push(`Data: ${new Date(contagemData.date).toLocaleDateString('pt-BR')}`);
          if (contagemData.summary?.total_locations) details.push(`Total: ${contagemData.summary.total_locations} locais`);
          return details.join(' • ') + '\nFonte: <a href="/dados/contagens" class="text-blue-600 underline">página de contagens</a>';
        }
        return "contagens de ciclistas (Jan/2024)\nFonte: <a href='/dados/contagens' class='text-blue-600 underline'>página de contagens</a>";
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
      metrics: [{label: "Aumento 4%", value: "(2019)", trend: "up"}],
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