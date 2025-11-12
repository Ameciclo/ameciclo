import { useEffect, useState } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export function CicloDadosLoader() {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gray-50">
      <div className="h-16 bg-white border-b flex items-center justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-300 h-4 w-4"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-2 bg-gray-300 rounded w-24"></div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-1">
        {/* Aba lateral esquerda - apenas no desktop */}
        <div className="hidden md:block w-80 bg-white border-r p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-300 rounded"></div>
              <div className="h-3 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
        
        {/* Área do mapa */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center relative">
          {/* Botão de maximizar aba - apenas no mobile */}
          <div className="md:hidden absolute top-1/2 left-2 -translate-y-1/2 z-10">
            <div className="w-12 h-12 bg-gray-400 rounded-full animate-pulse"></div>
          </div>
          
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando CicloDados...</p>
          </div>
        </div>
      </div>
    </div>
  );
}