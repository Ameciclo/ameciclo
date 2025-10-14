import { useState } from 'react';
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";
import { Bot } from 'lucide-react';

export default function CicloDados() {
  const infraOptions = [
    { name: "Ciclovias", color: "#EF4444", pattern: "solid" },
    { name: "Ciclofaixas", color: "#6B7280", pattern: "bordered" },
    { name: "Ciclorrotas", color: "#9CA3AF", pattern: "arrows" },
    { name: "Calçadas Compartilhadas", color: "#10B981", pattern: "solid" },
    { name: "Zonas 30", color: "#F59E0B", pattern: "area" },
    { name: "Zonas de Pedestre", color: "#3B82F6", pattern: "area" }
  ];

  const contagemOptions = [
    "Somente Mulheres",
    "Crianças e Adolescentes", 
    "Carona",
    "Serviço",
    "Cargueira",
    "Uso de Calçada",
    "Contramão"
  ];

  const pdcOptions = [
    { name: "Realizado dentro do PDF com infra designada", color: "#8B5CF6", pattern: "parallel" },
    { name: "Realizado dentro do PDF com infra não designada", color: "#8B5CF6", pattern: "parallel-dashed" },
    { name: "Realizado fora do PDC", color: "#F59E0B", pattern: "parallel-orange-dashed" },
    { name: "PDC não realizado", color: "#EC4899", pattern: "striped" }
  ];

  const infracaoOptions = [
    "Ultrapassar ciclista sem guardar a distância lateral mínima de 1,5 metro",
    "Deixar de dar preferência de passagem a pedestre e a ciclista",
    "Estacionar o veículo sobre ciclovia ou ciclofaixa",
    "Parar o veículo sobre ciclovia ou ciclofaixa",
    "Abrir a porta do veículo sem se certificar de que não causará perigo a outros usuários da via (incluindo ciclistas)",
    "Transitar com o veículo em ciclovias ou ciclofaixas",
    "Conduzir o veículo ameaçando os ciclistas (direção perigosa)"
  ];

  const sinistroOptions = [
    "Vítima ciclista",
    "Vítima motociclistas", 
    "Vítima motorista",
    "Vítima pedestre"
  ];

  const estacionamentoOptions = [
    "Paraciclos",
    "Bicicletários",
    "Estações de Bike PE"
  ];

  const generoOptions = ["Todas", "Masculino", "Feminino"];
  const racaOptions = ["Todas", "Branco", "Preto", "Pardo", "Amarelo", "Indígena"];
  const socioOptions = ["Salários entre X"];
  const diasOptions = ["1 dia", "2 dias", "3 dias", "4 dias", "5 dias", "6 dias", "7 dias"];
  
  const perfilOptions = [
    ...generoOptions.map(g => `Gênero - ${g}`),
    ...racaOptions.map(r => `Raça/Cor - ${r}`),
    ...socioOptions.map(s => `Socioeconômico - ${s}`),
    ...diasOptions.map(d => `Pedala ${d}`)
  ];

  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [infraExpanded, setInfraExpanded] = useState(true);
  const [selectedInfra, setSelectedInfra] = useState<string[]>(infraOptions.map(opt => opt.name));
  const [contagemExpanded, setContagemExpanded] = useState(true);
  const [selectedContagem, setSelectedContagem] = useState<string[]>(contagemOptions);
  const [pdcExpanded, setPdcExpanded] = useState(true);
  const [selectedPdc, setSelectedPdc] = useState<string[]>(pdcOptions.map(opt => opt.name));
  const [infracaoExpanded, setInfracaoExpanded] = useState(true);
  const [selectedInfracao, setSelectedInfracao] = useState<string[]>(infracaoOptions);
  const [sinistroExpanded, setSinistroExpanded] = useState(true);
  const [selectedSinistro, setSelectedSinistro] = useState<string[]>(sinistroOptions);
  const [estacionamentoExpanded, setEstacionamentoExpanded] = useState(true);
  const [selectedEstacionamento, setSelectedEstacionamento] = useState<string[]>(estacionamentoOptions);
  const [perfilExpanded, setPerfilExpanded] = useState(true);
  const [selectedPerfil, setSelectedPerfil] = useState<string[]>(perfilOptions);
  const [selectedGenero, setSelectedGenero] = useState<string>("Todas");
  const [selectedRaca, setSelectedRaca] = useState<string>("Todas");
  const [selectedSocio, setSelectedSocio] = useState<string>("Salários entre X");
  const [selectedDias, setSelectedDias] = useState<string>("1 dia");
  const [viewMode, setViewMode] = useState<'map' | 'mural'>('map');

  const chartData = [
    {
      id: 1,
      title: "Av. Gov. Agamenon Magalhães",
      value: "2.846",
      description: "contagens de ciclistas (Jan/2024)",
      chart: (
        <svg className="w-full h-16" viewBox="0 0 200 60">
          <path d="M0,60 Q10,50 20,45 Q30,30 40,35 Q50,40 60,25 Q70,20 80,30 Q90,35 100,20 Q110,15 120,22 Q130,25 140,18 Q150,10 160,25 Q170,30 180,22 Q190,20 200,25 L200,60 Z" 
            fill="#1d4ed8" fillOpacity="0.3" stroke="#1d4ed8" strokeWidth="2"/>
        </svg>
      )
    },
    {
      id: 2,
      title: "Sinistros com vítima",
      value: "1.323",
      chart: (
        <svg className="w-full h-16" viewBox="0 0 200 60">
          <rect x="20" y="40" width="15" height="20" fill="#1d4ed8"/>
          <rect x="45" y="30" width="15" height="30" fill="#1d4ed8"/>
          <rect x="70" y="35" width="15" height="25" fill="#1d4ed8"/>
          <rect x="95" y="25" width="15" height="35" fill="#1d4ed8"/>
          <rect x="120" y="45" width="15" height="15" fill="#1d4ed8"/>
          <rect x="145" y="20" width="15" height="40" fill="#1d4ed8"/>
          <rect x="170" y="38" width="15" height="22" fill="#1d4ed8"/>
        </svg>
      )
    },
    {
      id: 3,
      title: "Infra. cicloviária executada",
      value: "78%",
      chart: (
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div className="bg-blue-700 h-4 rounded-full transition-all duration-500" style={{width: '78%'}}></div>
        </div>
      )
    }
  ];

  const layers = [];

  const getPatternSvg = (pattern: string, color: string, name: string) => {
    switch (pattern) {
      case "solid":
        return <div className="w-full h-3" style={{ backgroundColor: color }} />;
      case "bordered":
        return (
          <div className="w-full h-3 border border-red-500" style={{ backgroundColor: color }} />
        );
      case "arrows":
        return (
          <svg className="w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none">
            <rect width="100" height="12" fill={color} stroke="#EF4444" strokeWidth="1" />
            <path d="M25,3 L30,6 L25,9" stroke="#EF4444" strokeWidth="2" fill="none" />
            <path d="M40,3 L45,6 L40,9" stroke="#EF4444" strokeWidth="2" fill="none" />
            <path d="M55,3 L60,6 L55,9" stroke="#EF4444" strokeWidth="2" fill="none" />
            <path d="M70,3 L75,6 L70,9" stroke="#EF4444" strokeWidth="2" fill="none" />
          </svg>
        );


      case "area":
        const isZona30 = name === "Zonas 30";
        const bgColor = isZona30 ? "#FEF3C7" : "#DBEAFE";
        const borderColor = isZona30 ? "#F59E0B" : "#3B82F6";
        return (
          <svg className="w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none">
            <rect width="100" height="12" fill={bgColor} stroke={borderColor} strokeWidth="1" strokeDasharray="4,2" />
          </svg>
        );
      default:
        return <div className="w-full h-3" style={{ backgroundColor: color }} />;
    }
  };

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

  const togglePerfilOption = (optionName: string) => {
    setSelectedPerfil(prev => 
      prev.includes(optionName) 
        ? prev.filter(item => item !== optionName)
        : [...prev, optionName]
    );
  };

  const getPdcPatternSvg = (pattern: string, color: string) => {
    switch (pattern) {
      case "parallel":
        return (
          <svg className="w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none">
            <line x1="0" y1="3" x2="100" y2="3" stroke={color} strokeWidth="2" />
            <line x1="0" y1="9" x2="100" y2="9" stroke={color} strokeWidth="2" />
          </svg>
        );
      case "parallel-dashed":
        return (
          <svg className="w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none">
            <line x1="0" y1="3" x2="100" y2="3" stroke={color} strokeWidth="2" strokeDasharray="4,2" />
            <line x1="0" y1="9" x2="100" y2="9" stroke={color} strokeWidth="2" strokeDasharray="4,2" />
          </svg>
        );
      case "parallel-orange-dashed":
        return (
          <svg className="w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none">
            <line x1="0" y1="3" x2="100" y2="3" stroke={color} strokeWidth="2" strokeDasharray="4,2" />
            <line x1="0" y1="9" x2="100" y2="9" stroke={color} strokeWidth="2" strokeDasharray="4,2" />
          </svg>
        );
      case "striped":
        return (
          <svg className="w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none">
            <defs>
              <pattern id="stripes" patternUnits="userSpaceOnUse" width="8" height="12">
                <rect width="4" height="12" fill="#EC4899" />
                <rect x="4" width="4" height="12" fill="#FED7AA" />
              </pattern>
            </defs>
            <rect width="100" height="12" fill="url(#stripes)" />
          </svg>
        );
      default:
        return <div className="w-full h-3" style={{ backgroundColor: color }} />;
    }
  };

  // Dados de exemplo de infraestrutura cicloviária no centro do Recife
  const infraData = selectedInfra.length > 0 ? {
    type: "FeatureCollection",
    features: [
      // Ciclovias - Av. Conde da Boa Vista
      {
        type: "Feature",
        properties: { type: "Ciclovias" },
        geometry: {
          type: "LineString",
          coordinates: [[-34.8813, -8.0576], [-34.8798, -8.0582], [-34.8785, -8.0588]]
        }
      },
      // Ciclofaixas - Rua da Aurora
      {
        type: "Feature",
        properties: { type: "Ciclofaixas" },
        geometry: {
          type: "LineString",
          coordinates: [[-34.8825, -8.0595], [-34.8810, -8.0601], [-34.8795, -8.0607]]
        }
      },
      // Ciclorrotas - Rua do Hospício
      {
        type: "Feature",
        properties: { type: "Ciclorrotas" },
        geometry: {
          type: "LineString",
          coordinates: [[-34.8840, -8.0610], [-34.8825, -8.0616], [-34.8810, -8.0622]]
        }
      },
      // Calçadas Compartilhadas - Rua da Imperatriz
      {
        type: "Feature",
        properties: { type: "Calçadas Compartilhadas" },
        geometry: {
          type: "LineString",
          coordinates: [[-34.8855, -8.0625], [-34.8840, -8.0631], [-34.8825, -8.0637]]
        }
      },
      // Zonas 30 - Bairro do Recife (forma irregular)
      {
        type: "Feature",
        properties: { type: "Zonas 30", id: "zona30-1" },
        geometry: {
          type: "Polygon",
          coordinates: [[[-34.8750, -8.0680], [-34.8725, -8.0685], [-34.8720, -8.0700], [-34.8735, -8.0715], [-34.8755, -8.0710], [-34.8760, -8.0695], [-34.8750, -8.0680]]]
        }
      },
      // Zonas de Pedestre - Marco Zero (formato orgânico)
      {
        type: "Feature",
        properties: { type: "Zonas de Pedestre", id: "zona-pedestre-1" },
        geometry: {
          type: "Polygon",
          coordinates: [[[-34.8720, -8.0580], [-34.8712, -8.0585], [-34.8708, -8.0592], [-34.8714, -8.0598], [-34.8722, -8.0595], [-34.8725, -8.0588], [-34.8720, -8.0580]]]
        }
      }
    ].filter(feature => selectedInfra.includes(feature.properties.type))
  } : null;

  // Dados de exemplo de contagem de ciclistas
  const contagemCounts = {
    "Somente Mulheres": 45,
    "Crianças e Adolescentes": 23,
    "Carona": 12,
    "Serviço": 8,
    "Cargueira": 15,
    "Uso de Calçada": 31,
    "Contramão": 7
  };

  const totalCount = selectedContagem.reduce((sum, type) => 
    sum + (contagemCounts[type as keyof typeof contagemCounts] || 0), 0
  );

  const contagemData = selectedContagem.length > 0 ? {
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      properties: { 
        type: "Contagem Total", 
        count: totalCount,
        location: "Av. Conde da Boa Vista"
      },
      geometry: {
        type: "Point",
        coordinates: [-34.8800, -8.0580]
      }
    }]
  } : null;

  // Dados de exemplo do Plano Diretor Cicloviário
  const pdcData = selectedPdc.length > 0 ? {
    type: "FeatureCollection",
    features: [
      // Realizado dentro do PDF com infra designada
      {
        type: "Feature",
        properties: { type: "Realizado dentro do PDF com infra designada", id: "pdc-1" },
        geometry: {
          type: "LineString",
          coordinates: [[-34.8770, -8.0550], [-34.8760, -8.0555], [-34.8750, -8.0560]]
        }
      },
      // Realizado dentro do PDF com infra não designada
      {
        type: "Feature",
        properties: { type: "Realizado dentro do PDF com infra não designada", id: "pdc-2" },
        geometry: {
          type: "LineString",
          coordinates: [[-34.8780, -8.0565], [-34.8770, -8.0570], [-34.8760, -8.0575]]
        }
      },
      // Realizado fora do PDC
      {
        type: "Feature",
        properties: { type: "Realizado fora do PDC", id: "pdc-3" },
        geometry: {
          type: "LineString",
          coordinates: [[-34.8790, -8.0580], [-34.8780, -8.0585], [-34.8770, -8.0590]]
        }
      },
      // PDC não realizado
      {
        type: "Feature",
        properties: { type: "PDC não realizado", id: "pdc-4" },
        geometry: {
          type: "LineString",
          coordinates: [[-34.8800, -8.0595], [-34.8790, -8.0600], [-34.8780, -8.0605]]
        }
      }
    ].filter(feature => selectedPdc.includes(feature.properties.type))
  } : null;

  const getContagemIcon = (count: number) => {
    return (
      <div className="relative">
        <div className="bg-white rounded-lg px-2 py-1 shadow-lg">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
            <span className="text-sm font-bold text-black">{count}</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
        </div>
      </div>
    );
  };

  const getLayerStyle = (type: string) => {
    const infraOption = infraOptions.find(opt => opt.name === type);
    const pdcOption = pdcOptions.find(opt => opt.name === type);
    
    if (infraOption) {
      switch (infraOption.pattern) {
        case "solid":
          return { "line-color": infraOption.color, "line-width": 6 };
        case "bordered":
          return { "line-color": infraOption.color, "line-width": 8, "line-opacity": 0.8 };
        case "arrows":
          return { "line-color": infraOption.color, "line-width": 8 };
        case "area":
          const isZona30 = type === "Zonas 30";
          return {
            "fill-color": isZona30 ? "#FEF3C7" : "#DBEAFE",
            "fill-opacity": 0.6,
            "fill-outline-color": isZona30 ? "#F59E0B" : "#3B82F6"
          };
        default:
          return { "line-color": infraOption.color, "line-width": 2 };
      }
    }
    
    if (pdcOption) {
      switch (pdcOption.pattern) {
        case "parallel":
          return { "line-color": pdcOption.color, "line-width": 6 };
        case "parallel-dashed":
          return { "line-color": pdcOption.color, "line-width": 6, "line-dasharray": [4, 2] };
        case "parallel-orange-dashed":
          return { "line-color": pdcOption.color, "line-width": 6, "line-dasharray": [4, 2] };
        case "striped":
          return { "line-color": pdcOption.color, "line-width": 6, "line-opacity": 0.8 };
        default:
          return { "line-color": pdcOption.color, "line-width": 6 };
      }
    }
    
    return { "line-color": "#000000", "line-width": 2 };
  };

  const layersConf = (() => {
    const allLayers = [];
    
    // Layers de infraestrutura
    infraOptions
      .filter(option => selectedInfra.includes(option.name))
      .forEach(option => {
        const style = getLayerStyle(option.name);
        const isArea = option.pattern === "area";
        
        allLayers.push({
          id: option.name,
          type: isArea ? "fill" : "line",
          filter: ["==", ["get", "type"], option.name],
          paint: style
        });
        
        if (isArea) {
          const isZona30 = option.name === "Zonas 30";
          allLayers.push({
            id: `${option.name}-border`,
            type: "line",
            filter: ["==", ["get", "type"], option.name],
            paint: {
              "line-color": isZona30 ? "#F59E0B" : "#3B82F6",
              "line-width": 2,
              "line-dasharray": [4, 2]
            }
          });
        }
        
        if (option.pattern === "arrows") {
          allLayers.push({
            id: `${option.name}-arrows`,
            type: "symbol",
            filter: ["==", ["get", "type"], option.name],
            layout: {
              "symbol-placement": "line",
              "symbol-spacing": 20,
              "text-field": "▶",
              "text-size": 16,
              "text-rotation-alignment": "map",
              "text-pitch-alignment": "viewport"
            },
            paint: {
              "text-color": "#EF4444"
            }
          });
        }
      });
    
    // Layers de PDC
    pdcOptions
      .filter(option => selectedPdc.includes(option.name))
      .forEach(option => {
        const style = getLayerStyle(option.name);
        
        // Para padrões paralelos, criar duas linhas
        if (option.pattern === "parallel" || option.pattern === "parallel-dashed" || option.pattern === "parallel-orange-dashed") {
          // Linha superior
          allLayers.push({
            id: `${option.name}-line1`,
            type: "line",
            filter: ["==", ["get", "type"], option.name],
            paint: {
              "line-color": option.color,
              "line-width": 3,
              "line-offset": -2,
              ...(option.pattern.includes("dashed") ? { "line-dasharray": [1, 1] } : {})
            }
          });
          
          // Linha inferior
          allLayers.push({
            id: `${option.name}-line2`,
            type: "line",
            filter: ["==", ["get", "type"], option.name],
            paint: {
              "line-color": option.color,
              "line-width": 3,
              "line-offset": 2,
              ...(option.pattern.includes("dashed") ? { "line-dasharray": [1, 1] } : {})
            }
          });
        } else if (option.pattern === "striped") {
          // Para padrão listrado, criar linha base rosa e linhas laranja intercaladas
          allLayers.push({
            id: `${option.name}-base`,
            type: "line",
            filter: ["==", ["get", "type"], option.name],
            paint: {
              "line-color": "#EC4899",
              "line-width": 6
            }
          });
          
          // Linhas laranja claro intercaladas
          allLayers.push({
            id: `${option.name}-stripes`,
            type: "line",
            filter: ["==", ["get", "type"], option.name],
            paint: {
              "line-color": "#FED7AA",
              "line-width": 6,
              "line-dasharray": [1, 1]
            }
          });
        } else {
          // Outros padrões
          allLayers.push({
            id: option.name,
            type: "line",
            filter: ["==", ["get", "type"], option.name],
            paint: style
          });
        }
      });
    
    return allLayers;
  })();


  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{height: '100vh', maxHeight: '100vh'}}>
      {/* Header */}
      <header className="flex items-center bg-teal-700 text-white px-4 py-2 flex-shrink-0" style={{minHeight: 'auto'}}>
        <div className="flex items-center">
          <a href="/dados" className="hover:opacity-80 transition-opacity">
            <img src="/ciclodados/Logo.svg" alt="CicloDados" className="h-12" />
          </a>
        </div>

        <div className="flex-1 flex items-center justify-center space-x-4">
          <button 
            onClick={() => setViewMode('map')}
            className={`px-3 py-1 rounded transition-colors ${
              viewMode === 'map' 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            Visualizando no mapa
          </button>
          <button 
            onClick={() => setViewMode('mural')}
            className={`px-3 py-1 rounded transition-colors ${
              viewMode === 'mural' 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            Visualizar no mural
          </button>
          <input
            type="text"
            placeholder="Buscar local, bairro, rua etc"
            className="px-3 py-1 rounded border text-black focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden" style={{height: 'calc(100vh - 64px)'}}>
        {/* Left Sidebar */}
        <aside className={`bg-gray-50 border-r transition-all duration-300 flex-shrink-0 overflow-hidden ${
          leftSidebarOpen ? 'w-72' : 'w-12'
        }`} style={{height: '100%'}}>
          <div className="h-full overflow-y-auto">
            <div className={`flex items-center justify-between p-3 ${
              leftSidebarOpen ? 'mb-4' : 'mb-0 flex-col gap-2'
            }`}>
              {leftSidebarOpen && <h2 className="font-semibold text-gray-800">Camadas de dados</h2>}
              <button 
                onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                className={`hover:bg-gray-200 rounded transition-colors ${
                  leftSidebarOpen ? 'p-1' : 'p-2 w-8 h-8 flex items-center justify-center'
                }`}
                title={leftSidebarOpen ? 'Minimizar' : 'Expandir'}
              >
                <svg className={`w-4 h-4 transition-transform ${
                  leftSidebarOpen ? '' : 'rotate-180'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
            
            {leftSidebarOpen && (
              <div className="px-3 pb-3">
                <div className="space-y-2">
                  {/* Infraestrutura cicloviária - Select minimizável */}
                  <div className="bg-white rounded border">
                    <div className="p-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Infraestrutura cicloviária</span>
                        <button 
                          onClick={() => setInfraExpanded(!infraExpanded)}
                          className="hover:bg-gray-50 rounded p-1 transition-colors"
                        >
                          <svg 
                            className={`w-4 h-4 transition-transform ${infraExpanded ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {infraExpanded && (
                      <div className="px-2 pb-2 space-y-1">
                        <button
                          onClick={() => {
                            if (selectedInfra.length === infraOptions.length) {
                              setSelectedInfra([]);
                            } else {
                              setSelectedInfra(infraOptions.map(opt => opt.name));
                            }
                          }}
                          className={`mb-2 px-2 py-1 text-xs rounded ${
                            selectedInfra.length === infraOptions.length
                              ? 'bg-teal-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Todas
                        </button>
                        {infraOptions.map((option) => (
                          <label key={option.name} className="block p-1 hover:bg-gray-50 rounded cursor-pointer">
                            <div className="flex items-center space-x-2 mb-1">
                              <input
                                type="checkbox"
                                checked={selectedInfra.includes(option.name)}
                                onChange={() => toggleInfraOption(option.name)}
                                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                              />
                              <span className="text-sm text-gray-700">{option.name}</span>
                            </div>
                            {getPatternSvg(option.pattern, option.color, option.name)}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Contagem de ciclistas - Select minimizável */}
                  <div className="bg-white rounded border">
                    <div className="p-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Contagem de ciclistas</span>
                        <button 
                          onClick={() => setContagemExpanded(!contagemExpanded)}
                          className="hover:bg-gray-50 rounded p-1 transition-colors"
                        >
                          <svg 
                            className={`w-4 h-4 transition-transform ${contagemExpanded ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {contagemExpanded && (
                      <div className="px-2 pb-2 space-y-1">
                        <button
                          onClick={() => {
                            if (selectedContagem.length === contagemOptions.length) {
                              setSelectedContagem([]);
                            } else {
                              setSelectedContagem([...contagemOptions]);
                            }
                          }}
                          className={`mb-2 px-2 py-1 text-xs rounded ${
                            selectedContagem.length === contagemOptions.length
                              ? 'bg-teal-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Todas
                        </button>
                        {contagemOptions.map((option) => (
                          <label key={option} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedContagem.includes(option)}
                              onChange={() => toggleContagemOption(option)}
                              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Plano Diretor Cicloviário - Select minimizável */}
                  <div className="bg-white rounded border">
                    <div className="p-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Plano Diretor Cicloviário</span>
                        <button 
                          onClick={() => setPdcExpanded(!pdcExpanded)}
                          className="hover:bg-gray-50 rounded p-1 transition-colors"
                        >
                          <svg 
                            className={`w-4 h-4 transition-transform ${pdcExpanded ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {pdcExpanded && (
                      <div className="px-2 pb-2 space-y-1">
                        <button
                          onClick={() => {
                            if (selectedPdc.length === pdcOptions.length) {
                              setSelectedPdc([]);
                            } else {
                              setSelectedPdc(pdcOptions.map(opt => opt.name));
                            }
                          }}
                          className={`mb-2 px-2 py-1 text-xs rounded ${
                            selectedPdc.length === pdcOptions.length
                              ? 'bg-teal-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Todas
                        </button>
                        {pdcOptions.map((option) => (
                          <label key={option.name} className="block p-1 hover:bg-gray-50 rounded cursor-pointer">
                            <div className="flex items-center space-x-2 mb-1">
                              <input
                                type="checkbox"
                                checked={selectedPdc.includes(option.name)}
                                onChange={() => togglePdcOption(option.name)}
                                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                              />
                              <span className="text-sm text-gray-700">{option.name}</span>
                            </div>
                            {getPdcPatternSvg(option.pattern, option.color)}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Infrações de Trânsito - Select minimizável */}
                  <div className="bg-white rounded border">
                    <div className="p-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Infrações de Trânsito</span>
                        <button 
                          onClick={() => setInfracaoExpanded(!infracaoExpanded)}
                          className="hover:bg-gray-50 rounded p-1 transition-colors"
                        >
                          <svg 
                            className={`w-4 h-4 transition-transform ${infracaoExpanded ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {infracaoExpanded && (
                      <div className="px-2 pb-2 space-y-1">
                        <button
                          onClick={() => {
                            if (selectedInfracao.length === infracaoOptions.length) {
                              setSelectedInfracao([]);
                            } else {
                              setSelectedInfracao([...infracaoOptions]);
                            }
                          }}
                          className={`mb-2 px-2 py-1 text-xs rounded ${
                            selectedInfracao.length === infracaoOptions.length
                              ? 'bg-teal-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Todas
                        </button>
                        {infracaoOptions.map((option) => (
                          <label key={option} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedInfracao.includes(option)}
                              onChange={() => toggleInfracaoOption(option)}
                              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Sinistro com vítima - Select minimizável */}
                  <div className="bg-white rounded border">
                    <div className="p-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Sinistro com vítima</span>
                        <button 
                          onClick={() => setSinistroExpanded(!sinistroExpanded)}
                          className="hover:bg-gray-50 rounded p-1 transition-colors"
                        >
                          <svg 
                            className={`w-4 h-4 transition-transform ${sinistroExpanded ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {sinistroExpanded && (
                      <div className="px-2 pb-2 space-y-1">
                        <button
                          onClick={() => {
                            if (selectedSinistro.length === sinistroOptions.length) {
                              setSelectedSinistro([]);
                            } else {
                              setSelectedSinistro([...sinistroOptions]);
                            }
                          }}
                          className={`mb-2 px-2 py-1 text-xs rounded ${
                            selectedSinistro.length === sinistroOptions.length
                              ? 'bg-teal-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Todas
                        </button>
                        {sinistroOptions.map((option) => (
                          <label key={option} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedSinistro.includes(option)}
                              onChange={() => toggleSinistroOption(option)}
                              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Estacionamento e compartilhamento - Select minimizável */}
                  <div className="bg-white rounded border">
                    <div className="p-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Estacionamento e compartilhamento</span>
                        <button 
                          onClick={() => setEstacionamentoExpanded(!estacionamentoExpanded)}
                          className="hover:bg-gray-50 rounded p-1 transition-colors"
                        >
                          <svg 
                            className={`w-4 h-4 transition-transform ${estacionamentoExpanded ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {estacionamentoExpanded && (
                      <div className="px-2 pb-2 space-y-1">
                        <button
                          onClick={() => {
                            if (selectedEstacionamento.length === estacionamentoOptions.length) {
                              setSelectedEstacionamento([]);
                            } else {
                              setSelectedEstacionamento([...estacionamentoOptions]);
                            }
                          }}
                          className={`mb-2 px-2 py-1 text-xs rounded ${
                            selectedEstacionamento.length === estacionamentoOptions.length
                              ? 'bg-teal-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Todas
                        </button>
                        {estacionamentoOptions.map((option) => (
                          <label key={option} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedEstacionamento.includes(option)}
                              onChange={() => toggleEstacionamentoOption(option)}
                              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Perfil de ciclistas - Select minimizável */}
                  <div className="bg-white rounded border">
                    <div className="p-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Perfil de ciclistas</span>
                        <button 
                          onClick={() => setPerfilExpanded(!perfilExpanded)}
                          className="hover:bg-gray-50 rounded p-1 transition-colors"
                        >
                          <svg 
                            className={`w-4 h-4 transition-transform ${perfilExpanded ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {perfilExpanded && (
                      <div className="px-2 pb-2 space-y-3">
                        {/* Gênero */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Gênero</h4>
                          <div className="flex gap-1">
                            {generoOptions.map((option) => (
                              <button
                                key={option}
                                onClick={() => setSelectedGenero(option)}
                                className={`px-2 py-1 text-xs rounded ${
                                  selectedGenero === option
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Raça/Cor */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Raça/Cor</h4>
                          <div className="flex flex-wrap gap-1">
                            {racaOptions.map((option) => (
                              <button
                                key={option}
                                onClick={() => setSelectedRaca(option)}
                                className={`px-2 py-1 text-xs rounded ${
                                  selectedRaca === option
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Socioeconômico */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Socioeconômico</h4>
                          <div className="flex gap-1">
                            {socioOptions.map((option) => (
                              <button
                                key={option}
                                onClick={() => setSelectedSocio(option)}
                                className={`px-2 py-1 text-xs rounded ${
                                  selectedSocio === option
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Dias que pedala */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Quantos dias pedala</h4>
                          <div className="grid grid-cols-4 gap-1">
                            {diasOptions.map((option) => (
                              <button
                                key={option}
                                onClick={() => setSelectedDias(option)}
                                className={`px-2 py-1 text-xs rounded ${
                                  selectedDias === option
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Map or Mural */}
        <main className="flex-1 relative">
          {viewMode === 'map' ? (
            <div style={{height: 'calc(100vh - 64px)'}}>
              <AmecicloMap 
                key={`${selectedInfra.join(',')}-${selectedPdc.join(',')}-${selectedContagem.join(',')}`}
                layerData={(() => {
                  const allFeatures = [
                    ...(infraData?.features || []),
                    ...(pdcData?.features || [])
                  ];
                  return allFeatures.length > 0 ? {
                    type: "FeatureCollection",
                    features: allFeatures
                  } : null;
                })()}
                layersConf={layersConf || []}
                pointsData={contagemData ? contagemData.features.map(feature => ({
                  key: `contagem-${feature.properties.type}`,
                  latitude: feature.geometry.coordinates[1],
                  longitude: feature.geometry.coordinates[0],
                  type: feature.properties.type,
                  popup: {
                    name: feature.properties.location,
                    total: feature.properties.count,
                    date: "Jan/2024"
                  },
                  customIcon: getContagemIcon(feature.properties.count)
                })) : []}
                showLayersPanel={false}
                width="100%" 
                height="100%" 
                defaultDragPan={true}
              />
            </div>
          ) : (
            <div className="h-full bg-gray-50 p-6 overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard - Dados de Mobilidade Urbana</h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Área para gráficos e dados - será implementada conforme solicitações */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Área para gráficos</h3>
                    <p className="text-gray-500">Gráficos serão adicionados aqui conforme solicitação</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar - Only visible in map mode */}
        {viewMode === 'map' && (
          <aside className={`bg-white border-l flex flex-col transition-all duration-300 flex-shrink-0 overflow-hidden ${
            rightSidebarOpen ? 'w-80' : 'w-12'
          }`} style={{height: '100%'}}>
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className={`bg-blue-500 flex items-center justify-between ${
              rightSidebarOpen ? 'p-3 mb-4' : 'p-2 m-2 flex-col gap-2'
            }`}>
              {rightSidebarOpen && <h2 className="font-semibold text-white">Dados em gráficos</h2>}
              <button 
                onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                className={`hover:bg-white hover:bg-opacity-20 rounded text-white transition-colors ${
                  rightSidebarOpen ? 'p-1' : 'p-2 w-8 h-8 flex items-center justify-center'
                }`}
                title={rightSidebarOpen ? 'Minimizar' : 'Expandir'}
              >
                <svg className={`w-4 h-4 transition-transform ${
                  rightSidebarOpen ? '' : 'rotate-180'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {rightSidebarOpen && (
              <div className="px-3 pb-3">
                <div className="space-y-4">
                  {chartData.map((item) => (
                    <div key={item.id} className="border rounded-lg p-3 shadow-sm bg-gray-50">
                      <h3 className="font-medium text-gray-800 mb-1">{item.title}</h3>
                      <p className="text-2xl font-bold text-black mb-2">{item.value}</p>
                      {item.chart}
                      {item.description && <p className="text-xs text-gray-500 mt-2">{item.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
        )}
      </div>

      {/* Floating Chat */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className={`transition-all duration-500 ease-in-out transform ${
          chatOpen 
            ? 'w-80 h-auto scale-100 opacity-100' 
            : 'w-auto h-auto scale-100 opacity-100'
        }`}>
          {chatOpen ? (
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-white">IA Ameciclo</span>
                </div>
                <button 
                  onClick={() => setChatOpen(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 rounded-xl text-sm">
                  Olá! Como posso ajudar você com os dados de mobilidade urbana?
                </div>
              </div>
              <div className="p-4 border-t bg-gray-50">
                <div className="flex items-center gap-3">
                  <input 
                    type="text" 
                    placeholder="Digite sua pergunta..."
                    className="flex-1 p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <button className="p-3 text-gray-400 hover:text-pink-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setChatOpen(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center overflow-hidden group hover:pr-4 transform hover:scale-105"
            >
              <div className="p-4">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="whitespace-nowrap font-medium pr-0 group-hover:pr-3 w-0 group-hover:w-auto opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden">
                IA Ameciclo
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}