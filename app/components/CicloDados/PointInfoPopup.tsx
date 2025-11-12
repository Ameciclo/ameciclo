import { useState, useEffect } from 'react';
import { X, MapPin, AlertTriangle, Bike, BarChart3, Users, Calendar, Navigation, TrendingUp, Shield, Route, Clock, Target, Activity, Zap, Building2, Car, Ambulance } from 'lucide-react';
import { POINT_CICLO_NEARBY } from '~/servers';
import { translateProfileData, translateBehavioralKey } from '~/utils/translations';

interface PointInfoPopupProps {
  lat: number;
  lng: number;
  onClose: () => void;
  initialTab?: string;
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

export function PointInfoPopup({ lat, lng, onClose, initialTab = 'overview' }: PointInfoPopupProps) {
  const [data, setData] = useState<PointData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(POINT_CICLO_NEARBY(lat, lng, 200));
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lat, lng]);

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
          <p className="text-gray-700">{error}</p>
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

  if (!data) return null;

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
    if (meters < 1000) return `${meters}m`;
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
              {data.location.nearest_street.official_name} • {formatDistance(data.location.nearest_street.distance_to_point_meters)} da via
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.emergency_calls && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Ambulance size={20} className="text-red-500" />
                      <h4 className="font-semibold text-red-700">Emergências</h4>
                    </div>
                    <p className="text-2xl font-bold text-red-600">
                      {data.emergency_calls.annual_history?.reduce((sum, year) => sum + year.total_calls, 0) || 0}
                    </p>
                    <p className="text-sm text-red-600">chamadas totais</p>
                  </div>
                )}

                {data.bike_racks && data.bike_racks.total > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Bike size={20} className="text-blue-500" />
                      <h4 className="font-semibold text-blue-700">Bicicletários</h4>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{data.bike_racks.total}</p>
                    <p className="text-sm text-blue-600">{data.bike_racks.total_capacity} vagas</p>
                  </div>
                )}

                {data.cyclist_counts && data.cyclist_counts.counts?.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 size={20} className="text-green-500" />
                      <h4 className="font-semibold text-green-700">Contagens</h4>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{data.cyclist_counts.counts.length}</p>
                    <p className="text-sm text-green-600">pontos próximos</p>
                  </div>
                )}

                {data.cyclist_profile && data.cyclist_profile.total_profiles > 0 && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={20} className="text-purple-500" />
                      <h4 className="font-semibold text-purple-700">Perfis</h4>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{data.cyclist_profile.total_profiles}</p>
                    <p className="text-sm text-purple-600">ciclistas</p>
                  </div>
                )}

                {data.shared_bike && data.shared_bike.has_stations && (
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity size={20} className="text-orange-500" />
                      <h4 className="font-semibold text-orange-700">Bike PE</h4>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">{data.shared_bike.stations?.length || 0}</p>
                    <p className="text-sm text-orange-600">estações</p>
                  </div>
                )}

                {data.cycling_infra && (data.cycling_infra.existing?.length > 0 || data.cycling_infra.planned_pdc?.length > 0) && (
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Route size={20} className="text-teal-500" />
                      <h4 className="font-semibold text-teal-700">Infraestrutura</h4>
                    </div>
                    <p className="text-2xl font-bold text-teal-600">
                      {(data.cycling_infra.existing?.length || 0) + (data.cycling_infra.planned_pdc?.length || 0)}
                    </p>
                    <p className="text-sm text-teal-600">vias próximas</p>
                  </div>
                )}
              </div>

              {data.location && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Navigation size={18} />
                    Localização
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">{data.location.nearest_street?.official_name || data.location.nearest_street?.name}</p>
                    <p className="text-sm text-gray-600">
                      Coordenadas: {data.location.lat.toFixed(6)}, {data.location.lng.toFixed(6)}
                    </p>
                    {data.location.nearest_street?.total_length_meters && (
                      <p className="text-sm text-gray-600">
                        Extensão da via: {formatDistance(data.location.nearest_street.total_length_meters)}
                      </p>
                    )}
                    {data.location.nearest_street?.distance_to_point_meters !== undefined && (
                      <p className="text-sm text-gray-600">
                        Distância da via: {formatDistance(data.location.nearest_street.distance_to_point_meters)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-6">
              {data.location && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin size={18} />
                    Informações Geográficas
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium mb-2">Coordenadas Exatas</h5>
                      <p className="text-sm text-gray-600">Latitude: {data.location.lat.toFixed(8)}</p>
                      <p className="text-sm text-gray-600">Longitude: {data.location.lng.toFixed(8)}</p>
                    </div>
                    
                    {data.location.nearest_street && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h5 className="font-medium mb-2">Via Mais Próxima</h5>
                        <p className="font-medium">{data.location.nearest_street.official_name || data.location.nearest_street.name}</p>
                        {data.location.nearest_street.name !== data.location.nearest_street.official_name && (
                          <p className="text-sm text-gray-600">Nome popular: {data.location.nearest_street.name}</p>
                        )}
                        {data.location.nearest_street.distance_to_point_meters !== undefined && (
                          <p className="text-sm text-gray-600">Distância: {formatDistance(data.location.nearest_street.distance_to_point_meters)}</p>
                        )}
                        {data.location.nearest_street.total_length_meters && (
                          <p className="text-sm text-gray-600">Extensão total: {formatDistance(data.location.nearest_street.total_length_meters)}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="space-y-6">
              {data.emergency_calls && (
                <>
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Clock size={18} />
                      Histórico Anual de Emergências
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {data.emergency_calls.annual_history?.slice(-8).map(year => (
                        <div key={year.year} className="bg-red-50 p-3 rounded-lg text-center">
                          <p className="font-bold text-red-600">{year.total_calls}</p>
                          <p className="text-sm text-red-500">{year.year}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {data.emergency_calls.last_month_data && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Calendar size={18} />
                        Último Mês ({data.emergency_calls.last_month_data.month})
                      </h4>
                      <p className="text-2xl font-bold text-yellow-600">{data.emergency_calls.last_month_data.total_calls}</p>
                      <p className="text-sm text-yellow-600">chamadas de emergência</p>
                    </div>
                  )}

                  {data.emergency_calls.by_category?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target size={18} />
                        Por Categoria de Acidente
                      </h4>
                      <div className="space-y-2">
                        {data.emergency_calls.by_category.map(category => (
                          <div key={category.category} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                            <span className="text-sm font-medium">{category.category}</span>
                            <span className="font-bold text-red-600">{category.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.emergency_calls.by_gender?.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Distribuição por Gênero</h4>
                        <div className="space-y-2">
                          {data.emergency_calls.by_gender.map(gender => (
                            <div key={gender.gender || 'Não informado'} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="text-sm">{gender.gender || 'Não informado'}</span>
                              <span className="font-semibold">{gender.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {data.emergency_calls.by_age_group?.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Distribuição por Faixa Etária</h4>
                        <div className="space-y-2">
                          {data.emergency_calls.by_age_group.map(age => (
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
              
              {!data.emergency_calls && (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Nenhum dado de emergência disponível para este ponto</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'infrastructure' && (
            <div className="space-y-6">
              {data.bike_racks && data.bike_racks.items?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Building2 size={18} />
                    Bicicletários Próximos
                  </h4>
                  <div className="bg-blue-50 p-3 rounded-lg mb-3">
                    <p className="text-sm text-blue-600">Total: {data.bike_racks.total} bicicletários com {data.bike_racks.total_capacity} vagas</p>
                  </div>
                  <div className="space-y-2">
                    {data.bike_racks.items.map(rack => (
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

              {data.shared_bike && data.shared_bike.has_stations && data.shared_bike.stations?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Activity size={18} />
                    Estações Bike PE
                  </h4>
                  <div className="space-y-2">
                    {data.shared_bike.stations.map(station => (
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

              {data.cycling_infra && data.cycling_infra.existing?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Route size={18} />
                    Infraestrutura Cicloviária Existente
                  </h4>
                  <div className="space-y-2">
                    {data.cycling_infra.existing.map((infra, index) => (
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

              {data.cycling_infra && data.cycling_infra.planned_pdc?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap size={18} />
                    Infraestrutura Planejada (PDC)
                  </h4>
                  <div className="space-y-3">
                    {data.cycling_infra.planned_pdc.map(pdc => (
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
              
              {(!data.bike_racks || data.bike_racks.total === 0) && 
               (!data.shared_bike || !data.shared_bike.has_stations) && 
               (!data.cycling_infra || (data.cycling_infra.existing?.length === 0 && data.cycling_infra.planned_pdc?.length === 0)) && (
                <div className="text-center py-8 text-gray-500">
                  <Route size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma infraestrutura cicloviária encontrada próxima a este ponto</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'counts' && (
            <div className="space-y-6">
              {data.cyclist_counts && data.cyclist_counts.counts?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <BarChart3 size={18} />
                    Contagens de Ciclistas Próximas
                  </h4>
                  <div className="space-y-4">
                    {data.cyclist_counts.counts.map(count => (
                      <div key={count.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium">{count.name}</p>
                            <p className="text-sm text-gray-600">{count.date} • {count.city}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{count.total_cyclists}</p>
                            <p className="text-sm text-gray-600">{formatDistance(count.distance_meters)}</p>
                          </div>
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
                    ))}
                  </div>
                </div>
              )}
              
              {(!data.cyclist_counts || data.cyclist_counts.counts?.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma contagem de ciclistas encontrada próxima a este ponto</p>
                </div>
              )}
            </div>
          )}



          {activeTab === 'profile' && (
            <div className="space-y-6">
              {data.cyclist_profile && data.cyclist_profile.total_profiles > 0 ? (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Users size={18} />
                      Total de Perfis Coletados
                    </h4>
                    <p className="text-3xl font-bold text-blue-600">{data.cyclist_profile.total_profiles}</p>
                    <p className="text-sm text-blue-600">ciclistas entrevistados na região</p>
                  </div>

                  {data.cyclist_profile.by_edition?.map(edition => (
                    <div key={edition.edition} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Calendar size={16} />
                        Edição {edition.edition} ({edition.total_profiles} perfis)
                      </h4>
                      
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
                                  <span className="font-medium">{count}</span>
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
                                  <span className="font-medium">{count}</span>
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
                                  <span className="font-medium">{count}</span>
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
                                  <span className="font-medium">{count}</span>
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
                                  <span className="font-medium">{count}</span>
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
                                    <span className="font-medium">{translatedAttr}: </span>
                                    <span>{translatedCount}</span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
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
              {data.emergency_calls && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-3 flex items-center gap-2">
                    <Shield size={16} />
                    Índices de Segurança
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {data.emergency_calls.annual_history?.reduce((sum, year) => sum + year.total_calls, 0) || 0}
                      </p>
                      <p className="text-sm text-red-600">Total de Emergências</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {data.emergency_calls.annual_history?.length > 0 ? 
                          Math.round((data.emergency_calls.annual_history.reduce((sum, year) => sum + year.total_calls, 0) / data.emergency_calls.annual_history.length)) : 0}
                      </p>
                      <p className="text-sm text-red-600">Média Anual</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {data.emergency_calls.by_category?.[0]?.category?.includes('Moto') ? 'Alto' : 'Médio'}
                      </p>
                      <p className="text-sm text-red-600">Risco Relativo</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Índices de Infraestrutura */}
              {data.cycling_infra && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-3 flex items-center gap-2">
                    <Route size={16} />
                    Índices de Infraestrutura
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {data.cycling_infra.existing?.length || 0}
                      </p>
                      <p className="text-sm text-green-600">Vias Existentes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {data.cycling_infra.planned_pdc?.length || 0}
                      </p>
                      <p className="text-sm text-green-600">Vias Planejadas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {data.cycling_infra.planned_pdc?.reduce((sum, pdc) => sum + pdc.pdc_km, 0)?.toFixed(1) || '0.0'}km
                      </p>
                      <p className="text-sm text-green-600">Extensão Planejada</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Índices de Uso */}
              {data.cyclist_counts && data.cyclist_counts.counts?.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-3 flex items-center gap-2">
                    <Activity size={16} />
                    Índices de Uso
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {data.cyclist_counts.counts.reduce((sum, count) => sum + count.total_cyclists, 0)}
                      </p>
                      <p className="text-sm text-blue-600">Total Contado</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {Math.round(data.cyclist_counts.counts.reduce((sum, count) => sum + count.total_cyclists, 0) / data.cyclist_counts.counts.length)}
                      </p>
                      <p className="text-sm text-blue-600">Média por Ponto</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {data.cyclist_counts.counts.some(count => count.characteristics?.helmet > count.total_cyclists * 0.1) ? 'Alto' : 'Baixo'}
                      </p>
                      <p className="text-sm text-blue-600">Uso de Capacete</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tendências Temporais */}
              {data.emergency_calls?.annual_history?.length > 1 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-3 flex items-center gap-2">
                    <Clock size={16} />
                    Tendências Temporais
                  </h5>
                  <div className="space-y-2">
                    {(() => {
                      const recent = data.emergency_calls.annual_history.slice(-2);
                      const trend = recent.length === 2 ? 
                        (recent[1].total_calls > recent[0].total_calls ? 'Crescente' : 
                         recent[1].total_calls < recent[0].total_calls ? 'Decrescente' : 'Estável') : 'Insuficiente';
                      const color = trend === 'Crescente' ? 'text-red-600' : trend === 'Decrescente' ? 'text-green-600' : 'text-yellow-600';
                      
                      return (
                        <div className={`text-center ${color}`}>
                          <p className="text-xl font-bold">{trend}</p>
                          <p className="text-sm">Tendência de Emergências</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {!data.emergency_calls && !data.cycling_infra && (!data.cyclist_counts || data.cyclist_counts.counts?.length === 0) && (
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
                Coordenadas: {data.location?.lat.toFixed(6)}, {data.location?.lng.toFixed(6)}
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