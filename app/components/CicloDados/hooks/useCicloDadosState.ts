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
  estacionamentoOptions: string[],
  perfilOptions: string[]
) {
  const [isClient, setIsClient] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  
  // Initialize sidebar state based on screen size
  useEffect(() => {
    if (isClient) {
      const shouldOpenSidebar = !isMobile();
      setLeftSidebarOpen(shouldOpenSidebar);
    }
  }, [isClient]);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'mural'>('map');
  
  // Initialize client-side
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Keep sidebar open when switching to mural mode
  useEffect(() => {
    if (viewMode === 'mural') {
      setLeftSidebarOpen(true);
    }
  }, [viewMode]);
  
  const getStoredValue = (key: string, defaultValue: any) => {
    if (!isClient) return defaultValue;
    try {
      const stored = localStorage.getItem(`ciclodados_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [selectedInfra, setSelectedInfra] = useState<string[]>([]);
  const [selectedContagem, setSelectedContagem] = useState<string[]>(["Contagem da Ameciclo"]);
  const [selectedPdc, setSelectedPdc] = useState<string[]>(pdcOptions.map(opt => opt.name));
  const [selectedInfracao, setSelectedInfracao] = useState<string[]>([]);
  const [selectedSinistro, setSelectedSinistro] = useState<string[]>([]);
  const [selectedEstacionamento, setSelectedEstacionamento] = useState<string[]>(estacionamentoOptions);
  const [selectedPerfil, setSelectedPerfil] = useState<string[]>([]);
  const [selectedGenero, setSelectedGenero] = useState<string>("Todas");
  const [selectedRaca, setSelectedRaca] = useState<string>("Todas");
  const [selectedSocio, setSelectedSocio] = useState<string>("Todas");
  const [selectedDias, setSelectedDias] = useState<string>("Todas");
  const [selectedStreet, setSelectedStreet] = useState<string>("");
  
  // Load from localStorage after hydration - ONLY ONCE
  useEffect(() => {
    if (isClient) {
      setSelectedInfra(getStoredValue('selectedInfra', []));
      setSelectedContagem(getStoredValue('selectedContagem', ["Contagem da Ameciclo"]));
      setSelectedPdc(getStoredValue('selectedPdc', pdcOptions.map(opt => opt.name)));
      setSelectedInfracao(getStoredValue('selectedInfracao', []));
      setSelectedSinistro(getStoredValue('selectedSinistro', []));
      setSelectedEstacionamento(getStoredValue('selectedEstacionamento', estacionamentoOptions));
      setSelectedPerfil(getStoredValue('selectedPerfil', []));
      setSelectedGenero(getStoredValue('selectedGenero', "Todas"));
      setSelectedRaca(getStoredValue('selectedRaca', "Todas"));
      setSelectedSocio(getStoredValue('selectedSocio', "Todas"));
      setSelectedDias(getStoredValue('selectedDias', "Todas"));
      setSelectedStreet(getStoredValue('selectedStreet', ""));
      setViewMode(getStoredValue('viewMode', 'map'));
    }
  }, [isClient]); // Remove dependencies that cause re-loading

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('ciclodados_selectedInfra', JSON.stringify(selectedInfra));
    }
  }, [selectedInfra, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('ciclodados_selectedContagem', JSON.stringify(selectedContagem));
    }
  }, [selectedContagem, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('ciclodados_selectedPdc', JSON.stringify(selectedPdc));
    }
  }, [selectedPdc, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('ciclodados_selectedInfracao', JSON.stringify(selectedInfracao));
    }
  }, [selectedInfracao, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('ciclodados_selectedSinistro', JSON.stringify(selectedSinistro));
    }
  }, [selectedSinistro, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('ciclodados_selectedEstacionamento', JSON.stringify(selectedEstacionamento));
    }
  }, [selectedEstacionamento, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('ciclodados_selectedPerfil', JSON.stringify(selectedPerfil));
    }
  }, [selectedPerfil, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('ciclodados_selectedGenero', JSON.stringify(selectedGenero));
    }
  }, [selectedGenero, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('ciclodados_selectedRaca', JSON.stringify(selectedRaca));
    }
  }, [selectedRaca, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('ciclodados_selectedSocio', JSON.stringify(selectedSocio));
    }
  }, [selectedSocio, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('ciclodados_selectedDias', JSON.stringify(selectedDias));
    }
  }, [selectedDias, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('ciclodados_selectedStreet', JSON.stringify(selectedStreet));
    }
  }, [selectedStreet, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('ciclodados_viewMode', JSON.stringify(viewMode));
    }
  }, [viewMode, isClient]);

  const toggleInfraOption = (optionName: string) => {
    setSelectedInfra(prev => 
      prev.includes(optionName) 
        ? prev.filter(item => item !== optionName)
        : [...prev, optionName]
    );
  };

  const toggleAllInfraOptions = (options: string[], selectAll: boolean) => {
    setSelectedInfra(selectAll ? options : []);
  };

  const toggleContagemOption = (optionName: string) => {
    setSelectedContagem(prev => 
      prev.includes(optionName) 
        ? prev.filter(item => item !== optionName)
        : [...prev, optionName]
    );
  };

  const toggleAllContagemOptions = (options: string[], selectAll: boolean) => {
    setSelectedContagem(selectAll ? options : []);
  };

  const togglePdcOption = (optionName: string) => {
    setSelectedPdc(prev => 
      prev.includes(optionName) 
        ? prev.filter(item => item !== optionName)
        : [...prev, optionName]
    );
  };

  const toggleAllPdcOptions = (options: string[], selectAll: boolean) => {
    setSelectedPdc(selectAll ? options : []);
  };

  const toggleInfracaoOption = (optionName: string) => {
    setSelectedInfracao(prev => 
      prev.includes(optionName) 
        ? prev.filter(item => item !== optionName)
        : [...prev, optionName]
    );
  };

  const toggleAllInfracaoOptions = (options: string[], selectAll: boolean) => {
    setSelectedInfracao(selectAll ? options : []);
  };

  const toggleSinistroOption = (optionName: string) => {
    setSelectedSinistro(prev => 
      prev.includes(optionName) 
        ? prev.filter(item => item !== optionName)
        : [...prev, optionName]
    );
  };

  const toggleAllSinistroOptions = (options: string[], selectAll: boolean) => {
    setSelectedSinistro(selectAll ? options : []);
  };

  const toggleEstacionamentoOption = (optionName: string) => {
    setSelectedEstacionamento(prev => 
      prev.includes(optionName) 
        ? prev.filter(item => item !== optionName)
        : [...prev, optionName]
    );
  };

  const toggleAllEstacionamentoOptions = (options: string[], selectAll: boolean) => {
    setSelectedEstacionamento(selectAll ? options : []);
  };

  const togglePerfilOption = (optionName: string) => {
    setSelectedPerfil(prev => 
      prev.includes(optionName) 
        ? prev.filter(item => item !== optionName)
        : [...prev, optionName]
    );
  };

  const toggleAllPerfilOptions = (options: string[], selectAll: boolean) => {
    setSelectedPerfil(selectAll ? options : []);
  };

  const clearAllSelections = () => {
    setSelectedInfra([]);
    setSelectedContagem([]);
    setSelectedPdc([]);
    setSelectedInfracao([]);
    setSelectedSinistro([]);
    setSelectedEstacionamento([]);
    setSelectedPerfil([]);
    // Reseta filtros de perfil para "Todas"
    setSelectedGenero("Todas");
    setSelectedRaca("Todas");
    setSelectedSocio("Todas");
    setSelectedDias("Todas");
    
    // Force localStorage update immediately
    if (isClient) {
      localStorage.setItem('ciclodados_selectedInfra', JSON.stringify([]));
      localStorage.setItem('ciclodados_selectedContagem', JSON.stringify([]));
      localStorage.setItem('ciclodados_selectedPdc', JSON.stringify([]));
      localStorage.setItem('ciclodados_selectedInfracao', JSON.stringify([]));
      localStorage.setItem('ciclodados_selectedSinistro', JSON.stringify([]));
      localStorage.setItem('ciclodados_selectedEstacionamento', JSON.stringify([]));
      localStorage.setItem('ciclodados_selectedPerfil', JSON.stringify([]));
      localStorage.setItem('ciclodados_selectedGenero', JSON.stringify("Todas"));
      localStorage.setItem('ciclodados_selectedRaca', JSON.stringify("Todas"));
      localStorage.setItem('ciclodados_selectedSocio', JSON.stringify("Todas"));
      localStorage.setItem('ciclodados_selectedDias', JSON.stringify("Todas"));
    }
  };

  const selectAllOptions = () => {
    setSelectedInfra(infraOptions.map(opt => opt.name));
    setSelectedContagem([...contagemOptions]);
    setSelectedPdc(pdcOptions.map(opt => opt.name));
    setSelectedInfracao([...infracaoOptions]);
    setSelectedSinistro([...sinistroOptions]);
    setSelectedEstacionamento([...estacionamentoOptions]);
    setSelectedPerfil([...perfilOptions]);
    // Reseta filtros de perfil para "Todas"
    setSelectedGenero("Todas");
    setSelectedRaca("Todas");
    setSelectedSocio("Todas");
    setSelectedDias("Todas");
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
    toggleAllInfraOptions,
    selectedContagem,
    toggleContagemOption,
    toggleAllContagemOptions,
    selectedPdc,
    togglePdcOption,
    toggleAllPdcOptions,
    selectedInfracao,
    toggleInfracaoOption,
    toggleAllInfracaoOptions,
    selectedSinistro,
    toggleSinistroOption,
    toggleAllSinistroOptions,
    selectedEstacionamento,
    toggleEstacionamentoOption,
    toggleAllEstacionamentoOptions,
    selectedPerfil,
    togglePerfilOption,
    toggleAllPerfilOptions,
    selectedGenero,
    setSelectedGenero: (value: string) => {
      setSelectedGenero(value);
      // Quando seleciona gênero específico, reseta outros filtros para "Todas"
      if (value !== "Todas") {
        setSelectedRaca("Todas");
        setSelectedSocio("Todas");
        setSelectedDias("Todas");
      }
    },
    selectedRaca,
    setSelectedRaca: (value: string) => {
      setSelectedRaca(value);
      // Quando seleciona raça específica, reseta outros filtros para "Todas"
      if (value !== "Todas") {
        setSelectedGenero("Todas");
        setSelectedSocio("Todas");
        setSelectedDias("Todas");
      }
    },
    selectedSocio,
    setSelectedSocio: (value: string) => {
      setSelectedSocio(value);
      // Quando seleciona renda específica, reseta outros filtros para "Todas"
      if (value !== "Todas") {
        setSelectedGenero("Todas");
        setSelectedRaca("Todas");
        setSelectedDias("Todas");
      }
    },
    selectedDias,
    setSelectedDias: (value: string) => {
      setSelectedDias(value);
      // Quando seleciona dias específicos, reseta outros filtros para "Todas"
      if (value !== "Todas") {
        setSelectedGenero("Todas");
        setSelectedRaca("Todas");
        setSelectedSocio("Todas");
      }
    },
    selectedStreet,
    setSelectedStreet,
    viewMode,
    setViewMode,
    clearAllSelections,
    selectAllOptions
  };
}