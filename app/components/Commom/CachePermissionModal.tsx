import { useState, useEffect } from "react";

interface CachePermissionBarProps {
  onAllow: () => void;
  onDeny: () => void;
}

export default function CachePermissionBar({ onAllow, onDeny }: CachePermissionBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cachePermission = localStorage.getItem('cache-permission');
      if (!cachePermission) {
        setTimeout(() => {
          setIsVisible(true);
        }, 3000);
      }
    }
  }, []);

  const handleAllow = () => {
    localStorage.setItem('cache-permission', 'allowed');
    setIsVisible(false);
    onAllow();
  };

  const handleDeny = () => {
    localStorage.setItem('cache-permission', 'denied');
    setIsVisible(false);
    onDeny();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-1/2 md:transform md:-translate-x-1/2 md:w-[70%] md:max-w-4xl bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
      <div className="px-4 py-4 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                Melhorar sua experiência
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Utilizamos cache local para acelerar o carregamento das páginas e melhorar sua navegação. 
                Os dados são armazenados temporariamente apenas no seu navegador.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full md:flex-row md:gap-2 md:flex-shrink-0 md:w-auto">
            <button
              onClick={handleDeny}
              className="w-full md:w-auto px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Não permitir
            </button>
            <button
              onClick={handleAllow}
              className="w-full md:w-auto px-4 py-2 text-sm font-medium text-white bg-ameciclo hover:bg-green-600 rounded-md transition-colors shadow-sm"
            >
              Permitir cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}