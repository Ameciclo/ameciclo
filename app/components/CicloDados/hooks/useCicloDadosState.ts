import { useState } from 'react';

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
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedInfra, setSelectedInfra] = useState<string[]>(infraOptions.map(opt => opt.name));
  const [selectedContagem, setSelectedContagem] = useState<string[]>(contagemOptions);
  const [selectedPdc, setSelectedPdc] = useState<string[]>(pdcOptions.map(opt => opt.name));
  const [selectedInfracao, setSelectedInfracao] = useState<string[]>(infracaoOptions);
  const [selectedSinistro, setSelectedSinistro] = useState<string[]>(sinistroOptions);
  const [selectedEstacionamento, setSelectedEstacionamento] = useState<string[]>(estacionamentoOptions);
  const [selectedGenero, setSelectedGenero] = useState<string>("Todas");
  const [selectedRaca, setSelectedRaca] = useState<string>("Todas");
  const [selectedSocio, setSelectedSocio] = useState<string>("Salários entre X");
  const [selectedDias, setSelectedDias] = useState<string>("1 dia");
  const [viewMode, setViewMode] = useState<'map' | 'mural'>('map');

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