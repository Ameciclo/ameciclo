import { AlertTriangle, X, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DataErrorAlertProps {
  errors: Array<{ type: string; message: string }>;
  onShowMore?: () => void;
}

export function DataErrorAlert({ errors, onShowMore }: DataErrorAlertProps) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [autoHiding, setAutoHiding] = useState<string[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});

  if (errors.length === 0) return null;

  const visibleErrors = errors.filter(error => !dismissed.includes(error.type) && !autoHiding.includes(error.type));

  if (visibleErrors.length === 0) return null;

  const dismissError = (type: string) => {
    setDismissed(prev => [...prev, type]);
  };

  // Auto-hide timer for each error
  useEffect(() => {
    visibleErrors.forEach(error => {
      if (!progress[error.type]) {
        setProgress(prev => ({ ...prev, [error.type]: 0 }));
        
        const interval = setInterval(() => {
          setProgress(prev => {
            const currentProgress = prev[error.type] || 0;
            const newProgress = currentProgress + 2; // 2% every 100ms = 5 seconds total
            
            if (newProgress >= 100) {
              clearInterval(interval);
              setTimeout(() => {
                setAutoHiding(hiding => [...hiding, error.type]);
                setTimeout(() => {
                  setDismissed(dismissed => [...dismissed, error.type]);
                }, 300); // Wait for fade animation
              }, 100);
              return { ...prev, [error.type]: 100 };
            }
            
            return { ...prev, [error.type]: newProgress };
          });
        }, 100);
        
        return () => clearInterval(interval);
      }
    });
  }, [visibleErrors.length]);

  return (
    <div className="absolute top-4 right-4 z-[70] max-w-sm space-y-2">
      {visibleErrors.map((error) => {
        const currentProgress = progress[error.type] || 0;
        const isHiding = autoHiding.includes(error.type);
        
        return (
          <div 
            key={error.type} 
            className={`bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg transition-all duration-300 ${
              isHiding ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
            }`}
          >
            {/* Progress bar */}
            <div className="h-1 bg-yellow-200 rounded-t-lg overflow-hidden">
              <div 
                className="h-full bg-yellow-500 transition-all duration-100 ease-linear"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
            
            <div className="p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-yellow-800">
                    Dados temporariamente indisponíveis
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    {error.type === 'bicicletarios' && 'Bicicletários não serão exibidos no mapa'}
                    {error.type === 'bikepe' && 'Estações Bike PE não serão exibidas no mapa'}
                    {error.type === 'infraestrutura' && 'Infraestrutura cicloviária não será exibida no mapa'}
                    {error.type === 'pontos-contagem' && 'Pontos de contagem não serão exibidos no mapa'}
                    {error.type === 'execucao-cicloviaria' && 'Dados do Plano Diretor Cicloviário não serão exibidos no mapa'}
                    {error.type === 'sinistros' && 'Dados de sinistros não serão exibidos no mapa'}
                  </p>
                  
                  {/* Buttons */}
                  <div className="flex items-center gap-2 mt-2">
                    {onShowMore && (
                      <button
                        onClick={onShowMore}
                        className="flex items-center gap-1 text-xs text-yellow-700 hover:text-yellow-900 font-medium"
                      >
                        <Info className="w-3 h-3" />
                        Saber mais
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => dismissError(error.type)}
                  className="text-yellow-600 hover:text-yellow-800 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}