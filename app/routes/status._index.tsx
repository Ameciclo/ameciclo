import { useEffect, useState } from "react";
import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { ArrowUpIcon, HomeIcon, RefreshIcon } from "~/components/Commom/Icones/DocumentationIcons";
import ServiceCard from "~/components/Status/ServiceCard";
import StatusStats from "~/components/Status/StatusStats";

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
      headers: { "Accept-Charset": "utf-8" }
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
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

export default function StatusPage() {
  const { services: initialServices, origin } = useLoaderData<typeof loader>();
  const [services, setServices] = useState<ServiceStatus[]>(initialServices);
  const [fontSize, setFontSize] = useState<number>(16);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("");

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
      <div className="max-w-7xl mx-auto px-4 py-20">
        {/* Banner */}
        <div className={`mb-8 rounded-lg overflow-hidden relative ${
          darkMode ? "bg-gradient-to-r from-gray-800 to-gray-700" : "bg-gradient-to-r from-green-600 to-blue-600"
        }`}>
          <div className="h-48 md:h-64 flex items-center justify-center relative">
            <div className="text-center text-white z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Status dos Serviços</h2>
              <p className="text-lg md:text-xl opacity-90">Monitoramento em tempo real da plataforma Ameciclo</p>
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
        />

        {/* Accessibility Controls - Floating */}
        <div className="fixed top-24 right-4 z-40">
          <div className={`p-3 rounded-lg border shadow-lg max-w-xs ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className="text-xs font-medium mb-2">Acessibilidade:</div>
            <div className="flex flex-wrap items-center gap-1 mb-2">
              <button 
                onClick={() => setFontSize(Math.min(fontSize + 2, 24))} 
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  darkMode 
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200" 
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
                aria-label="Aumentar tamanho da fonte"
              >
                A+
              </button>
              <button 
                onClick={() => setFontSize(Math.max(fontSize - 2, 12))} 
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  darkMode 
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200" 
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
                aria-label="Diminuir tamanho da fonte"
              >
                A-
              </button>
              <button 
                onClick={() => setDarkMode(!darkMode)} 
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  darkMode 
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200" 
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
                aria-label={`Mudar para modo ${darkMode ? "claro" : "escuro"}`}
              >
                {darkMode ? "🌞" : "🌙"}
              </button>
            </div>
            <button 
              onClick={refreshPage}
              className="w-full px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1 mb-2"
              aria-label="Atualizar status"
            >
              <RefreshIcon className="w-3 h-3" />
              Atualizar
            </button>
            <div className="text-xs opacity-75 text-center">
              {lastUpdate.toLocaleTimeString('pt-BR')}
            </div>
          </div>
        </div>

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
                  {category} ({filteredServices.length})
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

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50"
          aria-label="Voltar ao topo"
        >
          <ArrowUpIcon className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}