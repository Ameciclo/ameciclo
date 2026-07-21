import { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, RefreshCw, Loader2 } from 'lucide-react';
import { CICLODADOS_HEALTH_URLS } from '~/servers';

interface ApiStatusIndicatorProps {
  errors: Array<{ type: string; message: string }>;
  onReload?: () => void;
}

const API_SERVICES = [
  { key: 'bicicletarios', name: 'Bicicletários', endpoint: 'bicycle-racks', healthUrl: CICLODADOS_HEALTH_URLS.bicicletarios },
  { key: 'bikepe', name: 'Estações Bike PE', endpoint: 'bike-pe-stations', healthUrl: CICLODADOS_HEALTH_URLS.bikepe },
  { key: 'infraestrutura', name: 'Infraestrutura Cicloviária', endpoint: 'infrastructure', healthUrl: CICLODADOS_HEALTH_URLS.infraestrutura },
  { key: 'pontos-contagem', name: 'Pontos de Contagem', endpoint: 'counting-points', healthUrl: CICLODADOS_HEALTH_URLS['pontos-contagem'] },
  { key: 'execucao-cicloviaria', name: 'Plano Diretor Cicloviário', endpoint: 'execution-data', healthUrl: CICLODADOS_HEALTH_URLS['execucao-cicloviaria'] },
  { key: 'sinistros', name: 'Chamados de Emergência', endpoint: 'samu/v2/unsafe-streets', healthUrl: CICLODADOS_HEALTH_URLS.sinistros },
  { key: 'infracoes', name: 'Infrações de Trânsito', endpoint: 'traffic-violations/v1/streets', healthUrl: CICLODADOS_HEALTH_URLS.infracoes },
  { key: 'perfil', name: 'Perfil de Ciclistas', endpoint: 'cyclist-profiles/v1', healthUrl: CICLODADOS_HEALTH_URLS.perfil },
];

type HealthStatus = 'checking' | 'online' | 'offline';

export function ApiStatusIndicator({ errors, onReload }: ApiStatusIndicatorProps) {
  const [isReloading, setIsReloading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [healthStatus, setHealthStatus] = useState<Record<string, HealthStatus>>({});
  const [isChecking, setIsChecking] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const checkHealth = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const seen = new Set<string>();
    const uniqueServices = API_SERVICES.filter((s) => {
      if (seen.has(s.healthUrl)) return false;
      seen.add(s.healthUrl);
      return true;
    });

    setIsChecking(true);
    setHealthStatus((prev) => {
      const next = { ...prev };
      for (const s of API_SERVICES) {
        next[s.key] = 'checking';
      }
      return next;
    });

    const results = await Promise.allSettled(
      uniqueServices.map(async (service) => {
        try {
          const resp = await fetch(service.healthUrl, {
            signal: controller.signal,
            method: 'GET',
          });
          return { key: service.key, healthUrl: service.healthUrl, ok: resp.ok };
        } catch {
          return { key: service.key, healthUrl: service.healthUrl, ok: false };
        }
      })
    );

    if (controller.signal.aborted) return;

    const healthByUrl = new Map<string, boolean>();
    for (const result of results) {
      if (result.status === 'fulfilled') {
        healthByUrl.set(result.value.healthUrl, result.value.ok);
      } else if (result.status === 'rejected') {
        //
      }
    }

    setHealthStatus((prev) => {
      const next = { ...prev };
      for (const service of API_SERVICES) {
        const ok = healthByUrl.get(service.healthUrl);
        next[service.key] = ok === true ? 'online' : 'offline';
      }
      return next;
    });
    setIsChecking(false);
  }, []);

  useEffect(() => {
    checkHealth();
    return () => {
      abortRef.current?.abort();
    };
  }, [checkHealth]);

  const handleReload = async () => {
    if (onReload && !isReloading) {
      setIsReloading(true);
      try {
        await onReload();
      } finally {
        setTimeout(() => setIsReloading(false), 1000);
      }
    }
    checkHealth();
  };

  const errorTypes = errors.map((e) => e.type);

  const getServiceStatus = (key: string): HealthStatus => {
    const health = healthStatus[key];
    if (!health || health === 'checking') return 'checking';
    if (health === 'online' && errorTypes.includes(key)) return 'offline';
    return health;
  };

  const offlineServices = API_SERVICES.filter((s) => getServiceStatus(s.key) === 'offline');
  const hasErrors = offlineServices.length > 0;
  const hasOnlineServices = API_SERVICES.some((s) => getServiceStatus(s.key) === 'online');

  if (dismissed) return null;

  return (
    <div
      className="absolute bottom-4 right-24 z-40 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[280px]"
      data-testid="api-status-indicator"
    >
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {isChecking && !hasOnlineServices ? (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          ) : hasErrors ? (
            <XCircle className="w-5 h-5 text-red-500" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
          <span className="text-sm font-medium text-gray-900">
            Status dos Dados
          </span>
          {hasErrors && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              {offlineServices.length} erro{offlineServices.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onReload && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReload();
              }}
              disabled={isReloading}
              className="text-blue-500 hover:text-blue-600 disabled:text-gray-400 p-1 rounded-sm transition-colors"
              title="Recarregar dados"
            >
              <RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDismissed(true);
            }}
            className="text-gray-400 hover:text-gray-600 text-xs px-1"
          >
            ✕
          </button>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 p-3 space-y-2">
          {API_SERVICES.map((service) => {
            const status = getServiceStatus(service.key);
            return (
              <div key={service.key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{service.name}</span>
                <div className="flex items-center gap-1">
                  {status === 'checking' ? (
                    <>
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                      <span className="text-xs text-blue-600">Verificando...</span>
                    </>
                  ) : status === 'online' ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-600">Online</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-red-600">Offline</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {hasErrors && (
            <div className="mt-3 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">
                Alguns dados podem não aparecer no mapa devido a problemas de conectividade.
              </p>
              {onReload && (
                <button
                  onClick={handleReload}
                  disabled={isReloading}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-xs py-2 px-3 rounded-sm transition-colors flex items-center justify-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isReloading ? 'animate-spin' : ''}`} />
                  {isReloading ? 'Recarregando...' : 'Tentar novamente'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
