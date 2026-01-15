import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface ApiError {
  url: string;
  error: string;
  timestamp: string;
  page: string;
}

interface ApiStatusContextType {
  isApiDown: boolean;
  apiErrors: ApiError[];
  setApiDown: (status: boolean) => void;
  addApiError: (url: string, error: string, page: string) => void;
  clearErrors: () => void;
}

const ApiStatusContext = createContext<ApiStatusContextType | undefined>(undefined);

export function ApiStatusProvider({ 
  children, 
  initialApiDown = false 
}: { 
  children: ReactNode;
  initialApiDown?: boolean;
}) {
  const [isApiDown, setIsApiDown] = useState(false);
  const [apiErrors, setApiErrors] = useState<ApiError[]>([]);
  
  useEffect(() => {
    setIsApiDown(initialApiDown);
  }, [initialApiDown]);

  const setApiDown = (status: boolean) => {
    setIsApiDown(status);
  };

  const addApiError = (url: string, error: string, page: string) => {
    const newError: ApiError = {
      url,
      error,
      timestamp: new Date().toLocaleString('pt-BR'),
      page
    };
    setApiErrors(prev => {
      // Remove erros duplicados da mesma URL e página
      const filtered = prev.filter(e => !(e.url === url && e.page === page));
      return [newError, ...filtered.slice(0, 9)];
    });
    setIsApiDown(true);
  };

  const clearErrors = () => {
    setApiErrors([]);
    setIsApiDown(false);
  };

  return (
    <ApiStatusContext.Provider value={{ isApiDown, apiErrors, setApiDown, addApiError, clearErrors }}>
      {children}
    </ApiStatusContext.Provider>
  );
}

export function useApiStatus() {
  const context = useContext(ApiStatusContext);
  if (context === undefined) {
    throw new Error('useApiStatus deve ser usado dentro de um ApiStatusProvider');
  }
  return context;
}