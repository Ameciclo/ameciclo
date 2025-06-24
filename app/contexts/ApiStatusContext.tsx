import { createContext, useContext, useState, ReactNode } from 'react';

interface ApiStatusContextType {
  isApiDown: boolean;
  setApiDown: (status: boolean) => void;
}

const ApiStatusContext = createContext<ApiStatusContextType | undefined>(undefined);

export function ApiStatusProvider({ 
  children, 
  initialApiDown = false 
}: { 
  children: ReactNode;
  initialApiDown?: boolean;
}) {
  const [isApiDown, setIsApiDown] = useState(initialApiDown);

  const setApiDown = (status: boolean) => {
    setIsApiDown(status);
  };

  return (
    <ApiStatusContext.Provider value={{ isApiDown, setApiDown }}>
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