import { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect, useRef } from 'react';
import { useRouterState } from '@tanstack/react-router';

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
  const location = useRouterState({ select: (s) => s.location });
  const prevPathRef = useRef(location.pathname);
  
  useEffect(() => {
    setIsApiDown(initialApiDown);
  }, [initialApiDown]);

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      setApiErrors([]);
      setIsApiDown(false);
      prevPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  const setApiDown = useCallback((status: boolean) => {
    setIsApiDown(status);
  }, []);

  const addApiError = useCallback((url: string, error: string, page: string) => {
    setApiErrors(prev => {
      const exists = prev.some(e => e.url === url && e.page === page && e.error === error);
      if (exists) return prev;
      const newError: ApiError = {
        url,
        error,
        timestamp: new Date().toLocaleString('pt-BR'),
        page,
      };
      return [newError, ...prev.slice(0, 9)];
    });
    setIsApiDown(true);
  }, []);

  const clearErrors = useCallback(() => {
    setApiErrors([]);
    setIsApiDown(false);
  }, []);

  const value = useMemo(() => ({ isApiDown, apiErrors, setApiDown, addApiError, clearErrors }), [isApiDown, apiErrors, setApiDown, addApiError, clearErrors]);

  return (
    <ApiStatusContext.Provider value={value}>
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