import { useState, useEffect } from 'react';
import { X, MapPin, AlertTriangle, Bike, BarChart3, Users, Calendar, Navigation } from 'lucide-react';
import { POINT_CICLO_NEARBY } from '~/servers';

interface PointInfoPopupProps {
  lat: number;
  lng: number;
  onClose: () => void;
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

export function PointInfoPopup({ lat, lng, onClose }: PointInfoPopupProps) {
  const [data, setData] = useState<PointData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

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
    { id: 'emergency', label: 'Emergências', icon: AlertTriangle },
    { id: 'cycling', label: 'Ciclismo', icon: Bike },
    { id: 'profile', label: 'Perfil', icon: Users }
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={20} className="text-red-500" />
                    <h4 className="font-semibold text-red-700">Emergências</h4>
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {data.emergency_calls.annual_history.reduce((sum, year) => sum + year.total_calls, 0)}
                  </p>
                  <p className="text-sm text-red-600">chamadas totais</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Bike size={20} className="text-blue-500" />
                    <h4 className="font-semibold text-blue-700">Bicicletários</h4>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{data.bike_racks.total}</p>
                  <p className="text-sm text-blue-600">{data.bike_racks.total_capacity} vagas</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={20} className="text-green-500" />
                    <h4 className="font-semibold text-green-700">Contagens</h4>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{data.cyclist_counts.counts.length}</p>
                  <p className="text-sm text-green-600">pontos próximos</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Navigation size={18} />
                  Localização
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium">{data.location.nearest_street.official_name}</p>
                  <p className="text-sm text-gray-600">
                    Coordenadas: {data.location.lat.toFixed(6)}, {data.location.lng.toFixed(6)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Extensão da via: {formatDistance(data.location.nearest_street.total_length_meters)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'emergency' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Histórico Anual</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {data.emergency_calls.annual_history.slice(-8).map(year => (
                    <div key={year.year} className="bg-red-50 p-3 rounded-lg text-center">
                      <p className="font-bold text-red-600">{year.total_calls}</p>
                      <p className="text-sm text-red-500">{year.year}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Por Categoria</h4>
                <div className="space-y-2">
                  {data.emergency_calls.by_category.slice(0, 5).map(category => (
                    <div key={category.category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{category.category}</span>
                      <span className="font-semibold text-red-600">{category.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-3">Por Gênero</h4>
                  <div className="space-y-2">
                    {data.emergency_calls.by_gender.map(gender => (
                      <div key={gender.gender || 'Não informado'} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{gender.gender || 'Não informado'}</span>
                        <span className="font-semibold">{gender.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Por Faixa Etária</h4>
                  <div className="space-y-2">
                    {data.emergency_calls.by_age_group.slice(0, 4).map(age => (
                      <div key={age.age_group} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{age.age_group}</span>
                        <span className="font-semibold">{age.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cycling' && (
            <div className="space-y-6">
              {data.bike_racks.items.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Bicicletários Próximos</h4>
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

              {data.shared_bike.has_stations && (
                <div>
                  <h4 className="font-semibold mb-3">Estações Bike PE</h4>
                  <div className="space-y-2">
                    {data.shared_bike.stations.slice(0, 5).map(station => (
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

              {data.cycling_infra.existing.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Infraestrutura Existente</h4>
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

              {data.cyclist_counts.counts.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Contagens de Ciclistas</h4>
                  <div className="space-y-2">
                    {data.cyclist_counts.counts.map(count => (
                      <div key={count.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{count.name}</p>
                            <p className="text-sm text-gray-600">{count.date} • {count.city}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{count.total_cyclists}</p>
                            <p className="text-sm text-gray-600">{formatDistance(count.distance_meters)}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>Capacete: {count.characteristics.helmet || 0}</div>
                          <div>Mulheres: {count.characteristics.women || 0}</div>
                          <div>Contramão: {count.characteristics.wrong_way || 0}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Total de Perfis</h4>
                <p className="text-3xl font-bold text-blue-600">{data.cyclist_profile.total_profiles}</p>
              </div>

              {data.cyclist_profile.by_edition.map(edition => (
                <div key={edition.edition} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Edição {edition.edition} ({edition.total_profiles} perfis)</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Por Gênero</h5>
                      <div className="space-y-1">
                        {Object.entries(edition.gender_distribution).map(([gender, count]) => (
                          <div key={gender} className="flex justify-between text-sm">
                            <span>{gender}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Por Idade</h5>
                      <div className="space-y-1">
                        {Object.entries(edition.age_distribution).slice(0, 4).map(([age, count]) => (
                          <div key={age} className="flex justify-between text-sm">
                            <span>{age}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Por Escolaridade</h5>
                      <div className="space-y-1">
                        {Object.entries(edition.education_distribution).map(([education, count]) => (
                          <div key={education} className="flex justify-between text-sm">
                            <span className="text-xs">{education}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Por Renda</h5>
                      <div className="space-y-1">
                        {Object.entries(edition.income_distribution).slice(0, 4).map(([income, count]) => (
                          <div key={income} className="flex justify-between text-sm">
                            <span className="text-xs">{income}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Dados em raio de 200m do ponto selecionado</span>
            <button 
              onClick={onClose}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}