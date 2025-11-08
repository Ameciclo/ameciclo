import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface DataErrorAlertProps {
  errors: Array<{ type: string; message: string }>;
}

export function DataErrorAlert({ errors }: DataErrorAlertProps) {
  const [dismissed, setDismissed] = useState<string[]>([]);

  if (errors.length === 0) return null;

  const visibleErrors = errors.filter(error => !dismissed.includes(error.type));

  if (visibleErrors.length === 0) return null;

  const dismissError = (type: string) => {
    setDismissed(prev => [...prev, type]);
  };

  return (
    <div className="absolute top-4 right-4 z-[70] max-w-sm space-y-2">
      {visibleErrors.map((error) => (
        <div key={error.type} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-lg">
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
              </p>
            </div>
            <button
              onClick={() => dismissError(error.type)}
              className="text-yellow-600 hover:text-yellow-800 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}