import React from 'react';

interface DataFallbackProps {
  message?: string;
  retry?: () => void;
  children?: React.ReactNode;
}

/**
 * Componente para exibir quando os dados não puderem ser carregados
 */
export default function DataFallback({ 
  message = "Não foi possível carregar os dados no momento.", 
  retry, 
  children 
}: DataFallbackProps) {
  return (
    <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 my-4 text-center">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-12 w-12 mx-auto text-amber-500 mb-4" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
        />
      </svg>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Dados temporariamente indisponíveis
      </h3>
      
      <p className="text-gray-600 mb-4">{message}</p>
      
      {children}
      
      {retry && (
        <button 
          onClick={retry}
          className="mt-2 px-4 py-2 bg-ameciclo text-white rounded hover:bg-opacity-90 transition-colors"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}