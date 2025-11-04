import { useState, useEffect } from 'react';

const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

export function useCicloDadosState(
  infraOptions: Array<{ name: string; color: string; pattern: string }>,
  contagemOptions: string[],
  pdcOptions: Array<{ name: string; color: string; pattern: string }>,
  infracaoOptions: string[],
  sinistroOptions: string[],
  estacionamentoOptions: string[]
) {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  
  // Auto-minimize both sidebars on mobile after 1 second
  useEffect(() => {
    if (isMobile()) {
      const timer = setTimeout(() => {
        setLeftSidebarOpen(false);
        setRightSidebarOpen(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  const [chatOpen, setChatOpen] = useState(false);
  const getStoredValue = (key: string, defaultValue: any) => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const stored = localStorage.getItem(`ciclodados_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [selectedInfra, setSelectedInfra] = useState<string[]>(() => 
    getStoredValue('selectedInfra', infraOptions.map(opt => opt.name))
  );
  const [selectedContagem, setSelectedContagem] = useState<string[]>(() => 
    getStoredValue('selectedContagem', contagemOptions)
  );
  const [selectedPdc, setSelectedPdc] = useState<string[]>(() => 
    getStoredValue('selectedPdc', pdcOptions.map(opt => opt.name))
  );
  const [selectedInfracao, setSelectedInfracao] = useState<string[]>(() => 
    getStoredValue('selectedInfracao', infracaoOptions)
  );
  const [selectedSinistro, setSelectedSinistro] = useState<string[]>(() => 
    getStoredValue('selectedSinistro', sinistroOptions)
  );
  const [selectedEstacionamento, setSelectedEstacionamento] = useState<string[]>(() => 
    getStoredValue('selectedEstacionamento', estacionamentoOptions)
  );
  const [selectedGenero, setSelectedGenero] = useState<string>(() => 
    getStoredValue('selectedGenero', "Todas")
  );
  const [selectedRaca, setSelectedRaca] = useState<string>(() => 
    getStoredValue('selectedRaca', "Todas")
  );
  const [selectedSocio, setSelectedSocio] = useState<string>(() => 
    getStoredValue('selectedSocio', "Salários entre X")
  );
  const [selectedDias, setSelectedDias] = useState<string>(() => 
    getStoredValue('selectedDias', "1 dia")
  );
  const [viewMode, setViewMode] = useState<'map' | 'mural'>(() => 
    getStoredValue('viewMode', 'map')
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ciclodados_selectedInfra', JSON.stringify(selectedInfra));
    }
  }, [selectedInfra]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ciclodados_selectedContagem', JSON.stringify(selectedContagem));
    }
  }, [selectedContagem]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ciclodados_selectedPdc', JSON.stringify(selectedPdc));
    }
  }, [selectedPdc]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ciclodados_selectedInfracao', JSON.stringify(selectedInfracao));
    }
  }, [selectedInfracao]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ciclodados_selectedSinistro', JSON.stringify(selectedSinistro));
    }
  }, [selectedSinistro]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ciclodados_selectedEstacionamento', JSON.stringify(selectedEstacionamento));
    }
  }, [selectedEstacionamento]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ciclodados_selectedGenero', JSON.stringify(selectedGenero));
    }
  }, [selectedGenero]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ciclodados_selectedRaca', JSON.stringify(selectedRaca));
    }
  }, [selectedRaca]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ciclodados_selectedSocio', JSON.stringify(selectedSocio));
    }
  }, [selectedSocio]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ciclodados_selectedDias', JSON.stringify(selectedDias));
    }
  }, [selectedDias]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ciclodados_viewMode', JSON.stringify(viewMode));
    }
  }, [viewMode]);

  const toggleInfraOption = (optionName: string) => {
    setSelectedInfra(prev => 
      prev.includes(optionName) 
        ? prev.filter(item => item !== optionName)
        : [...prev, optionName]
    );
  };

  const toggleContagemOption = (optionName: string) => {
    setSelectedContagem(prev => 
      prev.includes(optionName) 
        ? prev.filter(item => item !== optionName)
        : [...prev, optionName]
    );
  };

  const togglePdcOption = (optionName: string) => {
    setSelectedPdc(prev => 
      prev.includes(optionName) 
        ? prev.filter(item => item !== optionName)
        : [...prev, optionName]
    );
  };

  const toggleInfracaoOption = (optionName: string) => {
    setSelectedInfracao(prev => 
      prev.includes(optionName) 
        ? prev.filter(item => item !== optionName)
        : [...prev, optionName]
    );
  };

  const toggleSinistroOption = (optionName: string) => {
    setSelectedSinistro(prev => 
      prev.includes(optionName) 
        ? prev.filter(item => item !== optionName)
        : [...prev, optionName]
    );
  };

  const toggleEstacionamentoOption = (optionName: string) => {
    setSelectedEstacionamento(prev => 
      prev.includes(optionName) 
        ? prev.filter(item => item !== optionName)
        : [...prev, optionName]
    );
  };

  return {
    leftSidebarOpen,
    setLeftSidebarOpen,
    rightSidebarOpen,
    setRightSidebarOpen,
    chatOpen,
    setChatOpen,
    selectedInfra,
    toggleInfraOption,
    selectedContagem,
    toggleContagemOption,
    selectedPdc,
    togglePdcOption,
    selectedInfracao,
    toggleInfracaoOption,
    selectedSinistro,
    toggleSinistroOption,
    selectedEstacionamento,
    toggleEstacionamentoOption,
    selectedGenero,
    setSelectedGenero,
    selectedRaca,
    setSelectedRaca,
    selectedSocio,
    setSelectedSocio,
    selectedDias,
    setSelectedDias,
    viewMode,
    setViewMode
  };
}