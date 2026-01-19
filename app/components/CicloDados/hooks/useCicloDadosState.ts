import { useState, useEffect, useRef } from 'react';

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
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasRestoredFromStorage = useRef(false);
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
    
    // Priority 1: URL params
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const urlValue = url.searchParams.get(key);
      if (urlValue) {
        try {
          // Handle comma-separated values
          if (urlValue.includes(',')) return urlValue.split(',');
          return JSON.parse(urlValue);
        } catch {
          return urlValue;
        }
      }
    }
    
    // Priority 2: localStorage
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
  const [selectedGenero, setSelectedGenero] = useState<string[]>(["2024", "2021", "2018", "2015"]);
  const [selectedAno, setSelectedAno] = useState<string[]>(["2024", "2021", "2018", "2015"]);
  const [selectedArea, setSelectedArea] = useState<string>("Todas");
  const [selectedIdade, setSelectedIdade] = useState<string>("Todas");
  const [selectedStreet, setSelectedStreet] = useState<string>("");
  
  // Load from localStorage after hydration - ONLY ONCE
  useEffect(() => {
    if (isClient) {
      const urlParams = new URLSearchParams(window.location.search);
      
      // Read infra from URL flags - agora lê os OFF
      const infraOffFromUrl = infraOptions
        .filter(opt => urlParams.get(`infra_${opt.name.toLowerCase().replace(/\s+/g, '_')}`) === 'off')
        .map(opt => opt.name);
      const allInfra = infraOptions.map(opt => opt.name);
      const infraOn = allInfra.filter(name => !infraOffFromUrl.includes(name));
      setSelectedInfra(infraOffFromUrl.length > 0 ? infraOn : getStoredValue('selectedInfra', defaultInfra));
      
      // Read contagem from URL flags - agora lê os OFF
      const contagemOffFromUrl = contagemOptions
        .filter(opt => urlParams.get(`contagem_${opt.toLowerCase().replace(/\s+/g, '_')}`) === 'off');
      const contagemOn = contagemOptions.filter(name => !contagemOffFromUrl.includes(name));
      setSelectedContagem(contagemOffFromUrl.length > 0 ? contagemOn : getStoredValue('selectedContagem', defaultContagem));
      
      // Read pdc from URL flags - agora lê os OFF
      const pdcOffFromUrl = pdcOptions
        .filter(opt => urlParams.get(`pdc_${opt.name.toLowerCase().replace(/\s+/g, '_')}`) === 'off')
        .map(opt => opt.name);
      const allPdc = pdcOptions.map(opt => opt.name);
      const pdcOn = allPdc.filter(name => !pdcOffFromUrl.includes(name));
      setSelectedPdc(pdcOffFromUrl.length > 0 ? pdcOn : getStoredValue('selectedPdc', defaultPdc));
      
      setSelectedInfracao(getStoredValue('selectedInfracao', defaultInfracao));
      setSelectedSinistro(getStoredValue('selectedSinistro', defaultSinistro));
      
      // Read estacionamento from URL flags - agora lê os OFF
      const estacOffFromUrl = estacionamentoOptions
        .filter(opt => urlParams.get(`estac_${opt.toLowerCase().replace(/\s+/g, '_')}`) === 'off');
      const estacOn = estacionamentoOptions.filter(name => !estacOffFromUrl.includes(name));
      setSelectedEstacionamento(estacOffFromUrl.length > 0 ? estacOn : getStoredValue('selectedEstacionamento', defaultEstacionamento));
      
      // Read perfil from URL flags - agora lê os OFF
      const perfilOff = urlParams.get('perfil') === 'off';
      const storedPerfil = getStoredValue('selectedPerfil', null);
      setSelectedPerfil(perfilOff ? [] : (storedPerfil !== null ? storedPerfil : defaultPerfil));
      setSelectedGenero(getStoredValue('selectedGenero', ["2024", "2021", "2018", "2015"]));
      
      // Read anos from URL flags - agora lê os OFF
      const anosOffFromUrl = ['2024', '2021', '2018', '2015'].filter(ano => urlParams.get(`perfil_ano_${ano}`) === 'off');
      const anosOn = ['2024', '2021', '2018', '2015'].filter(ano => !anosOffFromUrl.includes(ano));
      setSelectedAno(anosOffFromUrl.length > 0 ? anosOn : getStoredValue('selectedAno', ["2024", "2021", "2018", "2015"]));
      
      setSelectedArea(getStoredValue('selectedArea', "Todas"));
      setSelectedIdade(getStoredValue('selectedIdade', "Todas"));
      setSelectedStreet(getStoredValue('selectedStreet', ""));
      setViewMode(getStoredValue('viewMode', 'map'));
      
      // If URL is empty, restore from localStorage and update URL
      if (!urlParams.toString()) {
        setTimeout(() => {
          // Trigger updates to populate URL from localStorage
          setSelectedInfra(prev => [...prev]);
          setSelectedContagem(prev => [...prev]);
          setSelectedPdc(prev => [...prev]);
          setSelectedEstacionamento(prev => [...prev]);
          setSelectedPerfil(prev => [...prev]);
          setSelectedAno(prev => [...prev]);
        }, 200);
      }
    }
  }, [isClient]);

  const updateUrlWithPriority = (updateFn: (url: URL) => void) => {
    if (typeof window === 'undefined') return;
    
    if (urlUpdateTimeoutRef.current) {
      clearTimeout(urlUpdateTimeoutRef.current);
    }
    
    urlUpdateTimeoutRef.current = setTimeout(() => {
      const url = new URL(window.location.href);
      const lat = url.searchParams.get('lat');
      const lon = url.searchParams.get('lon');
      const zoom = url.searchParams.get('zoom');
      
      updateFn(url);
      
      if (lat && lon && zoom) {
        const newUrl = new URL(url.origin + url.pathname);
        newUrl.searchParams.set('lat', lat);
        newUrl.searchParams.set('lon', lon);
        newUrl.searchParams.set('zoom', zoom);
        url.searchParams.forEach((value, key) => {
          if (key !== 'lat' && key !== 'lon' && key !== 'zoom') {
            newUrl.searchParams.set(key, value);
          }
        });
        window.history.replaceState({}, '', newUrl.toString());
      } else {
        window.history.replaceState({}, '', url.toString());
      }
    }, 100);
  };

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('ciclodados_selectedInfra', JSON.stringify(selectedInfra));
      
      updateUrlWithPriority((url) => {
        infraOptions.forEach(opt => {
          const key = `infra_${opt.name.toLowerCase().replace(/\s+/g, '_')}`;
          if (!selectedInfra.includes(opt.name)) {
            url.searchParams.set(key, 'off');
          } else {
            url.searchParams.delete(key);
          }
        });
      });
    }
  }, [selectedInfra, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('ciclodados_selectedContagem', JSON.stringify(selectedContagem));
      
      updateUrlWithPriority((url) => {
        contagemOptions.forEach(opt => {
          const key = `contagem_${opt.toLowerCase().replace(/\s+/g, '_')}`;
          if (!selectedContagem.includes(opt)) {
            url.searchParams.set(key, 'off');
          } else {
            url.searchParams.delete(key);
          }
        });
      });
    }
  }, [selectedContagem, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('ciclodados_selectedPdc', JSON.stringify(selectedPdc));
      
      updateUrlWithPriority((url) => {
        pdcOptions.forEach(opt => {
          const key = `pdc_${opt.name.toLowerCase().replace(/\s+/g, '_')}`;
          if (!selectedPdc.includes(opt.name)) {
            url.searchParams.set(key, 'off');
          } else {
            url.searchParams.delete(key);
          }
        });
      });
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
      
      updateUrlWithPriority((url) => {
        estacionamentoOptions.forEach(opt => {
          const key = `estac_${opt.toLowerCase().replace(/\s+/g, '_')}`;
          if (!selectedEstacionamento.includes(opt)) {
            url.searchParams.set(key, 'off');
          } else {
            url.searchParams.delete(key);
          }
        });
      });
    }
  }, [selectedEstacionamento, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('ciclodados_selectedPerfil', JSON.stringify(selectedPerfil));
      
      updateUrlWithPriority((url) => {
        if (selectedPerfil.length === 0) {
          url.searchParams.set('perfil', 'off');
        } else {
          url.searchParams.delete('perfil');
        }
      });
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
      
      updateUrlWithPriority((url) => {
        ['2024', '2021', '2018', '2015'].forEach(ano => {
          const key = `perfil_ano_${ano}`;
          if (!selectedAno.includes(ano)) {
            url.searchParams.set(key, 'off');
          } else {
            url.searchParams.delete(key);
          }
        });
      });
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
    // Quando desmarcar perfil, limpar também os anos
    if (!selectAll) {
      setSelectedAno([]);
    } else {
      setSelectedAno(["2024", "2021", "2018", "2015"]);
    }
  };

  const toggleGeneroOption = (year: string) => {
    setSelectedGenero(prev => 
      prev.includes(year) 
        ? prev.filter(item => item !== year)
        : [...prev, year]
    );
  };

  const toggleAnoOption = (year: string) => {
    setSelectedAno(prev => 
      prev.includes(year) 
        ? prev.filter(item => item !== year)
        : [...prev, year]
    );
  };

  const clearAllSelections = () => {
    setSelectedInfra([]);
    setSelectedContagem([]);
    setSelectedPdc([]);
    setSelectedInfracao([]);
    setSelectedSinistro([]);
    setSelectedEstacionamento([]);
    setSelectedPerfil([]);
    setSelectedGenero([]);
    setSelectedAno([]);
    setSelectedArea("Todas");
    setSelectedIdade("Todas");
    
    if (isClient) {
      localStorage.setItem('ciclodados_selectedInfra', JSON.stringify([]));
      localStorage.setItem('ciclodados_selectedContagem', JSON.stringify([]));
      localStorage.setItem('ciclodados_selectedPdc', JSON.stringify([]));
      localStorage.setItem('ciclodados_selectedInfracao', JSON.stringify([]));
      localStorage.setItem('ciclodados_selectedSinistro', JSON.stringify([]));
      localStorage.setItem('ciclodados_selectedEstacionamento', JSON.stringify([]));
      localStorage.setItem('ciclodados_selectedPerfil', JSON.stringify([]));
      localStorage.setItem('ciclodados_selectedGenero', JSON.stringify([]));
      localStorage.setItem('ciclodados_selectedAno', JSON.stringify([]));
      localStorage.setItem('ciclodados_selectedArea', JSON.stringify("Todas"));
      localStorage.setItem('ciclodados_selectedIdade', JSON.stringify("Todas"));
      
      // Limpar URL params
      const url = new URL(window.location.href);
      const lat = url.searchParams.get('lat');
      const lon = url.searchParams.get('lon');
      const zoom = url.searchParams.get('zoom');
      
      const newUrl = new URL(url.origin + url.pathname);
      if (lat && lon && zoom) {
        newUrl.searchParams.set('lat', lat);
        newUrl.searchParams.set('lon', lon);
        newUrl.searchParams.set('zoom', zoom);
      }
      window.history.replaceState({}, '', newUrl.toString());
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
    setSelectedGenero(["2024", "2021", "2018", "2015"]);
    setSelectedAno(["2024", "2021", "2018", "2015"]);
    setSelectedArea("Todas");
    setSelectedIdade("Todas");
    
    if (isClient) {
      // Limpar URL params mantendo apenas lat, lon, zoom
      const url = new URL(window.location.href);
      const lat = url.searchParams.get('lat');
      const lon = url.searchParams.get('lon');
      const zoom = url.searchParams.get('zoom');
      
      const newUrl = new URL(url.origin + url.pathname);
      if (lat && lon && zoom) {
        newUrl.searchParams.set('lat', lat);
        newUrl.searchParams.set('lon', lon);
        newUrl.searchParams.set('zoom', zoom);
      }
      window.history.replaceState({}, '', newUrl.toString());
    }
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
    toggleGeneroOption,
    selectedAno,
    setSelectedAno,
    toggleAnoOption,
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