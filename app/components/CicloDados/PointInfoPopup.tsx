import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, MapPin, AlertTriangle, Bike, BarChart3, Users, Calendar, Navigation, TrendingUp, Shield, Route, Clock, Target, Activity, Zap, Building2, Ambulance, ArrowRight, Share2, ChevronDown, ChevronUp, User, ShieldCheck, UserPlus, Wrench, RotateCcw, Package, Baby, Footprints, FileText, Scale, ClipboardCheck, Search, Anchor, MoreHorizontal, Copy, Download, ExternalLink, Eye, Check } from 'lucide-react';
import { POINT_CICLO_NEARBY } from '~/servers';
import promptTemplates from '~/data/ciclodados-prompt-templates.json';
import { calculatePercentage } from '~/utils/translations';
import { slugify } from '~/utils/slugify';
import { slugifyCount } from '~/services/slug';

function getAgeOrder(age: string): number {
  const order: Record<string, number> = {
    'Até 17 anos': 0,
    '17 anos ou menos': 0,
    'Menor de 18': 0,
    '18-25 anos': 1,
    '18-30': 1,
    '26-35 anos': 2,
    '31-50': 2,
    '36-45 anos': 3,
    '46+ anos': 4,
    '46-60 anos': 4,
    '51-70': 4,
    '60+ anos': 5,
    'Acima de 60 anos': 5,
    'Maior de 70': 5,
    'Não informado': 6,
  };
  return order[age] ?? 99;
}

const CATEGORY_LABELS: Record<string, string> = {
  sinistro_moto: "Sinistro de Moto",
  sinistro_carro: "Sinistro de Carro",
  sinistro_bicicleta: "Sinistro de Bicicleta",
  sinistro_onibus_caminhao: "Sinistro Ônibus/Caminhão",
  atropelamento_carro: "Atropelamento por Carro",
  atropelamento_moto: "Atropelamento por Moto",
  atropelamento_bicicleta: "Atropelamento de Bicicleta",
  atropelamento_onibus_caminhao: "Atropelamento Ônibus/Caminhão",
  outro: "Outro",
  nao_informado: "Não Informado",
};

const formatCategory = (category: string) =>
  CATEGORY_LABELS[category] || category.replace(/_/g, " ");

interface PointInfoPopupProps {
  lat: number;
  lng: number;
  onClose: () => void;
  initialTab?: string;
  extraData?: any;
  streetId?: string;
}

interface PointData {
  location: {
    lat: number;
    lng: number;
    nearest_street: {
      id?: number;
      name: string;
      official_name: string;
      total_length_meters: number;
      distance_to_point_meters: number;
    };
    nearby_streets?: Array<{
      id: number;
      name: string;
      distance_meters: number;
    }>;
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
  traffic_tickets?: {
    total_violations: number;
    by_year: Array<{ year: number; total: number }>;
    top_violations: Array<{
      law_code: string;
      description: string;
      count: number;
      percentage: number;
    }>;
    vulnerable_violations: Array<{
      law_code: string;
      description: string;
      count: number;
    }>;
  };
}

export function PointInfoPopup({ lat, lng, onClose, initialTab = 'overview', extraData, streetId }: PointInfoPopupProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [perfilMetric, setPerfilMetric] = useState<'acidentes' | 'idade' | 'motivacao' | 'problemas'>('acidentes');
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared'>('idle');
  const [expandedEditions, setExpandedEditions] = useState<Set<string>>(new Set());
  const [expandedCounts, setExpandedCounts] = useState<Set<string>>(new Set());
  const [selectedStreetId, setSelectedStreetId] = useState<string | number | undefined>(streetId || undefined);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Document assistant state
  const [docType, setDocType] = useState<string>('');
  const [objective, setObjective] = useState<string>('');
  const [quickObjective, setQuickObjective] = useState<string>('');
  const [selectedDataCategories, setSelectedDataCategories] = useState<Set<string>>(new Set());
  const [audience, setAudience] = useState<string>('');
  const [customAudience, setCustomAudience] = useState<string>('');
  const [tone, setTone] = useState<string>('tecnico');
  const [docSize, setDocSize] = useState<string>('medium');
  const [includeTables, setIncludeTables] = useState(false);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [includeLegalBasis, setIncludeLegalBasis] = useState(false);
  const [includeLimitations, setIncludeLimitations] = useState(true);
  const autoExpandedCounts = useRef(false);
  const autoExpandedEditions = useRef(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const currentZoom = url.searchParams.get('zoom') || '16';
    url.searchParams.set('lat', lat.toFixed(6));
    url.searchParams.set('lon', lng.toFixed(6));
    url.searchParams.set('zoom', currentZoom);
    url.searchParams.set('modal', 'open');
    window.history.pushState({}, '', url.toString());
  }, [lat, lng]);

  const handleClose = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('modal');
    window.history.pushState({}, '', url.toString());
    onClose();
  };

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = modal.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, activeTab, expandedEditions, expandedCounts]);

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
    queryKey: ['point-info', lat, lng, selectedStreetId],
    queryFn: async () => {
      const response = await fetch(POINT_CICLO_NEARBY(lat, lng, 200, selectedStreetId));
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const apiData = await response.json();
      
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
          date: prefData.date ? new Date(prefData.date).toLocaleDateString('pt-BR') : 'Data não disponível',
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

  useEffect(() => {
    if (!autoExpandedCounts.current && data?.cyclist_counts?.counts?.length > 0) {
      const sorted = [...data.cyclist_counts.counts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setExpandedCounts(new Set([sorted[0].id.toString()]));
      autoExpandedCounts.current = true;
    }

    if (!autoExpandedEditions.current && data?.cyclist_profile?.by_edition?.length > 0) {
      const sorted = [...data.cyclist_profile.by_edition].sort((a, b) => parseInt(b.edition) - parseInt(a.edition));
      setExpandedEditions(new Set([sorted[0].edition]));
      autoExpandedEditions.current = true;
    }
  }, [data?.cyclist_counts, data?.cyclist_profile]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100">
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-red-600">Erro</h3>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <p className="text-gray-700">{error?.message || 'Erro desconhecido'}</p>
          <button 
            onClick={handleClose}
            className="mt-4 w-full bg-gray-500 text-white py-2 px-4 rounded-sm hover:bg-gray-600"
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
        date: prefData.date ? new Date(prefData.date).toLocaleDateString('pt-BR') : 'Data não disponível',
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

  const streetSlug = slugify(finalData.location?.nearest_street?.official_name || finalData.location?.nearest_street?.name || '');
  const latestCountSlug = (() => {
    const counts = finalData.cyclist_counts?.counts;
    if (!counts?.length) return '';
    const latest = [...counts]
      .filter((c: any) => !c.id?.toString().includes('prefeitura'))
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    return latest ? slugifyCount({name: latest.name}, latest) : '';
  })();

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: MapPin, color: 'blue' },
    { id: 'safety', label: 'Sinistros', icon: Shield, color: 'red' },
    { id: 'infrastructure', label: 'Infraestrutura', icon: Route, color: 'teal' },
    { id: 'counts', label: 'Contagens', icon: BarChart3, color: 'green' },
    { id: 'profile', label: 'Perfil', icon: Users, color: 'purple' },
    { id: 'violations', label: 'Infrações', icon: AlertTriangle, color: 'red' },
    { id: 'analysis', label: 'Análises', icon: TrendingUp, color: 'blue' }
  ];

  const tabColorClasses: Record<string, { active: string; icon: string }> = {
    blue:    { active: 'border-blue-600 text-blue-600',    icon: 'text-blue-600' },
    red:     { active: 'border-red-600 text-red-600',       icon: 'text-red-600' },
    teal:    { active: 'border-teal-600 text-teal-600',     icon: 'text-teal-600' },
    green:   { active: 'border-green-600 text-green-600',   icon: 'text-green-600' },
    purple:  { active: 'border-purple-600 text-purple-600', icon: 'text-purple-600' },
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const toggleDataCategory = (id: string) => {
    const next = new Set(selectedDataCategories);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedDataCategories(next);
  };

  const getDocumentTypeIcon = (iconName: string) => {
    const icons: Record<string, React.ElementType> = {
      FileText, Scale, ClipboardCheck, Search, Bike, Anchor,
      AlertTriangle, Users, Share2, MoreHorizontal,
    };
    return icons[iconName] || FileText;
  };

  const generateDataSummary = (categoryId: string): string => {
    if (!finalData) return '';
    const template = promptTemplates.dataCategories.find(c => c.id === categoryId);
    if (!template) return '';

    try {
      switch (categoryId) {
        case 'sinistros': {
          if (!finalData.emergency_calls?.annual_history?.length) return 'Nenhum dado de sinistros disponível';
          const years = finalData.emergency_calls.annual_history.map((y: { year: number; total_calls: number }) => y.year).sort();
          const total = finalData.emergency_calls.annual_history.reduce((s: number, y: { year: number; total_calls: number }) => s + y.total_calls, 0);
          const withVictims = 0;
          let withCyclists = 0;
          if (finalData.emergency_calls.by_category) {
            withCyclists = finalData.emergency_calls.by_category
              .filter((c: { category: string; count: number }) => ['sinistro_bicicleta', 'atropelamento_bicicleta'].includes(c.category))
              .reduce((s: number, c: { category: string; count: number }) => s + c.count, 0);
          }
          return template.summaryTemplate
            .replace('{total}', total.toLocaleString('pt-BR'))
            .replace('{firstYear}', String(years[0] || ''))
            .replace('{lastYear}', String(years[years.length - 1] || ''))
            .replace('{withVictims}', String(withVictims))
            .replace('{withCyclists}', String(withCyclists));
        }
        case 'infraestrutura': {
          if (!finalData.cycling_infra) return 'Nenhum dado de infraestrutura disponível';
          const parts: string[] = [];
          const existing = finalData.cycling_infra.existing || [];
          if (existing.length > 0) {
            const types = [...new Set(existing.map((e: { type: string; distance_meters?: number }) => e.type))].join(', ');
            const totalDist = existing.reduce((s: number, e: { type: string; distance_meters?: number }) => s + (e.distance_meters || 0), 0);
            parts.push(`${existing.length} trechos existentes (${formatDistance(totalDist)})`);
          }
          const planned = finalData.cycling_infra.planned_pdc || [];
          if (planned.length > 0) {
            parts.push(`${planned.length} trechos planejados (PDC)`);
          }
          return parts.length > 0 ? parts.join(', ') : 'Nenhuma infraestrutura no raio selecionado';
        }
        case 'contagens': {
          if (!finalData.cyclist_counts?.counts?.length) return 'Nenhuma contagem disponível';
          const counts = finalData.cyclist_counts.counts.filter((c: any) => !c.id?.toString().includes('prefeitura'));
          const totalCounts = counts.length;
          const totalCyclists = counts.reduce((s: number, c: any) => s + c.total_cyclists, 0);
          const avgDaily = totalCounts > 0 ? Math.round(totalCyclists / totalCounts) : 0;
          return template.summaryTemplate
            .replace('{totalCounts}', String(totalCounts))
            .replace('{avgDaily}', avgDaily.toLocaleString('pt-BR'));
        }
        case 'perfil': {
          if (!finalData.cyclist_profile?.total_profiles) return 'Nenhum perfil disponível';
          const editions = finalData.cyclist_profile.by_edition?.length || 0;
          return template.summaryTemplate
            .replace('{totalProfiles}', String(finalData.cyclist_profile.total_profiles))
            .replace('{editions}', String(editions));
        }
        case 'infracoes': {
          if (!finalData.traffic_tickets?.total_violations) return 'Nenhum dado de infrações disponível';
          const years = finalData.traffic_tickets.by_year?.map((y: { year: number; total: number }) => y.year).sort() || [];
          return template.summaryTemplate
            .replace('{total}', finalData.traffic_tickets.total_violations.toLocaleString('pt-BR'))
            .replace('{firstYear}', String(years[0] || ''))
            .replace('{lastYear}', String(years[years.length - 1] || ''));
        }
        case 'bicicletarios': {
          if (!finalData.bike_racks?.total) return 'Nenhum bicicletário disponível';
          return template.summaryTemplate
            .replace('{total}', String(finalData.bike_racks.total))
            .replace('{capacity}', String(finalData.bike_racks.total_capacity));
        }
        case 'bike_share': {
          if (!finalData.shared_bike?.has_stations) return 'Nenhuma estação disponível';
          return template.summaryTemplate
            .replace('{total}', String(finalData.shared_bike.stations?.length || 0));
        }
        default:
          return '';
      }
    } catch {
      return '';
    }
  };

  const buildDetailedDataSection = (categoryId: string): string => {
    if (!finalData) return '';

    switch (categoryId) {
      case 'sinistros': {
        if (!finalData.emergency_calls?.annual_history?.length) return '';
        const years = finalData.emergency_calls.annual_history.sort((a: { year: number; total_calls: number }, b: { year: number; total_calls: number }) => a.year - b.year);
        const total = years.reduce((s: number, y: { year: number; total_calls: number }) => s + y.total_calls, 0);
        let lines = `- Total de sinistros: ${total}\n`;
        lines += `- Período: ${years[0].year} a ${years[years.length - 1].year}\n`;
        if (finalData.emergency_calls.by_category) {
          finalData.emergency_calls.by_category.forEach((c: { category: string; count: number }) => {
            lines += `- ${formatCategory(c.category)}: ${c.count}\n`;
          });
        }
        if (finalData.emergency_calls.last_month_data) {
          lines += `- Dados do último mês (${finalData.emergency_calls.last_month_data.month}): ${finalData.emergency_calls.last_month_data.total_calls} chamados\n`;
        }
        return lines;
      }
      case 'infraestrutura': {
        if (!finalData.cycling_infra) return '';
        let lines = '';
        const existing = finalData.cycling_infra.existing || [];
        if (existing.length > 0) {
          lines += `Infraestrutura existente:\n`;
          existing.forEach((e: { name?: string; type: string; distance_meters?: number }) => {
            lines += `- ${e.name || e.type}: ${formatDistance(e.distance_meters || 0)}\n`;
          });
          const hasContinuity = existing.length > 1;
          if (!hasContinuity && existing.length === 1) {
            lines += `- Observação: apenas um trecho de infraestrutura identificado no raio, o que pode indicar descontinuidade.\n`;
          }
        }
        const planned = finalData.cycling_infra.planned_pdc || [];
        if (planned.length > 0) {
          lines += `\nInfraestrutura planejada (PDC):\n`;
          planned.forEach((p: { name: string; typology: string; pdc_km: number }) => {
            lines += `- ${p.name} (${p.typology}, ${p.pdc_km}km)\n`;
          });
        }
        return lines;
      }
      case 'contagens': {
        if (!finalData.cyclist_counts?.counts?.length) return '';
        const counts = finalData.cyclist_counts.counts.filter((c: any) => !c.id?.toString().includes('prefeitura'));
        if (!counts.length) return 'Nenhuma contagem Ameciclo disponível.';
        const totalCyclists = counts.reduce((s: number, c: any) => s + c.total_cyclists, 0);
        let lines = `- Total de contagens: ${counts.length}\n`;
        lines += `- Total de ciclistas contados: ${totalCyclists}\n`;
        lines += `- Média diária: ${Math.round(totalCyclists / counts.length)} ciclistas\n`;
        const latestCount = counts.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        if (latestCount) {
          lines += `- Contagem mais recente: ${latestCount.name} (${new Date(latestCount.date).toLocaleDateString('pt-BR')})\n`;
          lines += `- Maior fluxo: ${latestCount.total_cyclists} ciclistas\n`;
        }
        return lines;
      }
      case 'perfil': {
        if (!finalData.cyclist_profile?.by_edition?.length) return '';
        const latest = finalData.cyclist_profile.by_edition
          .sort((a: { edition: string; total_profiles: number; gender_distribution?: Record<string, number>; race_distribution?: Record<string, number> }, b: { edition: string; total_profiles: number; gender_distribution?: Record<string, number>; race_distribution?: Record<string, number> }) => parseInt(b.edition) - parseInt(a.edition))[0];
        if (!latest) return '';
        let lines = `- Edição mais recente: ${latest.edition}\n`;
        lines += `- Total de perfis: ${latest.total_profiles}\n`;
        if (latest.gender_distribution) {
          lines += `- Gênero:\n`;
          Object.entries(latest.gender_distribution).forEach(([g, c]) => {
            lines += `  ${g}: ${c} (${calculatePercentage(Number(c), latest.total_profiles)})\n`;
          });
        }
        if (latest.race_distribution) {
          lines += `- Raça/cor:\n`;
          Object.entries(latest.race_distribution).forEach(([r, c]) => {
            lines += `  ${r}: ${c} (${calculatePercentage(Number(c), latest.total_profiles)})\n`;
          });
        }
        return lines;
      }
      case 'infracoes': {
        if (!finalData.traffic_tickets?.total_violations) return '';
        let lines = `- Total de infrações: ${finalData.traffic_tickets.total_violations.toLocaleString('pt-BR')}\n`;
        const years = finalData.traffic_tickets.by_year?.sort((a: { year: number; total: number }, b: { year: number; total: number }) => a.year - b.year) || [];
        if (years.length) {
          lines += `- Período: ${years[0].year} a ${years[years.length - 1].year}\n`;
        }
        if (finalData.traffic_tickets.top_violations?.length) {
          lines += `- Principais infrações:\n`;
          finalData.traffic_tickets.top_violations.slice(0, 5).forEach((v: { description: string; count: number; percentage: number }) => {
            lines += `  ${v.description}: ${v.count.toLocaleString('pt-BR')} (${v.percentage.toFixed(1)}%)\n`;
          });
        }
        if (finalData.traffic_tickets.vulnerable_violations?.length) {
          lines += `- Infrações contra pedestres e ciclistas:\n`;
          finalData.traffic_tickets.vulnerable_violations.forEach((v: { description: string; count: number }) => {
            lines += `  ${v.description}: ${v.count.toLocaleString('pt-BR')}\n`;
          });
        }
        return lines;
      }
      case 'bicicletarios': {
        if (!finalData.bike_racks?.items?.length) return '';
        let lines = `- Total: ${finalData.bike_racks.total} bicicletários\n`;
        lines += `- Capacidade total: ${finalData.bike_racks.total_capacity} vagas\n`;
        finalData.bike_racks.items.slice(0, 5).forEach((r: { name: string; capacity: string; distance_meters: number }) => {
          lines += `- ${r.name}: ${r.capacity} vagas, a ${formatDistance(r.distance_meters)}\n`;
        });
        return lines;
      }
      case 'bike_share': {
        if (!finalData.shared_bike?.stations?.length) return '';
        let lines = `- ${finalData.shared_bike.stations.length} estações\n`;
        finalData.shared_bike.stations.slice(0, 5).forEach((s: { name: string; capacity: number; distance_meters: number }) => {
          lines += `- ${s.name}: ${s.capacity} bicicletas, a ${formatDistance(s.distance_meters)}\n`;
        });
        return lines;
      }
      default:
        return '';
    }
  };

  const buildPrompt = (): string => {
    if (!docType && !objective && selectedDataCategories.size === 0) return '';

    const street = finalData?.location?.nearest_street?.official_name || finalData?.location?.nearest_street?.name || 'local selecionado';
    const templates = promptTemplates.promptTemplates;

    let prompt = templates.systemHeader;

    const docHeader = templates.documentHeaders[docType as keyof typeof templates.documentHeaders]
      || templates.documentHeaders['outro'];
    prompt += docHeader
      .replace('{street}', street)
      .replace('{city}', 'Recife')
      .replace('{radius}', '200')
      .replace('{lat}', lat.toFixed(6))
      .replace('{lng}', lng.toFixed(6));
    prompt += '\n\n';

    const effectiveObjective = objective || promptTemplates.quickObjectives.find(q => q.id === quickObjective)?.label || '';
    if (effectiveObjective) {
      prompt += 'OBJETIVO\n\n';
      prompt += effectiveObjective + '\n\n';
    }

    const audienceLabel = audience === 'custom' ? customAudience
      : promptTemplates.audiences.find(a => a.id === audience)?.label || '';
    if (audience) {
      prompt += 'DESTINATÁRIO\n\n';
      prompt += audienceLabel + '\n\n';
    }

    if (selectedDataCategories.size > 0) {
      prompt += 'DADOS DISPONÍVEIS\n\n';
      prompt += `Período analisado: dados históricos disponíveis na plataforma CicloDados.\n`;
      prompt += `Raio da análise: 200 metros das coordenadas ${lat.toFixed(6)}, ${lng.toFixed(6)}.\n\n`;

      selectedDataCategories.forEach(cat => {
        const template = promptTemplates.dataCategories.find(c => c.id === cat);
        if (template) {
          prompt += `${template.label}:\n`;
          prompt += buildDetailedDataSection(cat);
          prompt += '\n';
        }
      });
    }

    let ruleNum = 1;
    prompt += 'INSTRUÇÕES\n\n';

    templates.instructionRules.default.forEach((rule: string) => {
      prompt += `${ruleNum}. ${rule}\n`;
      ruleNum++;
    });

    prompt += `${ruleNum}. Utilize linguagem adequada para o documento solicitado.\n`;
    ruleNum++;

    if (tone) {
      const toneRules = templates.instructionRules.byTone[tone as keyof typeof templates.instructionRules.byTone];
      if (toneRules) {
        (toneRules as string[]).forEach((rule: string) => {
          prompt += `${ruleNum}. ${rule}\n`;
          ruleNum++;
        });
      }
    }

    if (includeTables) {
      prompt += `${ruleNum}. ${templates.instructionRules.includeTables}\n`;
      ruleNum++;
    }
    if (includeRecommendations) {
      prompt += `${ruleNum}. ${templates.instructionRules.includeRecommendations}\n`;
      ruleNum++;
    }
    if (includeLegalBasis) {
      prompt += `${ruleNum}. ${templates.instructionRules.includeLegalBasis}\n`;
      ruleNum++;
    }
    if (includeLimitations) {
      prompt += `${ruleNum}. ${templates.instructionRules.includeLimitations}\n`;
      ruleNum++;
    }

    const sizeRule = templates.instructionRules.bySize[docSize as keyof typeof templates.instructionRules.bySize];
    if (sizeRule) {
      prompt += `${ruleNum}. ${sizeRule}\n`;
      ruleNum++;
    }

    prompt += `${ruleNum}. Mencione a origem e o período de cada conjunto de dados.\n`;
    ruleNum++;

    const structure = templates.structures[docType as keyof typeof templates.structures] || templates.structures['outro'];
    prompt += `\nORGANIZE O TEXTO NAS SEGUINTES SEÇÕES\n\n`;
    structure.forEach((s: string, i: number) => {
      prompt += `${i + 1}. ${s}\n`;
    });

    prompt += `\n\nAo final, faça uma lista dos anexos que poderiam acompanhar o documento.`;

    return prompt;
  };

  const buildStructuredData = () => {
    const data: Record<string, any> = {
      local: finalData?.location?.nearest_street?.official_name || finalData?.location?.nearest_street?.name || '',
      coordenadas: { latitude: lat, longitude: lng },
      raio_metros: 200,
    };

    if (selectedDataCategories.has('sinistros') && finalData?.emergency_calls) {
      data.sinistros = {
        total: finalData.emergency_calls.annual_history?.reduce((s: number, y: { year: number; total_calls: number }) => s + y.total_calls, 0) || 0,
        por_ano: finalData.emergency_calls.annual_history || [],
        por_categoria: finalData.emergency_calls.by_category || [],
        por_genero: finalData.emergency_calls.by_gender || [],
      };
    }

    if (selectedDataCategories.has('infraestrutura') && finalData?.cycling_infra) {
      data.infraestrutura = {
        existente: finalData.cycling_infra.existing || [],
        planejada_pdc: finalData.cycling_infra.planned_pdc || [],
      };
    }

    if (selectedDataCategories.has('contagens') && finalData?.cyclist_counts) {
      data.contagens = finalData.cyclist_counts.counts || [];
    }

    if (selectedDataCategories.has('perfil') && finalData?.cyclist_profile) {
      data.perfil = {
        total_perfis: finalData.cyclist_profile.total_profiles,
        edicoes: finalData.cyclist_profile.by_edition || [],
      };
    }

    if (selectedDataCategories.has('infracoes') && finalData?.traffic_tickets) {
      data.infracoes = {
        total: finalData.traffic_tickets.total_violations,
        por_ano: finalData.traffic_tickets.by_year || [],
        principais: finalData.traffic_tickets.top_violations || [],
        contra_vulneraveis: finalData.traffic_tickets.vulnerable_violations || [],
      };
    }

    if (selectedDataCategories.has('bicicletarios') && finalData?.bike_racks) {
      data.bicicletarios = finalData.bike_racks;
    }

    if (selectedDataCategories.has('bike_share') && finalData?.shared_bike) {
      data.bike_share = finalData.shared_bike;
    }

    return JSON.stringify(data, null, 2);
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(buildPrompt());
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {}
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(buildStructuredData());
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } catch {}
  };

  const handleDownloadJson = () => {
    const data = buildStructuredData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ciclodados-${streetSlug || 'dados'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenChatGPT = () => {
    const encoded = encodeURIComponent(buildPrompt());
    window.open(`https://chat.openai.com/?hints=search&q=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100 p-4">
      <div ref={modalRef} className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="point-info-title">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b bg-linear-to-r from-gray-50 to-white">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
              <MapPin size={22} className="text-blue-600" />
              {finalData.location.nearest_street.official_name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Exibe dados em um raio de 200m do ponto clicado
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
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50 overflow-x-auto shrink-0">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const colors = tabColorClasses[tab.color];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? `${colors.active} bg-white`
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Icon size={16} className={isActive ? colors.icon : undefined} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 min-h-0">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {(() => {
                const hasData = finalData.emergency_calls || 
                  (finalData.bike_racks && finalData.bike_racks.total > 0) ||
                  (finalData.cyclist_counts && finalData.cyclist_counts.counts?.length > 0) ||
                  (finalData.cyclist_profile && finalData.cyclist_profile.total_profiles > 0) ||
                  (finalData.shared_bike && finalData.shared_bike.has_stations) ||
                  (finalData.cycling_infra && (finalData.cycling_infra.existing?.length > 0 || finalData.cycling_infra.planned_pdc?.length > 0)) ||
                  (finalData.traffic_tickets && finalData.traffic_tickets.total_violations > 0) ||
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
                        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white cursor-pointer" onClick={() => setActiveTab('safety')}>
                          <div className="flex items-center gap-2 mb-2">
                            <Ambulance size={20} className="text-red-600" />
                            <h4 className="font-semibold text-gray-800">Sinistros</h4>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">
                            {finalData.emergency_calls.annual_history?.reduce((sum, year) => sum + year.total_calls, 0) || 0}
                          </p>
                           <p className="text-sm text-gray-600">sinistros totais</p>
                        </div>
                      )}

                      {finalData.bike_racks && finalData.bike_racks.total > 0 && (
                        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white cursor-pointer" onClick={() => setActiveTab('infrastructure')}>
                          <div className="flex items-center gap-2 mb-2">
                            <Bike size={20} className="text-blue-600" />
                            <h4 className="font-semibold text-gray-800">Bicicletários</h4>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{finalData.bike_racks.total}</p>
                          <p className="text-sm text-gray-600">{finalData.bike_racks.total_capacity} vagas</p>
                        </div>
                      )}

                      {finalData.cyclist_counts && finalData.cyclist_counts.counts?.length > 0 && (
                        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white cursor-pointer" onClick={() => setActiveTab('counts')}>
                          <div className="flex items-center gap-2 mb-2">
                            <BarChart3 size={20} className="text-green-600" />
                            <h4 className="font-semibold text-gray-800">Contagens</h4>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{finalData.cyclist_counts.counts.length}</p>
                          <p className="text-sm text-gray-600">pontos próximos</p>
                        </div>
                      )}

                      {finalData.cyclist_profile && finalData.cyclist_profile.total_profiles > 0 && (
                        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white cursor-pointer" onClick={() => setActiveTab('profile')}>
                          <div className="flex items-center gap-2 mb-2">
                            <Users size={20} className="text-purple-600" />
                            <h4 className="font-semibold text-gray-800">Perfis</h4>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{finalData.cyclist_profile.total_profiles}</p>
                          <p className="text-sm text-gray-600">ciclistas</p>
                        </div>
                      )}

                      {finalData.shared_bike && finalData.shared_bike.has_stations && (
                        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white cursor-pointer" onClick={() => setActiveTab('infrastructure')}>
                          <div className="flex items-center gap-2 mb-2">
                            <Activity size={20} className="text-orange-600" />
                            <h4 className="font-semibold text-gray-800">Bike PE</h4>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{finalData.shared_bike.stations?.length || 0}</p>
                          <p className="text-sm text-gray-600">estações</p>
                        </div>
                      )}

                      {finalData.cycling_infra && (finalData.cycling_infra.existing?.length > 0 || finalData.cycling_infra.planned_pdc?.length > 0) && (
                        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white cursor-pointer" onClick={() => setActiveTab('infrastructure')}>
                          <div className="flex items-center gap-2 mb-2">
                            <Route size={20} className="text-teal-600" />
                            <h4 className="font-semibold text-gray-800">Infraestrutura</h4>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">
                            {(finalData.cycling_infra.existing?.length || 0) + (finalData.cycling_infra.planned_pdc?.length || 0)}
                          </p>
                          <p className="text-sm text-gray-600">vias próximas</p>
                        </div>
                      )}

                      {finalData.traffic_tickets && finalData.traffic_tickets.total_violations > 0 && (
                        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white cursor-pointer" onClick={() => setActiveTab('violations')}>
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle size={20} className="text-red-600" />
                            <h4 className="font-semibold text-gray-800">Infrações</h4>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">
                            {finalData.traffic_tickets.total_violations.toLocaleString('pt-BR')}
                          </p>
                          <p className="text-sm text-gray-600">infrações totais</p>
                        </div>
                      )}
                    </div>

                    {finalData.location && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <MapPin size={18} />
                          Localização
                        </h4>
                        <div className="space-y-2">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Coordenadas</p>
                            <p className="text-sm text-gray-700">{finalData.location.lat.toFixed(6)}, {finalData.location.lng.toFixed(6)}</p>
                          </div>
                          {finalData.location.nearest_street && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-800">{finalData.location.nearest_street.official_name || finalData.location.nearest_street.name}</p>
                                {finalData.location.nearest_street.id !== undefined && (
                                  <span className="text-[10px] font-mono text-gray-400">#{finalData.location.nearest_street.id}</span>
                                )}
                              </div>
                              {finalData.location.nearest_street.name !== finalData.location.nearest_street.official_name && (
                                <p className="text-xs text-gray-500 mt-0.5">Nome popular: {finalData.location.nearest_street.name}</p>
                              )}
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-600">
                                {finalData.location.nearest_street.distance_to_point_meters !== undefined && (
                                  <span>Distância: {formatDistance(finalData.location.nearest_street.distance_to_point_meters)}</span>
                                )}
                                {finalData.location.nearest_street.total_length_meters && (
                                  <span>Extensão: {formatDistance(finalData.location.nearest_street.total_length_meters)}</span>
                                )}
                              </div>
                              {finalData.location.nearby_streets && finalData.location.nearby_streets.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-xs text-gray-500 mb-2">Ruas próximas:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {finalData.location.nearby_streets.slice(0, 4).map(street => (
                                      <button
                                        key={street.id}
                                        onClick={() => setSelectedStreetId(street.id)}
                                        className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                                          selectedStreetId === street.id
                                            ? 'bg-blue-100 border-blue-400 text-blue-700 font-medium'
                                            : 'bg-white border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-300'
                                        }`}
                                      >
                                        {street.name} ({formatDistance(street.distance_meters)})
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

            </div>
          )}

          {activeTab === 'safety' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">Dados de Sinistros</h4>
                <a 
                  href={`/dados/vias-inseguras/${streetSlug}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  Ver dados completos
                  <ArrowRight size={14} />
                </a>
              </div>
              {finalData.emergency_calls?.first_month_data && finalData.emergency_calls.last_month_data && (
                <p className="text-xs text-gray-400">
                  Período coberto: {finalData.emergency_calls.first_month_data.month} — {finalData.emergency_calls.last_month_data.month}
                </p>
              )}
              {finalData.emergency_calls && (
                <>
                  {/* Evolução de Sinistros */}
                  {finalData.emergency_calls?.annual_history?.length > 1 && (() => {
                    const currentYear = new Date().getFullYear();
                    const allData = finalData.emergency_calls.annual_history.sort((a, b) => a.year - b.year);
                    const chartData = allData.slice(-8);
                    
                    const maxCalls = Math.max(...chartData.map(y => y.total_calls));
                    const minCalls = Math.min(...chartData.map(y => y.total_calls));
                    const range = maxCalls - minCalls || 1;
                    
                    return (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-semibold text-gray-800">Evolução de Sinistros</h5>
                        </div>
                        <svg className="w-full" viewBox="0 0 800 200" style={{height: '200px'}}>
                          <defs>
                            <pattern id="grid" width="80" height="20" patternUnits="userSpaceOnUse">
                              <path d="M 80 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#grid)" />
                          
                          {(() => {
                            const points = chartData.map((year, index) => {
                              const x = 80 + (index * (640 / (chartData.length - 1 || 1)));
                              const y = 170 - ((year.total_calls - minCalls) / range) * 120;
                              return `${x},${y}`;
                            }).join(' ');
                            
                            return (
                              <>
                                <polyline fill="none" stroke="#dc2626" strokeWidth="3" points={points} />
                                {chartData.map((year, index) => {
                                  const x = 80 + (index * (640 / (chartData.length - 1 || 1)));
                                  const y = 170 - ((year.total_calls - minCalls) / range) * 120;
                                  const is2025 = year.year === 2025;
                                  const isLastPoint = index === chartData.length - 1;
                                  return (
                                    <g key={year.year}>
                                      <circle cx={x} cy={y} r="4" fill="#dc2626" />
                                      <text x={x} y={y - 10} textAnchor="middle" className="text-xs font-bold fill-gray-700">{year.total_calls}</text>
                                      <text x={x} y={190} textAnchor="middle" className="text-xs fill-gray-500">{year.year}</text>
                                      {is2025 && isLastPoint && finalData.emergency_calls.last_month_data && (
                                        <>
                                          <rect x={x - 55} y={y - 60} width="110" height="22" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" rx="4" />
                                          <text x={x} y={y - 44} textAnchor="middle" className="text-[11px] font-bold fill-amber-900">
                                            Até {finalData.emergency_calls.last_month_data.month}
                                          </text>
                                        </>
                                      )}
                                    </g>
                                  );
                                })}
                              </>
                            );
                          })()}
                        </svg>
                        <div className="grid grid-cols-3 gap-3 mt-4">
                          <div className="text-center p-3 bg-gray-50 rounded-sm">
                            <p className="text-2xl font-bold text-gray-800">
                              {allData.reduce((sum, year) => sum + year.total_calls, 0)}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">Total Histórico</p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-sm">
                            <p className="text-2xl font-bold text-gray-800">
                              {Math.round(allData.reduce((sum, year) => sum + year.total_calls, 0) / allData.filter(y => y.year < currentYear).length)}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">Média Anual</p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-sm">
                            <p className="text-2xl font-bold text-gray-800">
                              {chartData[chartData.length - 1]?.total_calls || 0}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">Último Ano</p>
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  {finalData.emergency_calls.by_category?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target size={18} />
                        Por Categoria de Sinistro
                      </h4>
                      <div className="space-y-2">
                        {finalData.emergency_calls.by_category.map(category => (
                          <div key={category.category} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                            <span className="text-sm font-medium">{formatCategory(category.category)}</span>
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
                            <div key={gender.gender || 'Não informado'} className="flex justify-between items-center p-2 bg-gray-50 rounded-sm">
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
                          {[...finalData.emergency_calls.by_age_group]
                            .sort((a, b) => getAgeOrder(a.age_group) - getAgeOrder(b.age_group))
                            .map(age => (
                            <div key={age.age_group} className="flex justify-between items-center p-2 bg-gray-50 rounded-sm">
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
                   <p>Nenhum dado de sinistro disponível para este ponto</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'infrastructure' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">Infraestrutura Cicloviária</h4>
                <a 
                  href="/dados/execucao-cicloviaria" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  Ver dados completos
                  <ArrowRight size={14} />
                </a>
              </div>
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
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">Contagens de Ciclistas</h4>
                <a 
                  href={latestCountSlug ? `/dados/contagens/${latestCountSlug}` : `/dados/contagens/${streetSlug}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  Ver dados completos
                  <ArrowRight size={14} />
                </a>
              </div>
              {finalData.cyclist_counts && finalData.cyclist_counts.counts?.length > 0 && (() => {
                const amecicloCounts = finalData.cyclist_counts.counts.filter((c: any) => !c.id?.toString().includes('prefeitura'));
                const prefeituraCounts = finalData.cyclist_counts.counts.filter((c: any) => c.id?.toString().includes('prefeitura'));
                const totalAmeciclo = amecicloCounts.reduce((sum: number, c: any) => sum + c.total_cyclists, 0);
                const totalCargo = amecicloCounts.reduce((sum: number, c: any) => sum + (c.characteristics?.cargo || 0), 0);
                const totalWomen = amecicloCounts.reduce((sum: number, c: any) => sum + (c.characteristics?.women || 0), 0);
                const totalService = prefeituraCounts.reduce((sum: number, c: any) => sum + (c.characteristics?.service || 0), 0);

                return (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="text-center p-3 bg-gray-50 rounded-sm">
                        <p className="text-2xl font-bold text-gray-800">{totalAmeciclo}</p>
                        <p className="text-xs text-gray-600 mt-1">Total Contado (Ameciclo)</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-sm">
                        <p className="text-2xl font-bold text-gray-800">{totalCargo}</p>
                        <p className="text-xs text-gray-600 mt-1">Cargueiras (Ameciclo)</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-sm">
                        <p className="text-2xl font-bold text-gray-800">{totalWomen}</p>
                        <p className="text-xs text-gray-600 mt-1">Mulheres (Ameciclo)</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-sm">
                        <p className="text-2xl font-bold text-gray-800">{totalService}</p>
                        <p className="text-xs text-gray-600 mt-1">Serviço (Prefeitura)</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {finalData.cyclist_counts.counts
                        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((count: any) => {
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
                                  
                                  {count.characteristics && (() => {
                                    const characteristics = [
                                      { key: 'helmet', label: 'Capacete', icon: ShieldCheck, value: count.characteristics.helmet },
                                      { key: 'women', label: 'Mulheres', icon: User, value: count.characteristics.women },
                                      { key: 'wrong_way', label: 'Contramão', icon: RotateCcw, value: count.characteristics.wrong_way },
                                      { key: 'cargo', label: 'Cargueira', icon: Package, value: count.characteristics.cargo },
                                      { key: 'juveniles', label: 'Crianças e Adolescentes', icon: Baby, value: count.characteristics.juveniles },
                                      { key: 'sidewalk', label: 'Calçada', icon: Footprints, value: count.characteristics.sidewalk },
                                      { key: 'shared_bike', label: 'Compartilhada', icon: Bike, value: count.characteristics.shared_bike },
                                      { key: 'service', label: 'Serviço', icon: Wrench, value: count.characteristics.service },
                                      { key: 'motor', label: 'Motorizada', icon: Zap, value: count.characteristics.motor },
                                      { key: 'ride', label: 'Carona', icon: UserPlus, value: count.characteristics.ride }
                                    ].filter(char => char.value > 0);
                                    
                                    if (characteristics.length === 0) return null;
                                    
                                    return (
                                      <div>
                                        <h5 className="font-semibold mb-3 text-sm text-gray-800">Características dos Ciclistas</h5>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                          {characteristics.map(char => {
                                            const Icon = char.icon;
                                            const percentage = Math.round((char.value / count.total_cyclists) * 100);
                                            return (
                                              <div key={char.key} className="border rounded-lg p-3 bg-white hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-2 mb-2">
                                                  <Icon size={16} className="text-gray-600" />
                                                  <span className="text-xs font-medium text-gray-700">{char.label}</span>
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                  <span className="text-xl font-bold text-gray-900">{char.value}</span>
                                                  <span className="text-xs text-gray-500">({percentage}%)</span>
                                                </div>
                                                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                                  <div 
                                                    className="bg-blue-600 h-1.5 rounded-full transition-all" 
                                                    style={{ width: `${percentage}%` }}
                                                  />
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })()}
                                  {!count.id?.toString().includes('prefeitura') && (
                                    <a
                                      href={`/dados/contagens/${slugifyCount({name: count.name}, count)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 mt-3 text-xs text-teal-600 hover:text-teal-700"
                                    >
                                      Ver detalhes <ArrowRight size={12} />
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </>
                );
              })()}
              
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
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">Perfil de Ciclistas</h4>
                <a 
                  href="/dados/perfil" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  Ver dados completos
                  <ArrowRight size={14} />
                </a>
              </div>
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

                  {extraData?.selectedProfileData && (
                    <div className="bg-white border rounded-lg p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <BarChart3 size={16} />
                        Indicadores
                      </h4>
                      <div className="flex gap-1 mb-4 flex-wrap">
                        {[
                          { key: 'acidentes' as const, label: 'Acidentes' },
                          { key: 'idade' as const, label: 'Idade' },
                          { key: 'motivacao' as const, label: 'Motivação' },
                          { key: 'problemas' as const, label: 'Problemas' },
                        ].map(m => (
                          <button
                            key={m.key}
                            onClick={() => setPerfilMetric(m.key)}
                            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                              perfilMetric === m.key
                                ? 'bg-teal-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                      {perfilMetric === 'acidentes' && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Sinistros</span>
                            <span className="font-medium">{extraData.selectedProfileData.accidents_percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-3">
                            <div
                              className="h-3 rounded-full bg-orange-500 transition-all"
                              style={{ width: `${Math.min(extraData.selectedProfileData.accidents_percentage || 0, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {extraData.selectedProfileData.accidents_percentage}% dos ciclistas sofreram acidente
                          </p>
                        </div>
                      )}
                      {perfilMetric === 'idade' && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Idade média</span>
                            <span className="font-medium">{extraData.selectedProfileData.avg_age} anos</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-3">
                            <div
                              className="h-3 rounded-full bg-blue-500 transition-all"
                              style={{ width: `${Math.min(((extraData.selectedProfileData.avg_age || 0) / 80) * 100, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Média de {extraData.selectedProfileData.avg_age} anos entre os entrevistados
                          </p>
                        </div>
                      )}
                      {perfilMetric === 'motivacao' && (
                        <div>
                          {extraData.selectedProfileData.motivations ? (
                            <div className="space-y-2">
                              <p className="text-xs text-gray-500">Motivações para usar bicicleta</p>
                              {Object.entries(extraData.selectedProfileData.motivations as Record<string, number>)
                                .sort(([,a],[,b]) => b - a)
                                .map(([label, pct]) => (
                                  <div key={label}>
                                    <div className="flex justify-between text-xs mb-0.5">
                                      <span className="text-gray-600">{label}</span>
                                      <span className="font-medium">{pct}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                      <div className="h-2.5 rounded-full bg-teal-500" style={{ width: `${Math.min(pct, 100)}%` }} />
                                    </div>
                                  </div>
                              ))}
                            </div>
                          ) : (
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Principal motivação</span>
                                <span className="font-medium text-teal-700">{extraData.selectedProfileData.top_motivation || 'N/A'}</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-3">
                                <div className="h-3 rounded-full bg-teal-500 w-full" />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {perfilMetric === 'problemas' && (
                        <div>
                          {extraData.selectedProfileData.issues ? (
                            <div className="space-y-2">
                              <p className="text-xs text-gray-500">Problemas relatados pelos ciclistas</p>
                              {Object.entries(extraData.selectedProfileData.issues as Record<string, number>)
                                .sort(([,a],[,b]) => b - a)
                                .map(([label, pct]) => (
                                  <div key={label}>
                                    <div className="flex justify-between text-xs mb-0.5">
                                      <span className="text-gray-600">{label}</span>
                                      <span className="font-medium">{pct}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                      <div className="h-2.5 rounded-full bg-red-500" style={{ width: `${Math.min(pct, 100)}%` }} />
                                    </div>
                                  </div>
                              ))}
                            </div>
                          ) : (
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Principal problema</span>
                                <span className="font-medium text-red-700">{extraData.selectedProfileData.top_issue || 'N/A'}</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-3">
                                <div className={`h-3 rounded-full ${extraData.selectedProfileData.top_issue && extraData.selectedProfileData.top_issue !== 'N/A' ? 'bg-red-500' : 'bg-gray-300'} w-full`} />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {perfilMetric === 'idades' && (
                        <div>
                          {extraData.selectedProfileData.age_ranges ? (
                            <div className="space-y-2">
                              <p className="text-xs text-gray-500">Faixa etária dos ciclistas</p>
                              {Object.entries(extraData.selectedProfileData.age_ranges as Record<string, number>)
                                .sort(([a],[b]) => {
                                  const order = ['18-25','26-35','36-45','46-60','60+'];
                                  return order.indexOf(a) - order.indexOf(b);
                                })
                                .map(([label, pct]) => (
                                  <div key={label}>
                                    <div className="flex justify-between text-xs mb-0.5">
                                      <span className="text-gray-600">{label} anos</span>
                                      <span className="font-medium">{pct}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                      <div className="h-2.5 rounded-full bg-blue-500" style={{ width: `${Math.min(pct, 100)}%` }} />
                                    </div>
                                  </div>
                              ))}
                            </div>
                          ) : (
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Idade média</span>
                                <span className="font-medium">{extraData.selectedProfileData.avg_age} anos</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-3">
                                <div className="h-3 rounded-full bg-blue-500" style={{ width: `${Math.min(((extraData.selectedProfileData.avg_age || 0) / 80) * 100, 100)}%` }} />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

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
                                        .sort(([a], [b]) => a.localeCompare(b))
                                        .map(([race, count]) => (
                                        <div key={race} className="flex justify-between text-sm p-2 bg-gray-50 rounded-sm">
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
                                        .sort(([a], [b]) => a.localeCompare(b))
                                        .map(([gender, count]) => (
                                        <div key={gender} className="flex justify-between text-sm p-2 bg-pink-50 rounded-sm">
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
                                        .sort(([a], [b]) => {
                                          const na = parseInt(a.match(/(\d+)/)?.[0] || '999');
                                          const nb = parseInt(b.match(/(\d+)/)?.[0] || '999');
                                          return na - nb;
                                        })
                                        .map(([age, count]) => (
                                        <div key={age} className="flex justify-between text-sm p-2 bg-green-50 rounded-sm">
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
                                        .sort(([a], [b]) => {
                                          const order: Record<string, number> = {
                                            'Fundamental': 0, 'Médio': 1, 'Superior': 2, 'Pós': 3,
                                            'Alfabetizado': 4, 'Não alfabetizado': 5, 'Não Informado': 6,
                                          };
                                          const oa = Object.entries(order).find(([k]) => a.includes(k))?.[1] ?? 10;
                                          const ob = Object.entries(order).find(([k]) => b.includes(k))?.[1] ?? 10;
                                          return oa - ob || a.localeCompare(b);
                                        })
                                        .map(([education, count]) => (
                                        <div key={education} className="flex justify-between text-sm p-2 bg-blue-50 rounded-sm">
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
                                        .sort(([a], [b]) => {
                                          const incomeNum = (label: string): number => {
                                            if (label.toLowerCase().includes('sem renda')) return -1;
                                            if (label.toLowerCase().includes('até')) return parseFloat(label.match(/(\d+)/)?.[0] || '0') - 0.5;
                                            if (label.toLowerCase().includes('acima')) return parseFloat(label.match(/(\d+)/)?.[0] || '0') + 1;
                                            const nums = label.match(/(\d+)/g);
                                            if (nums && nums.length >= 2) return (parseFloat(nums[0]) + parseFloat(nums[nums.length - 1])) / 2;
                                            return parseFloat(label.match(/(\d+)/)?.[0] || '0');
                                          };
                                          return incomeNum(a) - incomeNum(b);
                                        })
                                        .map(([income, count]) => (
                                        <div key={income} className="flex justify-between text-sm p-2 bg-yellow-50 rounded-sm">
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

                              {edition.other_attributes && Object.keys(edition.other_attributes).length > 0 && (() => {
                                const translateKey = (key: string) => {
                                  const translations: Record<string, string> = {
                                    'Years Using': 'Tempo de uso',
                                    'Biggest Need': 'Maior necessidade',
                                    'Motivation To Start': 'Motivação para começar',
                                    'Motivation To Continue': 'Motivação para continuar',
                                    'frequency_what': 'O que faria pedalar mais?',
                                    'years_using': 'Tempo de uso',
                                    'biggest_need': 'Maior necessidade',
                                    'motivation_to_start': 'Motivação para começar',
                                    'motivation_to_continue': 'Motivação para continuar',
                                  };
                                  return translations[key] || key;
                                };

                                const translateValue = (value: string) => {
                                  const translations: Record<string, string> = {
                                    'Menos De 6 Meses': 'Menos de 6 meses',
                                    'Entre 6 Meses E 1 Ano': 'Entre 6 meses e 1 ano',
                                    'Entre 1 E 2 Anos': 'Entre 1 e 2 anos',
                                    'Entre 2 E 5 Anos': 'Entre 2 e 5 anos',
                                    'Mais De 5 Anos': 'Mais de 5 anos',
                                    'É Mais Barato': 'É mais barato',
                                    'É Mais SaudáVel': 'É mais saudável',
                                    'É Mais RáPido E PráTico': 'É mais rápido e prático',
                                    'É Ambientalmente Correto': 'É ambientalmente correto',
                                    'Outros': 'Outros'
                                  };
                                  return translations[value] || value;
                                };

                                const grouped: Record<string, Record<string, number>> = {};

                                Object.entries(edition.other_attributes)
                                  .filter(([key]) => key.includes('motivation') || key.includes('biggest_need') || key.includes('years_using') || key.includes('Years Using') || key.includes('Biggest Need') || key.includes('Motivation') || key.includes('frequency'))
                                  .forEach(([attr, count]) => {
                                    const parts = attr.split(':').map(p => p.trim());
                                    if (parts.length >= 2) {
                                      const category = translateKey(parts[0]);
                                      const value = translateValue(parts[1]);
                                      if (!grouped[category]) grouped[category] = {};
                                      grouped[category][value] = (grouped[category][value] || 0) + (typeof count === 'number' ? count : 0);
                                    }
                                  });

                                return (
                                  <div className="mt-6">
                                    <h5 className="font-medium mb-3 text-sm">Características Comportamentais</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {Object.entries(grouped).map(([category, values]) => (
                                        <div key={category} className="border border-purple-200 rounded-lg p-3 bg-purple-50">
                                          <h6 className="text-sm font-semibold text-purple-900 mb-2 pb-2 border-b border-purple-200">{category}</h6>
                                          <div className="space-y-1.5">
                                            {Object.entries(values)
                                              .sort(([,a], [,b]) => b - a)
                                              .map(([value, count]) => (
                                                <div key={`${category}-${value}`} className="flex justify-between items-center text-xs bg-white p-2 rounded-sm">
                                                  <span className="text-gray-700">{value}</span>
                                                  <div className="flex items-center gap-2">
                                                    <span className="font-bold text-purple-700">{count}</span>
                                                    <span className="text-gray-500">({calculatePercentage(count, edition.total_profiles)})</span>
                                                  </div>
                                                </div>
                                              ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })()}
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

          {activeTab === 'violations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold flex items-center gap-2 text-gray-800">
                  <AlertTriangle size={18} className="text-red-600" />
                  Infrações de Trânsito
                </h4>
                <a 
                  href="/dados/infracoes" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  Ver dados completos
                  <ArrowRight size={14} />
                </a>
              </div>

              {!finalData.traffic_tickets || finalData.traffic_tickets.total_violations === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <AlertTriangle size={40} className="mx-auto mb-3 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Os dados de infrações são disponibilizados apenas para as 250 vias com maior volume de registros.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Esta via pode não estar entre as top 250 ou não possuir infrações registradas no período.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-red-700">
                        {finalData.traffic_tickets.total_violations.toLocaleString('pt-BR')}
                      </p>
                      <p className="text-xs text-red-600 mt-1">Total de infrações</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                      {(() => {
                        const fm = finalData.traffic_tickets.first_month_data?.month;
                        const lm = finalData.traffic_tickets.last_month_data?.month;
                        if (fm && lm) {
                          return (
                            <p className="text-2xl font-bold text-blue-700">
                              {fm} — {lm}
                            </p>
                          );
                        }
                        const years = finalData.traffic_tickets.by_year?.map(y => y.year).sort((a: number, b: number) => a - b);
                        if (years?.length) {
                          return (
                            <p className="text-2xl font-bold text-blue-700">
                              {years[0]} — {years[years.length - 1]}
                            </p>
                          );
                        }
                        return <p className="text-2xl font-bold text-blue-700">—</p>;
                      })()}
                      <p className="text-xs text-blue-600 mt-1">Período coberto</p>
                    </div>
                  </div>

                  {/* Evolução anual */}
                  {finalData.traffic_tickets.by_year?.length > 1 && (() => {
                    const sorted = [...finalData.traffic_tickets.by_year].sort((a, b) => a.year - b.year);
                    const maxVal = Math.max(...sorted.map(y => y.total));
                    const chartHeight = 120;
                    const topPad = 20;
                    const totalH = chartHeight + topPad + 36;
                    const chartWidth = sorted.length * 40;

                    return (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-3">Evolução anual</h5>
                        <div className="w-full">
                          <svg width="100%" height={totalH} viewBox={`0 0 ${chartWidth} ${totalH}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Evolução anual de infrações">
                            {sorted.map((item, i) => {
                              const barH = maxVal > 0 ? (item.total / maxVal) * chartHeight : 0;
                              const totalBarW = chartWidth / sorted.length;
                              const barWidth = totalBarW * 0.6;
                              const gap = totalBarW * 0.2;
                              const x = i * totalBarW + gap;
                              const barY = topPad + chartHeight - barH;
                              return (
                                <g key={item.year}>
                                  <text x={x + barWidth / 2} y={barY - 4}
                                    textAnchor="middle" fill="#6b7280" fontSize="10" fontWeight="600">
                                    {item.total.toLocaleString('pt-BR')}
                                  </text>
                                  <rect
                                    x={x} y={barY}
                                    width={barWidth} height={barH}
                                    fill="#ef4444" rx="2" opacity="0.85"
                                  >
                                    <title>{item.year}: {item.total.toLocaleString('pt-BR')} infrações</title>
                                  </rect>
                                  <text x={x + barWidth / 2} y={topPad + chartHeight + 14}
                                    textAnchor="middle" fill="#9ca3af" fontSize="11">
                                    {item.year}
                                  </text>
                                </g>
                              );
                            })}
                          </svg>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Top infrações */}
                  {finalData.traffic_tickets.top_violations?.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-3">Top infrações</h5>
                      <div className="space-y-3">
                        {finalData.traffic_tickets.top_violations.slice(0, 5).map((v, i) => (
                          <div key={i} className="bg-gray-50 border rounded-lg p-3">
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-mono text-gray-500">{v.law_code}</p>
                                <p className="text-sm text-gray-800 line-clamp-2">{v.description}</p>
                              </div>
                              <div className="text-right ml-3 shrink-0">
                                <p className="text-lg font-bold text-gray-800">{v.percentage.toFixed(1)}%</p>
                                <p className="text-xs text-gray-500">{v.count.toLocaleString('pt-BR')} infrações</p>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-red-500 h-2 rounded-full"
                                style={{ width: `${Math.min(v.percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Infrações contra Pedestres e ciclistas */}
                  {finalData.traffic_tickets.vulnerable_violations?.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-3">Infrações contra Pedestres e ciclistas</h5>
                      <div className="space-y-2">
                        {finalData.traffic_tickets.vulnerable_violations.map((v, i) => (
                          <div key={i} className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <Bike size={18} className="text-orange-500 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-mono text-orange-700">{v.law_code}</p>
                              <p className="text-sm text-gray-800">{v.description}</p>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <p className="text-lg font-bold text-orange-700">{v.count.toLocaleString('pt-BR')}</p>
                              <p className="text-xs text-orange-500">infrações</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </>
              )}
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">Assistente de Documentos</h4>
              </div>

              <div className="bg-white border border-blue-200 rounded-lg p-5">
                <h5 className="font-medium text-sm text-blue-900 mb-3 flex items-center gap-2">
                  <FileText size={16} />
                  1. Qual documento deseja produzir?
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  {promptTemplates.documentTypes.map(dt => {
                    const IconComp = getDocumentTypeIcon(dt.icon);
                    const isSelected = docType === dt.id;
                    return (
                      <button
                        key={dt.id}
                        onClick={() => setDocType(docType === dt.id ? '' : dt.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-sm transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                            : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 text-gray-600'
                        }`}
                      >
                        <IconComp size={16} className={isSelected ? 'text-blue-600' : 'text-gray-400'} />
                        <span className="leading-tight">{dt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white border border-blue-200 rounded-lg p-5">
                <h5 className="font-medium text-sm text-blue-900 mb-3 flex items-center gap-2">
                  <Target size={16} />
                  2. Qual o objetivo?
                </h5>
                <textarea
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Descreva o problema ou o resultado esperado. Ex: Solicitar a implantação de travessia segura e redução da velocidade na rua."
                  rows={3}
                  className="w-full p-3 text-sm border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none mb-3"
                />
                <p className="text-xs text-gray-500 mb-2">Ou escolha um objetivo rápido:</p>
                <div className="flex flex-wrap gap-1.5">
                  {promptTemplates.quickObjectives.map(qo => {
                    const isSelected = quickObjective === qo.id;
                    return (
                      <button
                        key={qo.id}
                        onClick={() => {
                          setQuickObjective(quickObjective === qo.id ? '' : qo.id);
                          if (!objective) setObjective(qo.label);
                        }}
                        className={`text-xs px-2.5 py-1.5 rounded-full transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700'
                        }`}
                      >
                        {qo.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white border border-blue-200 rounded-lg p-5">
                <h5 className="font-medium text-sm text-blue-900 mb-3 flex items-center gap-2">
                  <BarChart3 size={16} />
                  3. Quais dados incluir?
                </h5>
                <div className="space-y-2">
                  {promptTemplates.dataCategories.map(cat => {
                    const isSelected = selectedDataCategories.has(cat.id);
                    const summary = generateDataSummary(cat.id);
                    const hasData = summary !== '' && !summary.startsWith('Nenhum');
                    return (
                      <button
                        key={cat.id}
                        onClick={() => toggleDataCategory(cat.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-200 bg-white'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                        }`}>
                          {isSelected && <Check size={12} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                            {cat.label}
                          </p>
                          {hasData && (
                            <p className={`text-xs mt-0.5 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`}>
                              {summary}
                            </p>
                          )}
                          {!hasData && (
                            <p className="text-xs text-gray-300 mt-0.5">Sem dados disponíveis neste ponto</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white border border-blue-200 rounded-lg p-5">
                <h5 className="font-medium text-sm text-blue-900 mb-3 flex items-center gap-2">
                  <Users size={16} />
                  4. Configuração do documento
                </h5>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Para quem é o documento?</label>
                    <select
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                    >
                      <option value="">Selecione o público-alvo</option>
                      {promptTemplates.audiences.map(a => (
                        <option key={a.id} value={a.id}>{a.label}</option>
                      ))}
                    </select>
                    {audience === 'custom' && (
                      <input
                        type="text"
                        value={customAudience}
                        onChange={(e) => setCustomAudience(e.target.value)}
                        placeholder="Nome do órgão ou destinatário específico"
                        className="w-full mt-2 p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                      />
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Tom do documento</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                    >
                      {promptTemplates.tones.map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Tamanho</label>
                    <div className="flex gap-2">
                      {promptTemplates.docSizes.map(s => (
                        <button
                          key={s.id}
                          onClick={() => setDocSize(s.id)}
                          className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${
                            docSize === s.id
                              ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                              : 'border-gray-200 text-gray-600 hover:border-blue-200'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-2 block">Opções adicionais</label>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeTables}
                          onChange={(e) => setIncludeTables(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Incluir tabelas
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeRecommendations}
                          onChange={(e) => setIncludeRecommendations(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Incluir recomendações
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeLegalBasis}
                          onChange={(e) => setIncludeLegalBasis(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Incluir fundamentação legal
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeLimitations}
                          onChange={(e) => setIncludeLimitations(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Informar limitações dos dados
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {(docType || objective || selectedDataCategories.size > 0) && (
                <div className="bg-white border border-green-200 rounded-lg p-5">
                  <h5 className="font-medium text-sm text-green-900 mb-3 flex items-center gap-2">
                    <Eye size={16} />
                    5. Instrução gerada
                    <span className="text-xs font-normal text-green-500 ml-auto">atualiza automaticamente</span>
                  </h5>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-80 overflow-y-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                      {buildPrompt() || (
                        <span className="text-gray-400">
                          Selecione um tipo de documento, defina um objetivo e escolha os dados para começar a montar a instrução.
                        </span>
                      )}
                    </pre>
                  </div>

                  {buildPrompt() && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button
                        onClick={handleCopyPrompt}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        {copiedPrompt ? <Check size={14} /> : <Copy size={14} />}
                        {copiedPrompt ? 'Copiado!' : 'Copiar instrução'}
                      </button>
                      <button
                        onClick={handleOpenChatGPT}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <ExternalLink size={14} />
                        Abrir no ChatGPT
                      </button>
                      <button
                        onClick={handleCopyJson}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {copiedJson ? <Check size={14} /> : <Copy size={14} />}
                        {copiedJson ? 'Copiado!' : 'Copiar dados JSON'}
                      </button>
                      <button
                        onClick={handleDownloadJson}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Download size={14} />
                        Baixar JSON
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 shrink-0">
          <p className="text-xs text-gray-500">
            Coordenadas: {finalData.location?.lat.toFixed(6)}, {finalData.location?.lng.toFixed(6)}
          </p>
        </div>
      </div>
    </div>
  );
}