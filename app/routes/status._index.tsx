import { useEffect, useState } from "react";
import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { ArrowUpIcon, HomeIcon, RefreshIcon, TestIcon, TroubleshootIcon, ConfigIcon } from "~/components/Commom/Icones/DocumentationIcons";
import ServiceCard from "~/components/Status/ServiceCard";
import StatusStats from "~/components/Status/StatusStats";
import AccessibilityControls from "~/components/Commom/AccessibilityControls";

// Adicione este CSS para aplicar o alto contraste quando ativado
const highContrastStyles = `
  .high-contrast .content * {
    color: #000 !important;
    background-color: #fff !important;
    border-color: #000 !important;
  }
  .high-contrast .text-green-500, .high-contrast .text-green-700 {
    color: #006600 !important;
    font-weight: bold;
  }
  .high-contrast .text-red-500 {
    color: #cc0000 !important;
    font-weight: bold;
  }
  .high-contrast .text-yellow-500 {
    color: #cc6600 !important;
    font-weight: bold;
  }
  .high-contrast .text-blue-500 {
    color: #0000cc !important;
    font-weight: bold;
  }
  .high-contrast .theme-toggle {
    display: none !important;
  }
`;

export const meta: MetaFunction = () => {
  return [
    { title: "Status dos Serviços - Ameciclo" },
    { name: "description", content: "Monitoramento em tempo real do status de todos os serviços e páginas da plataforma Ameciclo" },
  ];
};

export interface Service {
  category: string;
  name: string;
  url: string;
  description?: string;
}

export interface ServiceStatus extends Service {
  status: "OK" | "OFF" | "LOADING";
  httpStatus?: number;
  errorMessage?: string;
  responseTime?: number;
}

const servicesList: Service[] = [
  // APIs e Backend
  { 
    category: "APIs e Backend", 
    name: "API Principal - Strapi V3", 
    url: "https://cms.ameciclo.org",
    description: "API principal para dados do site"
  },
  { 
    category: "APIs e Backend", 
    name: "API de Teste - Strapi V4", 
    url: "https://test.cms.ameciclo.org",
    description: "Ambiente de testes da API"
  },
  { 
    category: "APIs e Backend", 
    name: "API Nova - Strapi V5", 
    url: "https://do.strapi.ameciclo.org",
    description: "Nova versão da API (em desenvolvimento)"
  },
  
  // Páginas do Site
  { 
    category: "Páginas do Site", 
    name: "Página Inicial", 
    url: "/",
    description: "Landing page principal do site"
  },
  { 
    category: "Páginas do Site", 
    name: "Quem Somos", 
    url: "/quem_somos",
    description: "Informações sobre a organização"
  },
  { 
    category: "Páginas do Site", 
    name: "Agenda", 
    url: "/agenda",
    description: "Eventos e atividades"
  },
  { 
    category: "Páginas do Site", 
    name: "Projetos", 
    url: "/projetos",
    description: "Lista de projetos da organização"
  },
  { 
    category: "Páginas do Site", 
    name: "Projeto Individual", 
    url: "/projetos/bike-anjo",
    description: "Página de projeto específico"
  },
  { 
    category: "Páginas do Site", 
    name: "Contato", 
    url: "/contato",
    description: "Formulário de contato"
  },
  { 
    category: "Páginas do Site", 
    name: "Participe", 
    url: "/participe",
    description: "Como participar da organização"
  },
  { 
    category: "Páginas do Site", 
    name: "Portal de Dados", 
    url: "/dados",
    description: "Portal principal de dados"
  },
  { 
    category: "Páginas do Site", 
    name: "Contagens de Ciclistas", 
    url: "/dados/contagens",
    description: "Dados de contagens de ciclistas"
  },
  { 
    category: "Páginas do Site", 
    name: "Contagem Individual", 
    url: "/contagens/exemplo",
    description: "Página de contagem específica"
  },
  { 
    category: "Páginas do Site", 
    name: "Documentos", 
    url: "/dados/documentos",
    description: "Biblioteca de documentos"
  },
  { 
    category: "Páginas do Site", 
    name: "Ideciclo", 
    url: "/dados/ideciclo",
    description: "Índice de desenvolvimento cicloviário"
  },
  { 
    category: "Páginas do Site", 
    name: "Perfil Demográfico", 
    url: "/dados/perfil",
    description: "Dados demográficos da região"
  },
  { 
    category: "Páginas do Site", 
    name: "Portal Observatório", 
    url: "/observatorio",
    description: "Portal dos observatórios"
  },
  { 
    category: "Páginas do Site", 
    name: "Execução Cicloviária", 
    url: "/observatorio/execucaocicloviaria",
    description: "Monitoramento da execução de projetos cicloviários"
  },
  { 
    category: "Páginas do Site", 
    name: "LOA Clima", 
    url: "/observatorio/loa",
    description: "Lei Orçamentária Anual - Clima"
  },
  { 
    category: "Páginas do Site", 
    name: "DOM - Diário Oficial", 
    url: "/observatorio/dom",
    description: "Monitoramento do Diário Oficial do Município"
  },
  
  // Serviços Externos
  {
    category: "Serviços Externos",
    name: "Formulário Associe-se",
    url: "https://docs.google.com/forms/d/e/1FAIpQLSeBboZ6fDhGEuJjVSyt7r3tTe5FF8VJH1gKt95jq6JslrwOdQ/viewform",
    description: "Formulário para se associar à Ameciclo"
  },
  { 
    category: "Serviços Externos", 
    name: "Portal Participe", 
    url: "https://participe.ameciclo.org",
    description: "Portal de participação cidadã"
  },
  
  // Documentação e Status
  { 
    category: "Documentação e Suporte", 
    name: "Documentação", 
    url: "/documentacao",
    description: "Documentação técnica da plataforma"
  },
  { 
    category: "Documentação e Suporte", 
    name: "Status dos Serviços", 
    url: "/status",
    description: "Esta página de monitoramento"
  },
];

const fixEncoding = (text: string) => {
  try {
    return decodeURIComponent(escape(text));
  } catch {
    return text;
  }
};

const statusMessages: Record<number, string> = {
  400: "Requisição mal formada.",
  401: "Não autorizado!",
  403: "Proibido!",
  404: "Recurso não encontrado...",
  500: "Erro interno no servidor.",
  502: "Erro de gateway.",
  503: "Serviço temporariamente indisponível.",
  504: "Timeout do gateway.",
};

const checkStatus = async (url: string): Promise<Omit<ServiceStatus, keyof Service> | {}> => {
  const startTime = Date.now();
  try {
    const response = await fetch(url, { 
      headers: { 
        "Accept-Charset": "utf-8",
        "Content-Type": "text/html; charset=utf-8"
      }
    });
    const responseTime = Date.now() - startTime;
    const statusMessage = statusMessages[response.status] || `Erro inesperado com status ${response.status}`;
    
    if (response.ok) {
      return { status: "OK", responseTime };
    } else {
      return {
        status: "OFF",
        httpStatus: response.status,
        errorMessage: statusMessage,
        responseTime
      };
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    console.error(`Erro ao acessar ${url}:`, error);
    
    let errorMessage = "Erro desconhecido ao acessar o serviço.";
    if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      status: "OFF",
      errorMessage,
      responseTime
    };
  }
};

export async function loader({ request }: LoaderFunctionArgs) {
  const origin = new URL(request.url).origin;
  
  // Retorna apenas a lista de serviços com status LOADING
  const results: ServiceStatus[] = servicesList.map(service => ({
    ...service,
    status: "LOADING" as const
  }));

  return json({ services: results, origin }, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-cache"
    }
  });
}

export default function StatusPage() {
  const { services: initialServices, origin } = useLoaderData<typeof loader>();
  const [services, setServices] = useState<ServiceStatus[]>(initialServices);
  const [fontSize, setFontSize] = useState<number>(16);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showAccessibilityMenu, setShowAccessibilityMenu] = useState<boolean>(false);
  const [showSlowServices, setShowSlowServices] = useState<boolean>(false);

  // Carrega status de cada serviço individualmente
  useEffect(() => {
    const checkServiceStatus = async (service: Service, index: number) => {
      const fullUrl = service.url.startsWith("http") ? service.url : `${origin}${service.url}`;
      const statusData = await checkStatus(fullUrl);
      
      setServices(prev => {
        const updated = [...prev];
        updated[index] = { ...service, ...statusData } as ServiceStatus;
        return updated;
      });
    };

    // Inicia verificação de todos os serviços
    initialServices.forEach((service, index) => {
      checkServiceStatus(service, index);
    });
  }, [origin, initialServices]);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      setDarkMode(true);
    } else if (stored === "light") {
      setDarkMode(false);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);
  
  useEffect(() => {
    // Aplicar ou remover a classe de alto contraste
    document.body.classList.toggle("high-contrast", highContrast);
    
    // Adicionar ou remover o estilo de alto contraste
    let styleElement = document.getElementById("high-contrast-styles");
    if (highContrast && !styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "high-contrast-styles";
      styleElement.innerHTML = highContrastStyles;
      document.head.appendChild(styleElement);
    } else if (!highContrast && styleElement) {
      styleElement.remove();
    }
  }, [highContrast]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = Array.from(new Set(services.map((service) => service.category)));
  const totalServices = services.length;
  const onlineServices = services.filter(s => s.status === "OK").length;
  const offlineServices = services.filter(s => s.status === "OFF").length;
  const uptime = totalServices > 0 ? ((onlineServices / totalServices) * 100).toFixed(1) : "0";

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="max-w-7xl mx-auto px-4 py-20 content">
        {/* Banner */}
        <div className={`mb-8 rounded-lg overflow-hidden relative ${
          darkMode ? "bg-gradient-to-r from-gray-800 to-gray-700" : "bg-gradient-to-r from-green-600 to-blue-600"
        }`}>
          <div className="h-48 md:h-64 flex items-center justify-center relative">
            <div className="text-center text-white z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Status dos Serviços</h2>
              <p className="text-lg md:text-xl opacity-90 mb-2">Monitoramento em tempo real da plataforma Ameciclo</p>
              <p className="text-sm opacity-75">
                Para mais informações técnicas, consulte a <Link to="/documentacao" className="underline hover:opacity-100 transition-opacity">documentação</Link>
              </p>
            </div>
            <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-8 gap-4 h-full p-8">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div key={i} className={`rounded ${
                    i % 3 === 0 ? "bg-green-400" : i % 3 === 1 ? "bg-blue-400" : "bg-purple-400"
                  }`}></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <StatusStats 
          services={services} 
          darkMode={darkMode} 
          lastUpdate={lastUpdate} 
          onFilterByStatus={setStatusFilter}
          onRefresh={refreshPage}
        />

        {/* Active Filter Info */}
        {statusFilter && (
          <div className={`p-4 rounded-lg border mb-6 ${
            darkMode ? "bg-blue-900/30 border-blue-500/30" : "bg-blue-50 border-blue-200"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-blue-400 font-medium flex items-center gap-2">
                Mostrando apenas serviços: 
                {statusFilter === "OK" ? (
                  <><TestIcon className="w-4 h-4 text-green-500" /> Online</>
                ) : statusFilter === "OFF" ? (
                  <><TroubleshootIcon className="w-4 h-4 text-red-500" /> Offline</>
                ) : (
                  <>Verificando</>
                )}
              </span>
              <button 
                onClick={() => setStatusFilter("")}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
              >
                Mostrar Todos
              </button>
            </div>
          </div>
        )}

        {/* Loading Counter */}
        {services.filter(s => s.status === "LOADING").length > 0 && (
          <div 
            className={`p-3 rounded-lg border mb-6 flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform ${
              darkMode ? "bg-blue-900/30 border-blue-500/30 hover:bg-blue-900/40" : "bg-blue-50 border-blue-200 hover:bg-blue-100"
            }`}
            onClick={() => setStatusFilter("LOADING")}
          >
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-blue-400 font-medium">
              Verificando {services.filter(s => s.status === "LOADING").length} serviços...
            </span>
          </div>
        )}

        {/* Slow Services Alert */}
        {services.filter(s => s.responseTime && s.responseTime > 3000 && s.status === "OK").length > 0 && (
          <div className={`p-4 rounded-lg border mb-6 ${
            darkMode ? "bg-orange-900/30 border-orange-500/30" : "bg-orange-50 border-orange-200"
          }`}>
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowSlowServices(!showSlowServices)}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                <h3 className={`font-semibold ${darkMode ? "text-orange-400" : "text-orange-700"}`}>
                  Serviços com Resposta Lenta ({services.filter(s => s.responseTime && s.responseTime > 3000 && s.status === "OK").length})
                </h3>
              </div>
              <div className={`transform transition-transform ${showSlowServices ? 'rotate-180' : ''}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {showSlowServices && (
              <div className="mt-3">
                <div className={`mb-3 p-2 rounded text-xs ${
                  darkMode ? "bg-orange-900/30 border border-orange-500/30 text-orange-300" : "bg-orange-50 border border-orange-200 text-orange-700"
                }`}>
                  <strong>Performance:</strong> Serviços com tempo de resposta superior a 3 segundos podem indicar problemas de performance.
                </div>
                <div className={`mb-3 p-2 rounded text-xs ${
                  darkMode ? "bg-blue-900/30 border border-blue-500/30 text-blue-300" : "bg-blue-50 border border-blue-200 text-blue-700"
                }`}>
                  <strong>Desenvolvimento:</strong> Em ambiente local, alguns serviços podem parecer lentos devido à rede. Verifique a página deployada para tempos reais de produção.
                </div>
                <div className="space-y-4">
                  {Array.from(new Set(services
                    .filter(s => s.responseTime && s.responseTime > 3000 && s.status === "OK")
                    .map(s => s.category)
                  )).map(category => {
                    const categoryServices = services
                      .filter(s => s.responseTime && s.responseTime > 3000 && s.status === "OK" && s.category === category)
                      .sort((a, b) => (b.responseTime || 0) - (a.responseTime || 0));
                    
                    return (
                      <div key={category}>
                        <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                          {fixEncoding(category)} ({categoryServices.length})
                        </h4>
                        <div className="space-y-2 ml-2">
                          {categoryServices.map((service, index) => (
                            <div key={index} className={`flex justify-between items-center p-2 rounded ${
                              darkMode ? "bg-orange-800/20" : "bg-orange-100"
                            }`}>
                              <span className="text-sm font-medium">{fixEncoding(service.name)}</span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                darkMode ? "bg-orange-600 text-white" : "bg-orange-200 text-orange-800"
                              }`}>
                                {service.responseTime && service.responseTime < 1000 
                                  ? `${Math.round(service.responseTime)}ms` 
                                  : `${(service.responseTime! / 1000).toFixed(1)}s`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Services Status */}
        <div className="space-y-6">
          {categories.map((category) => {
            const filteredServices = services
              .filter((service) => service.category === category)
              .filter((service) => !statusFilter || service.status === statusFilter);
            
            if (filteredServices.length === 0) return null;
            
            return (
              <div key={category} className={`p-6 rounded-lg border ${
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}>
                <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-green-400" : "text-green-700"}`} style={{ fontSize: fontSize + 4 }}>
                  {fixEncoding(category)} ({filteredServices.length})
                </h2>
                <div className="space-y-3">
                  {filteredServices.map((service, index) => (
                    <ServiceCard 
                      key={index} 
                      service={service} 
                      fontSize={fontSize} 
                      darkMode={darkMode}
                      origin={origin} 
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      <AccessibilityControls
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        fontSize={fontSize}
        setFontSize={setFontSize}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        showAccessibilityMenu={showAccessibilityMenu}
        setShowAccessibilityMenu={setShowAccessibilityMenu}
        showScrollTop={showScrollTop}
        onScrollTop={scrollToTop}
      />
    </div>
  );
}