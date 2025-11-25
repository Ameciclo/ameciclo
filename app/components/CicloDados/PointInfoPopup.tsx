import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, MapPin, AlertTriangle, Bike, BarChart3, Users, Calendar, Navigation, TrendingUp, Shield, Route, Clock, Target, Activity, Zap, Building2, Car, Ambulance, ArrowRight, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { POINT_CICLO_NEARBY } from '~/servers';
import { translateProfileData, translateBehavioralKey, calculatePercentage } from '~/utils/translations';

interface PointInfoPopupProps {
  lat: number;
  lng: number;
  onClose: () => void;
  initialTab?: string;
  extraData?: any;
}

interface PointData {
  location: {
    lat: number;
    lng: number;
    nearest_street: {
      name: string;
      official_name: string;
      total_length_meters: number;
      distance_to_point_meters: number;
    };
  };
  emergency_calls: {
    annual_history: Array<{ year: number; total_calls: number }>;
    last_month_data: { month: string; total_calls: number };
    by_category: Array<{ category: string; count: number }>;
    by_gender: Array<{ gender: string | null; count: number }>;
    by_age_group: Array<{ age_group: string; count: number }>;
  };
  bike_racks: {
    total: number;
    total_capacity: number;
    items: Array<{
      id: number;
      name: string;
      capacity: string;
      type: string;
      lat: number;
      lng: number;
      distance_meters: number;
    }>;
  };
  cyclist_counts: {
    counts: Array<{
      id: number;
      name: string;
      date: string;
      city: string;
      total_cyclists: number;
      distance_meters: number;
      characteristics: Record<string, number>;
    }>;
  };
  shared_bike: {
    has_stations: boolean;
    stations: Array<{
      id: number;
      name: string;
      capacity: number;
      distance_meters: number;
    }>;
  };
  cycling_infra: {
    existing: Array<{
      type: string;
      name: string;
      distance_meters: number;
    }>;
    planned_pdc: Array<{
      id: number;
      pdc_ref: string;
      typology: string;
      name: string;
      pdc_stretch: string;
      pdc_cities: string;
      pdc_km: number;
    }>;
  };
  cyclist_profile: {
    total_profiles: number;
    by_edition: Array<{
      edition: string;
      total_profiles: number;
      race_distribution: Record<string, number>;
      gender_distribution: Record<string, number>;
      age_distribution: Record<string, number>;
      education_distribution: Record<string, number>;
      income_distribution: Record<string, number>;
    }>;
  };
}

export function PointInfoPopup({ lat, lng, onClose, initialTab = 'overview', extraData }: PointInfoPopupProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared'>('idle');
  const [expandedEditions, setExpandedEditions] = useState<Set<string>>(new Set());
  const [expandedCounts, setExpandedCounts] = useState<Set<string>>(new Set());

  const toggleEdition = (edition: string) => {
    const newExpanded = new Set(expandedEditions);
    if (newExpanded.has(edition)) {
      newExpanded.delete(edition);
    } else {
      newExpanded.add(edition);
    }
    setExpandedEditions(newExpanded);
  };

  const toggleCount = (countId: string) => {
    const newExpanded = new Set(expandedCounts);
    if (newExpanded.has(countId)) {
      newExpanded.delete(countId);
    } else {
      newExpanded.add(countId);
    }
    setExpandedCounts(newExpanded);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Ponto CicloDados - Ameciclo',
      text: `Dados de ciclomobilidade para o ponto ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      url: `${window.location.origin}/dados/ciclodados?lat=${lat}&lon=${lng}&zoom=16`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus('shared');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setShareStatus('copied');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(shareData.url);
          setShareStatus('copied');
        } catch {
          // Silently fail if clipboard is not available
        }
      }
    }

    // Reset status após 2 segundos
    setTimeout(() => setShareStatus('idle'), 2000);
  };

  const { data: rawData, isLoading: loading, error } = useQuery({
    queryKey: ['point-info', lat, lng],
    queryFn: async () => {
      const response = await fetch(POINT_CICLO_NEARBY(lat, lng, 200));
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const apiData = await response.json();
      
      // Buscar pontos da prefeitura próximos
      try {
        const prefeituraResponse = await fetch('/dbs/PCR_CONTAGENS.json');
        if (prefeituraResponse.ok) {
          const prefeituraData = await prefeituraResponse.json();
          
          // Filtrar pontos da prefeitura num raio de 200m
          const nearbyPrefeituraPoints = prefeituraData.filter((ponto: any) => {
            const pointLat = ponto.location.coordinates[0];
            const pointLng = ponto.location.coordinates[1];
            const distance = Math.sqrt(
              Math.pow((pointLat - lat) * 111320, 2) + 
              Math.pow((pointLng - lng) * 111320 * Math.cos(lat * Math.PI / 180), 2)
            );
            return distance <= 200;
          });
          
          // Adicionar pontos da prefeitura aos dados de contagem
          if (nearbyPrefeituraPoints.length > 0) {
            const prefeituraCountsData = nearbyPrefeituraPoints.map((ponto: any) => ({
              id: `prefeitura_${ponto.name}_${ponto.date}`,
              name: ponto.name,
              date: new Date(ponto.date).toLocaleDateString('pt-BR'),
              city: 'Recife',
              total_cyclists: ponto.summary?.total || 0,
              distance_meters: Math.round(Math.sqrt(
                Math.pow((ponto.location.coordinates[0] - lat) * 111320, 2) + 
                Math.pow((ponto.location.coordinates[1] - lng) * 111320 * Math.cos(lat * Math.PI / 180), 2)
              )),
              characteristics: {
                cargo: Math.round((ponto.summary?.cargo_percent || 0) * (ponto.summary?.total || 0)),
                wrong_way: Math.round((ponto.summary?.wrong_way_percent || 0) * (ponto.summary?.total || 0))
              }
            }));
            
            // Merge com dados existentes da API
            if (apiData.cyclist_counts) {
              apiData.cyclist_counts.counts = [
                ...(apiData.cyclist_counts.counts || []),
                ...prefeituraCountsData
              ];
            } else {
              apiData.cyclist_counts = {
                counts: prefeituraCountsData
              };
            }
          }
        }
      } catch (prefeituraError) {
        console.warn('Erro ao buscar dados da prefeitura:', prefeituraError);
      }
      
      return apiData;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  // Merge data with extraData if available (mantido para compatibilidade)
  const data = rawData ? {
    ...rawData,
    cyclist_counts: {
      ...rawData.cyclist_counts,
      counts: [
        ...(rawData.cyclist_counts?.counts || []),
        ...(extraData?.prefeituraData ? extraData.prefeituraData.map((prefData: any, index: number) => ({
          id: 'prefeitura_extra_' + Date.now() + '_' + index,
          name: prefData.name,
          date: new Date(prefData.date).toLocaleDateString('pt-BR'),
          city: prefData.city,
          total_cyclists: prefData.total_cyclists,
          distance_meters: prefData.distance_meters,
          characteristics: {
            cargo: Math.round((prefData.cargo_percent || 0) * prefData.total_cyclists / 100),
            wrong_way: Math.round((prefData.wrong_way_percent || 0) * prefData.total_cyclists / 100)
          }
        })) : [])
      ]
    }
  } : rawData;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3">Carregando dados do ponto...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-red-600">Erro</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <p className="text-gray-700">{error?.message || 'Erro desconhecido'}</p>
          <button 
            onClick={onClose}
            className="mt-4 w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  if (!data && !extraData) return null;
  
  // Se não há dados da API mas há dados extras, criar estrutura mínima
  const finalData = data || {
    location: { lat, lng, nearest_street: { name: 'Localização', official_name: 'Localização', distance_to_point_meters: 0 } },
    cyclist_counts: {
      counts: extraData?.prefeituraData ? extraData.prefeituraData.map((prefData: any, index: number) => ({
        id: 'prefeitura_fallback_' + Date.now() + '_' + index,
        name: prefData.name,
        date: new Date(prefData.date).toLocaleDateString('pt-BR'),
        city: prefData.city,
        total_cyclists: prefData.total_cyclists,
        distance_meters: prefData.distance_meters,
        characteristics: {
          cargo: Math.round((prefData.cargo_percent || 0) * prefData.total_cyclists / 100),
          wrong_way: Math.round((prefData.wrong_way_percent || 0) * prefData.total_cyclists / 100)
        }
      })) : []
    }
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: MapPin },
    { id: 'location', label: 'Localização', icon: Navigation },
    { id: 'safety', label: 'Segurança', icon: Shield },
    { id: 'infrastructure', label: 'Infraestrutura', icon: Route },
    { id: 'counts', label: 'Contagens', icon: BarChart3 },
    { id: 'profile', label: 'Perfil', icon: Users },
    { id: 'analysis', label: 'Análises', icon: TrendingUp }
  ];

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin size={20} className="text-blue-500" />
              Informações do Ponto
            </h3>
            <p className="text-sm text-gray-600">
              {finalData.location.nearest_street.official_name} • {formatDistance(finalData.location.nearest_street.distance_to_point_meters)} da via
            </p>
          </div>
          <div className="flex items-center gap-2">
            {shareStatus !== 'idle' && (
              <span className="text-sm text-green-600 font-medium">
                {shareStatus === 'copied' ? '✓ Link copiado!' : '✓ Compartilhado!'}
              </span>
            )}
            <button 
              onClick={handleShare}
              className={`transition-colors p-2 rounded-lg ${
                shareStatus === 'idle' 
                  ? 'text-gray-500 hover:text-blue-600 hover:bg-blue-50' 
                  : 'text-green-600 bg-green-50'
              }`}
              title={shareStatus === 'copied' ? 'Link copiado!' : shareStatus === 'shared' ? 'Compartilhado!' : 'Compartilhar ponto'}
            >
              <Share2 size={20} />
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {(() => {
                const hasData = finalData.emergency_calls || 
                  (finalData.bike_racks && finalData.bike_racks.total > 0) ||
                  (finalData.cyclist_counts && finalData.cyclist_counts.counts?.length > 0) ||
                  (finalData.cyclist_profile && finalData.cyclist_profile.total_profiles > 0) ||
                  (finalData.shared_bike && finalData.shared_bike.has_stations) ||
                  (finalData.cycling_infra && (finalData.cycling_infra.existing?.length > 0 || finalData.cycling_infra.planned_pdc?.length > 0)) ||
                  finalData.location;
                
                if (!hasData) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>Nenhum dado disponível para este ponto</p>
                    </div>
                  );
                }
                
                return (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {finalData.emergency_calls && (
                        <div className="bg-red-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Ambulance size={20} className="text-red-500" />
                            <h4 className="font-semibold text-red-700">Emergências</h4>
                          </div>
                          <p className="text-2xl font-bold text-red-600">
                            {finalData.emergency_calls.annual_history?.reduce((sum, year) => sum + year.total_calls, 0) || 0}
                          </p>
                          <p className="text-sm text-red-600">chamadas totais</p>
                        </div>
                      )}

                      {finalData.bike_racks && finalData.bike_racks.total > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Bike size={20} className="text-blue-500" />
                            <h4 className="font-semibold text-blue-700">Bicicletários</h4>
                          </div>
                          <p className="text-2xl font-bold text-blue-600">{finalData.bike_racks.total}</p>
                          <p className="text-sm text-blue-600">{finalData.bike_racks.total_capacity} vagas</p>
                        </div>
                      )}

                      {finalData.cyclist_counts && finalData.cyclist_counts.counts?.length > 0 && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <BarChart3 size={20} className="text-green-500" />
                            <h4 className="font-semibold text-green-700">Contagens</h4>
                          </div>
                          <p className="text-2xl font-bold text-green-600">{finalData.cyclist_counts.counts.length}</p>
                          <p className="text-sm text-green-600">pontos próximos</p>
                        </div>
                      )}

                      {finalData.cyclist_profile && finalData.cyclist_profile.total_profiles > 0 && (
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Users size={20} className="text-purple-500" />
                            <h4 className="font-semibold text-purple-700">Perfis</h4>
                          </div>
                          <p className="text-2xl font-bold text-purple-600">{finalData.cyclist_profile.total_profiles}</p>
                          <p className="text-sm text-purple-600">ciclistas</p>
                        </div>
                      )}

                      {finalData.shared_bike && finalData.shared_bike.has_stations && (
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity size={20} className="text-orange-500" />
                            <h4 className="font-semibold text-orange-700">Bike PE</h4>
                          </div>
                          <p className="text-2xl font-bold text-orange-600">{finalData.shared_bike.stations?.length || 0}</p>
                          <p className="text-sm text-orange-600">estações</p>
                        </div>
                      )}

                      {finalData.cycling_infra && (finalData.cycling_infra.existing?.length > 0 || finalData.cycling_infra.planned_pdc?.length > 0) && (
                        <div className="bg-teal-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Route size={20} className="text-teal-500" />
                            <h4 className="font-semibold text-teal-700">Infraestrutura</h4>
                          </div>
                          <p className="text-2xl font-bold text-teal-600">
                            {(finalData.cycling_infra.existing?.length || 0) + (finalData.cycling_infra.planned_pdc?.length || 0)}
                          </p>
                          <p className="text-sm text-teal-600">vias próximas</p>
                        </div>
                      )}
                    </div>

                    {finalData.location && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Navigation size={18} />
                          Localização
                        </h4>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium">{finalData.location.nearest_street?.official_name || finalData.location.nearest_street?.name}</p>
                          <p className="text-sm text-gray-600">
                            Coordenadas: {finalData.location.lat.toFixed(6)}, {finalData.location.lng.toFixed(6)}
                          </p>
                          {finalData.location.nearest_street?.total_length_meters && (
                            <p className="text-sm text-gray-600">
                              Extensão da via: {formatDistance(finalData.location.nearest_street.total_length_meters)}
                            </p>
                          )}
                          {finalData.location.nearest_street?.distance_to_point_meters !== undefined && (
                            <p className="text-sm text-gray-600">
                              Distância da via: {formatDistance(finalData.location.nearest_street.distance_to_point_meters)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-6">
              {finalData.location ? (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin size={18} />
                    Informações Geográficas
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium mb-2">Coordenadas Exatas</h5>
                      <p className="text-sm text-gray-600">Latitude: {finalData.location.lat.toFixed(8)}</p>
                      <p className="text-sm text-gray-600">Longitude: {finalData.location.lng.toFixed(8)}</p>
                    </div>
                    
                    {finalData.location.nearest_street && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h5 className="font-medium mb-2">Via Mais Próxima</h5>
                        <p className="font-medium">{finalData.location.nearest_street.official_name || finalData.location.nearest_street.name}</p>
                        {finalData.location.nearest_street.name !== finalData.location.nearest_street.official_name && (
                          <p className="text-sm text-gray-600">Nome popular: {finalData.location.nearest_street.name}</p>
                        )}
                        {finalData.location.nearest_street.distance_to_point_meters !== undefined && (
                          <p className="text-sm text-gray-600">Distância: {formatDistance(finalData.location.nearest_street.distance_to_point_meters)}</p>
                        )}
                        {finalData.location.nearest_street.total_length_meters && (
                          <p className="text-sm text-gray-600">Extensão total: {formatDistance(finalData.location.nearest_street.total_length_meters)}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Navigation size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma informação de localização disponível para este ponto</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="space-y-6">
              {finalData.emergency_calls && (
                <>
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Clock size={18} />
                      Histórico Anual de Emergências
                    </h4>
                    <p className="text-xs text-gray-500 mb-3">
                      * O último ano ({new Date().getFullYear()}) contém dados até abril
                    </p>
                    {finalData.emergency_calls.annual_history?.length > 1 ? (
                      <div className="space-y-4">
                        {/* Chart */}
                        <div className="bg-white p-4 rounded-lg border">
                          <div className="relative h-48 w-full">
                            <svg className="w-full h-full" viewBox="0 0 800 200">
                              {/* Grid lines */}
                              <defs>
                                <pattern id="grid" width="80" height="20" patternUnits="userSpaceOnUse">
                                  <path d="M 80 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                                </pattern>
                              </defs>
                              <rect width="100%" height="100%" fill="url(#grid)" />
                              
                              {/* Chart line */}
                              {(() => {
                                const maxCalls = Math.max(...finalData.emergency_calls.annual_history.map(y => y.total_calls));
                                const minCalls = Math.min(...finalData.emergency_calls.annual_history.map(y => y.total_calls));
                                const range = maxCalls - minCalls || 1;
                                const years = finalData.emergency_calls.annual_history
                                  .sort((a, b) => a.year - b.year)
                                  .slice(-8);
                                const points = years.map((year, index) => {
                                  const x = 80 + (index * (640 / (years.length - 1 || 1)));
                                  const y = 170 - ((year.total_calls - minCalls) / range) * 120;
                                  return `${x},${y}`;
                                }).join(' ');
                                
                                return (
                                  <>
                                    <polyline
                                      fill="none"
                                      stroke="#dc2626"
                                      strokeWidth="3"
                                      points={points}
                                    />
                                    {years.map((year, index) => {
                                      const x = 80 + (index * (640 / (years.length - 1 || 1)));
                                      const y = 170 - ((year.total_calls - minCalls) / range) * 120;
                                      return (
                                        <g key={year.year}>
                                          <circle cx={x} cy={y} r="4" fill="#dc2626" />
                                          <text x={x} y={y - 10} textAnchor="middle" className="text-xs fill-gray-600">
                                            {year.total_calls}
                                          </text>
                                          <text x={x} y={190} textAnchor="middle" className="text-xs fill-gray-500">
                                            {year.year}
                                          </text>
                                        </g>
                                      );
                                    })}
                                  </>
                                );
                              })()}
                            </svg>
                          </div>
                        </div>
                        
                        {/* Summary cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {finalData.emergency_calls.annual_history
                            ?.sort((a, b) => a.year - b.year)
                            .slice(-8)
                            .map(year => (
                            <div key={year.year} className="bg-red-50 p-3 rounded-lg text-center">
                              <p className="font-bold text-red-600">{year.total_calls}</p>
                              <p className="text-sm text-red-500">{year.year}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {finalData.emergency_calls.annual_history
                          ?.sort((a, b) => a.year - b.year)
                          .slice(-8)
                          .map(year => (
                          <div key={year.year} className="bg-red-50 p-3 rounded-lg text-center">
                            <p className="font-bold text-red-600">{year.total_calls}</p>
                            <p className="text-sm text-red-500">{year.year}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {finalData.emergency_calls.last_month_data && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Calendar size={18} />
                        Último Mês ({finalData.emergency_calls.last_month_data.month})
                      </h4>
                      <p className="text-2xl font-bold text-yellow-600">{finalData.emergency_calls.last_month_data.total_calls}</p>
                      <p className="text-sm text-yellow-600">chamadas de emergência</p>
                    </div>
                  )}

                  {finalData.emergency_calls.by_category?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target size={18} />
                        Por Categoria de Acidente
                      </h4>
                      <div className="space-y-2">
                        {finalData.emergency_calls.by_category.map(category => (
                          <div key={category.category} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                            <span className="text-sm font-medium">{category.category}</span>
                            <span className="font-bold text-red-600">{category.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {finalData.emergency_calls.by_gender?.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Distribuição por Gênero</h4>
                        <div className="space-y-2">
                          {finalData.emergency_calls.by_gender.map(gender => (
                            <div key={gender.gender || 'Não informado'} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="text-sm">{gender.gender || 'Não informado'}</span>
                              <span className="font-semibold">{gender.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {finalData.emergency_calls.by_age_group?.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Distribuição por Faixa Etária</h4>
                        <div className="space-y-2">
                          {finalData.emergency_calls.by_age_group.map(age => (
                            <div key={age.age_group} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="text-sm">{age.age_group}</span>
                              <span className="font-semibold">{age.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {!finalData.emergency_calls && (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Nenhum dado de emergência disponível para este ponto</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'infrastructure' && (
            <div className="space-y-6">
              {finalData.bike_racks && finalData.bike_racks.items?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Building2 size={18} />
                    Bicicletários Próximos
                  </h4>
                  <div className="bg-blue-50 p-3 rounded-lg mb-3">
                    <p className="text-sm text-blue-600">Total: {finalData.bike_racks.total} bicicletários com {finalData.bike_racks.total_capacity} vagas</p>
                  </div>
                  <div className="space-y-2">
                    {finalData.bike_racks.items.map(rack => (
                      <div key={rack.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <div>
                          <p className="font-medium">{rack.name}</p>
                          <p className="text-sm text-gray-600">{rack.capacity} vagas • {rack.type}</p>
                        </div>
                        <span className="text-sm text-blue-600 font-medium">
                          {formatDistance(rack.distance_meters)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {finalData.shared_bike && finalData.shared_bike.has_stations && finalData.shared_bike.stations?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Activity size={18} />
                    Estações Bike PE
                  </h4>
                  <div className="space-y-2">
                    {finalData.shared_bike.stations.map(station => (
                      <div key={station.id} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <div>
                          <p className="font-medium">{station.name}</p>
                          <p className="text-sm text-gray-600">{station.capacity} bicicletas</p>
                        </div>
                        <span className="text-sm text-orange-600 font-medium">
                          {formatDistance(station.distance_meters)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {finalData.cycling_infra && finalData.cycling_infra.existing?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Route size={18} />
                    Infraestrutura Cicloviária Existente
                  </h4>
                  <div className="space-y-2">
                    {finalData.cycling_infra.existing.map((infra, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium">{infra.name}</p>
                          <p className="text-sm text-gray-600">{infra.type}</p>
                        </div>
                        <span className="text-sm text-green-600 font-medium">
                          {formatDistance(infra.distance_meters)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {finalData.cycling_infra && finalData.cycling_infra.planned_pdc?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap size={18} />
                    Infraestrutura Planejada (PDC)
                  </h4>
                  <div className="space-y-3">
                    {finalData.cycling_infra.planned_pdc.map(pdc => (
                      <div key={pdc.id} className="p-3 bg-purple-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{pdc.name}</p>
                            <p className="text-sm text-gray-600">{pdc.typology} • {pdc.pdc_ref}</p>
                          </div>
                          <span className="text-sm text-purple-600 font-medium">{pdc.pdc_km}km</span>
                        </div>
                        <p className="text-xs text-gray-500">{pdc.pdc_stretch}</p>
                        <p className="text-xs text-gray-500">Cidades: {pdc.pdc_cities}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {(!finalData.bike_racks || finalData.bike_racks.total === 0) && 
               (!finalData.shared_bike || !finalData.shared_bike.has_stations) && 
               (!finalData.cycling_infra || (finalData.cycling_infra.existing?.length === 0 && finalData.cycling_infra.planned_pdc?.length === 0)) && (
                <div className="text-center py-8 text-gray-500">
                  <Route size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma infraestrutura cicloviária encontrada próxima a este ponto</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'counts' && (
            <div className="space-y-6">
              {finalData.cyclist_counts && finalData.cyclist_counts.counts?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <BarChart3 size={18} />
                    Contagens de Ciclistas Próximas ({finalData.cyclist_counts.counts.length})
                  </h4>
                  <div className="space-y-4">
                    {finalData.cyclist_counts.counts
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(count => {
                        const isExpanded = expandedCounts.has(count.id.toString());
                        return (
                          <div key={count.id} className="border rounded-lg">
                            <button
                              onClick={() => toggleCount(count.id.toString())}
                              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{count.name} ({new Date(count.date).getFullYear()})</p>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  count.id?.toString().includes('prefeitura') 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {count.id?.toString().includes('prefeitura') ? 'Prefeitura' : 'Ameciclo'}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <p className="font-bold text-lg">{count.total_cyclists} <span className="text-sm font-normal text-gray-600">ciclistas</span></p>
                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                              </div>
                            </button>
                            
                            {isExpanded && (
                              <div className="p-4 pt-0">
                                <div className="mb-3">
                                  <p className="text-sm text-gray-600">{count.date} • {count.city}</p>
                                  <p className="text-sm text-gray-600">
                                    {count.distance_meters === 0 ? 'Ponto exato' : `${formatDistance(count.distance_meters)} do ponto clicado`}
                                  </p>
                                </div>
                                
                                {count.characteristics && (
                                  <div>
                                    <h5 className="font-medium mb-2 text-sm">Características dos Ciclistas:</h5>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                                      {count.characteristics.helmet > 0 && (
                                        <div className="bg-blue-100 p-2 rounded">Capacete: {count.characteristics.helmet} ({Math.round((count.characteristics.helmet / count.total_cyclists) * 100)}%)</div>
                                      )}
                                      {count.characteristics.women > 0 && (
                                        <div className="bg-pink-100 p-2 rounded">Mulheres: {count.characteristics.women} ({Math.round((count.characteristics.women / count.total_cyclists) * 100)}%)</div>
                                      )}
                                      {count.characteristics.wrong_way > 0 && (
                                        <div className="bg-red-100 p-2 rounded">Contramão: {count.characteristics.wrong_way} ({Math.round((count.characteristics.wrong_way / count.total_cyclists) * 100)}%)</div>
                                      )}
                                      {count.characteristics.cargo > 0 && (
                                        <div className="bg-yellow-100 p-2 rounded">Carga: {count.characteristics.cargo} ({Math.round((count.characteristics.cargo / count.total_cyclists) * 100)}%)</div>
                                      )}
                                      {count.characteristics.juveniles > 0 && (
                                        <div className="bg-green-100 p-2 rounded">Juvenis: {count.characteristics.juveniles} ({Math.round((count.characteristics.juveniles / count.total_cyclists) * 100)}%)</div>
                                      )}
                                      {count.characteristics.sidewalk > 0 && (
                                        <div className="bg-gray-100 p-2 rounded">Calçada: {count.characteristics.sidewalk} ({Math.round((count.characteristics.sidewalk / count.total_cyclists) * 100)}%)</div>
                                      )}
                                      {count.characteristics.shared_bike > 0 && (
                                        <div className="bg-orange-100 p-2 rounded">Bike Compartilhada: {count.characteristics.shared_bike} ({Math.round((count.characteristics.shared_bike / count.total_cyclists) * 100)}%)</div>
                                      )}
                                      {count.characteristics.service > 0 && (
                                        <div className="bg-purple-100 p-2 rounded">Serviços: {count.characteristics.service} ({Math.round((count.characteristics.service / count.total_cyclists) * 100)}%)</div>
                                      )}
                                      {count.characteristics.motor > 0 && (
                                        <div className="bg-red-100 p-2 rounded">Motorizada: {count.characteristics.motor} ({Math.round((count.characteristics.motor / count.total_cyclists) * 100)}%)</div>
                                      )}
                                      {count.characteristics.ride > 0 && (
                                        <div className="bg-teal-100 p-2 rounded">Acompanhantes: {count.characteristics.ride} ({Math.round((count.characteristics.ride / count.total_cyclists) * 100)}%)</div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
              
              {(!finalData.cyclist_counts || finalData.cyclist_counts.counts?.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma contagem de ciclistas encontrada próxima a este ponto</p>
                </div>
              )}
            </div>
          )}



          {activeTab === 'profile' && (
            <div className="space-y-6">
              {finalData.cyclist_profile && finalData.cyclist_profile.total_profiles > 0 ? (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Users size={18} />
                      Total de Perfis Coletados
                    </h4>
                    <p className="text-3xl font-bold text-blue-600">{finalData.cyclist_profile.total_profiles}</p>
                    <p className="text-sm text-blue-600">ciclistas entrevistados na região</p>
                  </div>

                  {finalData.cyclist_profile.by_edition
                    ?.sort((a, b) => parseInt(b.edition) - parseInt(a.edition))
                    .map(edition => {
                      const isExpanded = expandedEditions.has(edition.edition);
                      return (
                        <div key={edition.edition} className="border rounded-lg">
                          <button
                            onClick={() => toggleEdition(edition.edition)}
                            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <h4 className="font-semibold flex items-center gap-2">
                              <Calendar size={16} />
                              Edição {edition.edition} ({edition.total_profiles} perfis)
                            </h4>
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </button>
                          
                          {isExpanded && (
                            <div className="p-4 pt-0">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {edition.race_distribution && Object.keys(edition.race_distribution).length > 0 && (
                                  <div>
                                    <h5 className="font-medium mb-2">Distribuição Racial</h5>
                                    <div className="space-y-1">
                                      {Object.entries(edition.race_distribution)
                                        .sort(([,a], [,b]) => b - a)
                                        .map(([race, count]) => (
                                        <div key={race} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                                          <span>{race}</span>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">{count}</span>
                                            <span className="text-xs text-gray-500">({calculatePercentage(count, edition.total_profiles)})</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {edition.gender_distribution && Object.keys(edition.gender_distribution).length > 0 && (
                                  <div>
                                    <h5 className="font-medium mb-2">Por Gênero</h5>
                                    <div className="space-y-1">
                                      {Object.entries(edition.gender_distribution)
                                        .sort(([,a], [,b]) => b - a)
                                        .map(([gender, count]) => (
                                        <div key={gender} className="flex justify-between text-sm p-2 bg-pink-50 rounded">
                                          <span>{gender}</span>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">{count}</span>
                                            <span className="text-xs text-gray-500">({calculatePercentage(count, edition.total_profiles)})</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {edition.age_distribution && Object.keys(edition.age_distribution).length > 0 && (
                                  <div>
                                    <h5 className="font-medium mb-2">Por Faixa Etária</h5>
                                    <div className="space-y-1">
                                      {Object.entries(edition.age_distribution)
                                        .sort(([,a], [,b]) => b - a)
                                        .map(([age, count]) => (
                                        <div key={age} className="flex justify-between text-sm p-2 bg-green-50 rounded">
                                          <span>{age}</span>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">{count}</span>
                                            <span className="text-xs text-gray-500">({calculatePercentage(count, edition.total_profiles)})</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {edition.education_distribution && Object.keys(edition.education_distribution).length > 0 && (
                                  <div>
                                    <h5 className="font-medium mb-2">Por Escolaridade</h5>
                                    <div className="space-y-1">
                                      {Object.entries(edition.education_distribution)
                                        .sort(([,a], [,b]) => b - a)
                                        .map(([education, count]) => (
                                        <div key={education} className="flex justify-between text-sm p-2 bg-blue-50 rounded">
                                          <span className="text-xs">{education}</span>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">{count}</span>
                                            <span className="text-xs text-gray-500">({calculatePercentage(count, edition.total_profiles)})</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {edition.income_distribution && Object.keys(edition.income_distribution).length > 0 && (
                                  <div>
                                    <h5 className="font-medium mb-2">Por Renda Familiar</h5>
                                    <div className="space-y-1">
                                      {Object.entries(edition.income_distribution)
                                        .sort(([,a], [,b]) => b - a)
                                        .map(([income, count]) => (
                                        <div key={income} className="flex justify-between text-sm p-2 bg-yellow-50 rounded">
                                          <span className="text-xs">{income}</span>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">{count}</span>
                                            <span className="text-xs text-gray-500">({calculatePercentage(count, edition.total_profiles)})</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {edition.other_attributes && Object.keys(edition.other_attributes).length > 0 && (
                                <div className="mt-4">
                                  <h5 className="font-medium mb-2">Características Comportamentais</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                    {Object.entries(edition.other_attributes)
                                      .filter(([key]) => key.includes('motivation') || key.includes('biggest_need') || key.includes('years_using'))
                                      .slice(0, 10)
                                      .map(([attr, count]) => {
                                        const translatedAttr = translateBehavioralKey(attr);
                                        const translatedCount = typeof count === 'string' ? 
                                          translateBehavioralKey(count) : count;
                                        return (
                                          <div key={attr} className="p-2 bg-purple-50 rounded">
                                            <div className="flex justify-between items-center">
                                              <span className="font-medium text-xs">{translatedAttr}:</span>
                                              <div className="flex items-center gap-1">
                                                <span className="text-xs">{translatedCount}</span>
                                                <span className="text-xs text-gray-500">({calculatePercentage(typeof count === 'number' ? count : 0, edition.total_profiles)})</span>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Nenhum perfil de ciclista coletado próximo a este ponto</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={18} />
                Análises e Índices
              </h4>
              
              {/* Índices de Segurança */}
              {finalData.emergency_calls && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-3 flex items-center gap-2">
                    <Shield size={16} />
                    Índices de Segurança
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {finalData.emergency_calls.annual_history?.reduce((sum, year) => sum + year.total_calls, 0) || 0}
                      </p>
                      <p className="text-sm text-red-600">Total de Emergências</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {finalData.emergency_calls.annual_history?.length > 0 ? 
                          Math.round((finalData.emergency_calls.annual_history.reduce((sum, year) => sum + year.total_calls, 0) / finalData.emergency_calls.annual_history.length)) : 0}
                      </p>
                      <p className="text-sm text-red-600">Média Anual</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {finalData.emergency_calls.by_category?.[0]?.category?.includes('Moto') ? 'Alto' : 'Médio'}
                      </p>
                      <p className="text-sm text-red-600">Risco Relativo</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Índices de Infraestrutura */}
              {finalData.cycling_infra && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-3 flex items-center gap-2">
                    <Route size={16} />
                    Índices de Infraestrutura
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {finalData.cycling_infra.existing?.length || 0}
                      </p>
                      <p className="text-sm text-green-600">Vias Existentes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {finalData.cycling_infra.planned_pdc?.length || 0}
                      </p>
                      <p className="text-sm text-green-600">Vias Planejadas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {finalData.cycling_infra.planned_pdc?.reduce((sum, pdc) => sum + pdc.pdc_km, 0)?.toFixed(1) || '0.0'}km
                      </p>
                      <p className="text-sm text-green-600">Extensão Planejada</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Índices de Uso */}
              {finalData.cyclist_counts && finalData.cyclist_counts.counts?.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-3 flex items-center gap-2">
                    <Activity size={16} />
                    Índices de Uso
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {finalData.cyclist_counts.counts.reduce((sum, count) => sum + count.total_cyclists, 0)}
                      </p>
                      <p className="text-sm text-blue-600">Total Contado</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {Math.round(finalData.cyclist_counts.counts.reduce((sum, count) => sum + count.total_cyclists, 0) / finalData.cyclist_counts.counts.length)}
                      </p>
                      <p className="text-sm text-blue-600">Média por Ponto</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {finalData.cyclist_counts.counts.some(count => count.characteristics?.helmet > count.total_cyclists * 0.1) ? 'Alto' : 'Baixo'}
                      </p>
                      <p className="text-sm text-blue-600">Uso de Capacete</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tendências Temporais */}
              {finalData.emergency_calls?.annual_history?.length > 1 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-3 flex items-center gap-2">
                    <Clock size={16} />
                    Tendências Temporais
                  </h5>
                  <div className="space-y-2">
                    {(() => {
                      const currentYear = new Date().getFullYear();
                      const filteredData = finalData.emergency_calls.annual_history
                        .filter(year => year.year < currentYear)
                        .sort((a, b) => a.year - b.year);
                      const recent = filteredData.slice(-2);
                      const trend = recent.length === 2 ? 
                        (recent[1].total_calls > recent[0].total_calls ? 'Crescente' : 
                         recent[1].total_calls < recent[0].total_calls ? 'Decrescente' : 'Estável') : 'Insuficiente';
                      const color = trend === 'Crescente' ? 'text-red-600' : trend === 'Decrescente' ? 'text-green-600' : 'text-yellow-600';
                      
                      return (
                        <div className={`md:flex md:items-center md:justify-between text-center md:text-left ${color}`}>
                          <div>
                            <p className="text-2xl font-bold">{trend}</p>
                            <p className="text-base">Tendência de Emergências</p>
                          </div>
                          {recent.length === 2 && (
                            <div className="text-sm mt-2 md:mt-0 text-gray-600 md:text-right">
                              <p className="flex items-center justify-center md:justify-end gap-1">
                                {recent[0].year}: {recent[0].total_calls} 
                                <ArrowRight size={16} className="text-gray-400" /> 
                                {recent[1].year}: {recent[1].total_calls}
                              </p>
                              {trend !== 'Estável' && (
                                <p className="font-medium text-base">
                                  {trend === 'Crescente' ? '+' : ''}{((recent[1].total_calls - recent[0].total_calls) / recent[0].total_calls * 100).toFixed(1)}%
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {!finalData.emergency_calls && !finalData.cycling_infra && (!finalData.cyclist_counts || finalData.cyclist_counts.counts?.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Dados insuficientes para análises neste ponto</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              <span>Dados em raio de 200m do ponto selecionado</span>
              <p className="text-xs text-gray-500 mt-1">
                Coordenadas: {finalData.location?.lat.toFixed(6)}, {finalData.location?.lng.toFixed(6)}
              </p>

            </div>
            <button 
              onClick={onClose}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}