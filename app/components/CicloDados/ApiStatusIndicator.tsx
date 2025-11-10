import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

interface ApiStatusIndicatorProps {
  errors: Array<{ type: string; message: string }>;
  onReload?: () => void;
}

const API_SERVICES = [
  { key: 'bicicletarios', name: 'Bicicletários', endpoint: 'bicycle-racks' },
  { key: 'bikepe', name: 'Estações Bike PE', endpoint: 'bike-pe-stations' },
  { key: 'infraestrutura', name: 'Infraestrutura Cicloviária', endpoint: 'infrastructure' },
  { key: 'pontos-contagem', name: 'Pontos de Contagem', endpoint: 'counting-points' },
  { key: 'execucao-cicloviaria', name: 'Plano Diretor Cicloviário', endpoint: 'execution-data' }
];

export function ApiStatusIndicator({ errors, onReload }: ApiStatusIndicatorProps) {
  const [isReloading, setIsReloading] = useState(false);
  
  const handleReload = async () => {
    if (onReload && !isReloading) {
      setIsReloading(true);
      try {
        await onReload();
      } finally {
        setTimeout(() => setIsReloading(false), 1000);
      }
    }
  };
  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const errorTypes = errors.map(e => e.type);
  const hasErrors = errors.length > 0;

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
          {hasErrors ? (
            <XCircle className="w-5 h-5 text-red-500" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
          <span className="text-sm font-medium text-gray-900">
            Status das APIs
          </span>
          {hasErrors && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              {errors.length} erro{errors.length > 1 ? 's' : ''}
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
              className="text-blue-500 hover:text-blue-600 disabled:text-gray-400 p-1 rounded transition-colors"
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
            const hasError = errorTypes.includes(service.key);
            return (
              <div key={service.key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{service.name}</span>
                <div className="flex items-center gap-1">
                  {hasError ? (
                    <>
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-red-600">Offline</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-600">Online</span>
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
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-xs py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
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