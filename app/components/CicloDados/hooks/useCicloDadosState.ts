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

  // Valores padrão com todos os filtros ativos
  const defaultInfra = infraOptions.map(opt => opt.name);
  const defaultContagem = [...contagemOptions];
  const defaultPdc = pdcOptions.map(opt => opt.name);
  const defaultInfracao = [...infracaoOptions];
  const defaultSinistro = [...sinistroOptions];
  const defaultEstacionamento = [...estacionamentoOptions];
  const defaultPerfil = [...perfilOptions];

  const [selectedInfra, setSelectedInfra] = useState<string[]>(defaultInfra);
  const [selectedContagem, setSelectedContagem] = useState<string[]>(defaultContagem);
  const [selectedPdc, setSelectedPdc] = useState<string[]>(defaultPdc);
  const [selectedInfracao, setSelectedInfracao] = useState<string[]>(defaultInfracao);
  const [selectedSinistro, setSelectedSinistro] = useState<string[]>(defaultSinistro);
  const [selectedEstacionamento, setSelectedEstacionamento] = useState<string[]>(defaultEstacionamento);
  const [selectedPerfil, setSelectedPerfil] = useState<string[]>(defaultPerfil);
  const [selectedGenero, setSelectedGenero] = useState<string>("Todos");
  const [selectedAno, setSelectedAno] = useState<string>("Todos");
  const [selectedArea, setSelectedArea] = useState<string>("Todas");
  const [selectedIdade, setSelectedIdade] = useState<string>("Todas");
  const [selectedStreet, setSelectedStreet] = useState<string>("");
  
  // Load from localStorage after hydration - ONLY ONCE
  useEffect(() => {
    if (isClient) {
      setSelectedInfra(getStoredValue('selectedInfra', defaultInfra));
      setSelectedContagem(getStoredValue('selectedContagem', defaultContagem));
      setSelectedPdc(getStoredValue('selectedPdc', defaultPdc));
      setSelectedInfracao(getStoredValue('selectedInfracao', defaultInfracao));
      setSelectedSinistro(getStoredValue('selectedSinistro', defaultSinistro));
      setSelectedEstacionamento(getStoredValue('selectedEstacionamento', defaultEstacionamento));
      setSelectedPerfil(getStoredValue('selectedPerfil', defaultPerfil));
      setSelectedGenero(getStoredValue('selectedGenero', "Todos"));
      setSelectedAno(getStoredValue('selectedAno', "Todos"));
      setSelectedArea(getStoredValue('selectedArea', "Todas"));
      setSelectedIdade(getStoredValue('selectedIdade', "Todas"));
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
      localStorage.setItem('ciclodados_selectedAno', JSON.stringify(selectedAno));
    }
  }, [selectedAno, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('ciclodados_selectedArea', JSON.stringify(selectedArea));
    }
  }, [selectedArea, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('ciclodados_selectedIdade', JSON.stringify(selectedIdade));
    }
  }, [selectedIdade, isClient]);

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
    
    setSelectedPdc(prev => {
      const newSelection = prev.includes(optionName) 
        ? prev.filter(item => item !== optionName)
        : [...prev, optionName];
      
      return newSelection;
    });
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
    setSelectedAno("Todos");
    setSelectedArea("Todas");
    setSelectedIdade("Todas");
    
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
      localStorage.setItem('ciclodados_selectedAno', JSON.stringify("Todos"));
      localStorage.setItem('ciclodados_selectedArea', JSON.stringify("Todas"));
      localStorage.setItem('ciclodados_selectedIdade', JSON.stringify("Todas"));
    }
  };

  const selectAllOptions = () => {
    setSelectedInfra(defaultInfra);
    setSelectedContagem(defaultContagem);
    setSelectedPdc(defaultPdc);
    setSelectedInfracao(defaultInfracao);
    setSelectedSinistro(defaultSinistro);
    setSelectedEstacionamento(defaultEstacionamento);
    setSelectedPerfil(defaultPerfil);
    // Reseta filtros de perfil para "Todas"
    setSelectedGenero("Todas");
    setSelectedAno("Todos");
    setSelectedArea("Todas");
    setSelectedIdade("Todas");
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
    setSelectedGenero,
    selectedAno,
    setSelectedAno,
    selectedArea,
    setSelectedArea,
    selectedIdade,
    setSelectedIdade,
    selectedStreet,
    setSelectedStreet,
    viewMode,
    setViewMode,
    clearAllSelections,
    selectAllOptions
  };
}