import { useEffect, useState } from "react";
import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { ArrowUpIcon, HomeIcon, RefreshIcon, TestIcon, TroubleshootIcon, ConfigIcon } from "~/components/Commom/Icones/DocumentationIcons";

const StatusIcon = ({ status }: { status: "OK" | "OFF" | "LOADING" }) => {
  if (status === "OK") return <TestIcon className="w-5 h-5 text-green-500" />;
  if (status === "OFF") return <TroubleshootIcon className="w-5 h-5 text-red-500" />;
  return <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>;
};

const getCategoryType = (category: string): "frontend" | "backend" => {
  const backendCategories = ["APIs e Backend", "APIs Externas", "Endpoints de Dados"];
  return backendCategories.includes(category) ? "backend" : "frontend";
};
import ServiceCard from "~/components/Status/ServiceCard";
import StatusStats from "~/components/Status/StatusStats";
import AccessibilityControls from "~/components/Commom/AccessibilityControls";


const highContrastStyles = `
  .high-contrast .content * {
    color: #000 !important;
    background-color: #fff !important;
    border-color: #000 !important;
  }
  .high-contrast.dark .content * {
    color: #fff !important;
    background-color: #000 !important;
    border-color: #fff !important;
  }
  .high-contrast .text-green-500, .high-contrast .text-green-700 {
    color: #006600 !important;
    font-weight: bold;
  }
  .high-contrast.dark .text-green-500, .high-contrast.dark .text-green-700 {
    color: #00ff00 !important;
    font-weight: bold;
  }
  .high-contrast .text-red-500 {
    color: #cc0000 !important;
    font-weight: bold;
  }
  .high-contrast.dark .text-red-500 {
    color: #ff0000 !important;
    font-weight: bold;
  }
  .high-contrast .text-yellow-500 {
    color: #cc6600 !important;
    font-weight: bold;
  }
  .high-contrast.dark .text-yellow-500 {
    color: #ffff00 !important;
    font-weight: bold;
  }
  .high-contrast .text-blue-500 {
    color: #0000cc !important;
    font-weight: bold;
  }
  .high-contrast.dark .text-blue-500 {
    color: #0099ff !important;
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
  
  { 
    category: "Endpoints de Dados", 
    name: "Ideciclo - Página", 
    url: "https://cms.ameciclo.org/ideciclo",
    description: "Dados da página do Ideciclo"
  },
  
  { 
    category: "APIs Externas", 
    name: "Ideciclo Reviews API", 
    url: "https://api.ideciclo.ameciclo.org/reviews",
    description: "API de avaliações do Ideciclo"
  },
  { 
    category: "APIs Externas", 
    name: "Ideciclo Structures API", 
    url: "https://api.ideciclo.ameciclo.org/structures",
    description: "API de estruturas do Ideciclo"
  },
  { 
    category: "APIs Externas", 
    name: "Garfo - Infraestrutura Cicloviária - Resumo", 
    url: "http://api.garfo.ameciclo.org/cyclist-infra/ways/summary",
    description: "API de resumo da infraestrutura cicloviária"
  },
  { 
    category: "APIs Externas", 
    name: "Garfo - Infraestrutura Cicloviária - Todas as Vias", 
    url: "http://api.garfo.ameciclo.org/cyclist-infra/ways/all-ways",
    description: "API com todas as vias da infraestrutura cicloviária"
  },
  { 
    category: "APIs Externas", 
    name: "Garfo - Cidades", 
    url: "http://api.garfo.ameciclo.org/cities",
    description: "API com dados das cidades"
  },
  { 
    category: "APIs Externas", 
    name: "Garfo - Relações por Cidade", 
    url: "http://api.garfo.ameciclo.org/cyclist-infra/relationsByCity",
    description: "API com relações de infraestrutura por cidade"
  },
  
  { 
    category: "Endpoints de Dados", 
    name: "Plataforma de Dados - DOM", 
    url: "https://cms.ameciclo.org/plataforma-de-dados",
    description: "Dados da plataforma para observatório DOM"
  },
  { 
    category: "Endpoints de Dados", 
    name: "Home - Página Inicial", 
    url: "https://cms.ameciclo.org/home",
    description: "Dados da página inicial"
  },
  { 
    category: "Endpoints de Dados", 
    name: "Perfil Demográfico - Endpoint", 
    url: "https://cms.ameciclo.org/perfil",
    description: "Dados demográficos da região"
  },
  { 
    category: "Endpoints de Dados", 
    name: "Contagens - Endpoint", 
    url: "https://cms.ameciclo.org/contagens",
    description: "Dados de contagens de ciclistas"
  },
  { 
    category: "Endpoints de Dados", 
    name: "Documentos - Página", 
    url: "https://cms.ameciclo.org/documentos",
    description: "Dados da página de documentos"
  },
  { 
    category: "Endpoints de Dados", 
    name: "Estudos e Pesquisas - Endpoint", 
    url: "https://cms.ameciclo.org/documents",
    description: "Documentos de estudos e pesquisas"
  },
  { 
    category: "Endpoints de Dados", 
    name: "Execução Cicloviária - Endpoint", 
    url: "https://cms.ameciclo.org/execucao-cicloviaria",
    description: "Dados de execução de infraestrutura cicloviária"
  },
  { 
    category: "Endpoints de Dados", 
    name: "Projetos - Endpoint", 
    url: "https://cms.ameciclo.org/projects",
    description: "Lista de todos os projetos da organização (API principal)"
  },
  { 
    category: "Endpoints de Dados", 
    name: "Grupos de Trabalho - Endpoint", 
    url: "https://cms.ameciclo.org/workgroups",
    description: "Grupos de trabalho dos projetos"
  },
  { 
    category: "Páginas Principais", 
    name: "Página Inicial", 
    url: "/",
    description: "Landing page principal do site"
  },
  { 
    category: "Páginas Principais", 
    name: "Quem Somos", 
    url: "/quem_somos",
    description: "Informações sobre a organização"
  },
  { 
    category: "Páginas Principais", 
    name: "Agenda", 
    url: "/agenda",
    description: "Eventos e atividades"
  },
  { 
    category: "Páginas Principais", 
    name: "Projetos", 
    url: "/projetos",
    description: "Lista de projetos da organização"
  },
  { 
    category: "Páginas Principais", 
    name: "Contato", 
    url: "/contato",
    description: "Formulário de contato"
  },
  { 
    category: "Páginas Principais", 
    name: "Participe", 
    url: "/participe",
    description: "Como participar da organização"
  },
  { 
    category: "Páginas Principais", 
    name: "Portal de Dados", 
    url: "/dados",
    description: "Portal principal de dados"
  },
  { 
    category: "Páginas Principais", 
    name: "Contagens de Ciclistas", 
    url: "/dados/contagens",
    description: "Dados de contagens de ciclistas"
  },
  { 
    category: "Páginas Principais", 
    name: "Contagem Individual", 
    url: "/contagens/exemplo",
    description: "Página de contagem específica"
  },
  { 
    category: "Páginas Principais", 
    name: "Documentos", 
    url: "/dados/documentos",
    description: "Biblioteca de documentos"
  },
  { 
    category: "Páginas Principais", 
    name: "Ideciclo", 
    url: "/dados/ideciclo",
    description: "Índice de desenvolvimento cicloviário"
  },
  { 
    category: "Páginas Principais", 
    name: "Perfil Demográfico", 
    url: "/dados/perfil",
    description: "Dados demográficos da região"
  },
  { 
    category: "Páginas Principais", 
    name: "Portal Observatório", 
    url: "/observatorio",
    description: "Portal dos observatórios"
  },
  { 
    category: "Páginas Principais", 
    name: "Execução Cicloviária", 
    url: "/observatorio/execucaocicloviaria",
    description: "Monitoramento da execução de projetos cicloviários"
  },
  { 
    category: "Páginas Principais", 
    name: "LOA Clima", 
    url: "/observatorio/loa",
    description: "Lei Orçamentária Anual - Clima"
  },
  { 
    category: "Páginas Principais", 
    name: "DOM - Diário Oficial", 
    url: "/observatorio/dom",
    description: "Monitoramento do Diário Oficial do Município"
  },
  { 
    category: "Páginas Principais", 
    name: "Documentação", 
    url: "/documentacao",
    description: "Documentação técnica da plataforma"
  },
  { 
    category: "Páginas Principais", 
    name: "Status dos Serviços", 
    url: "/status",
    description: "Esta página de monitoramento"
  },

  // Projetos em Andamento
  { 
    category: "Projetos em Andamento", 
    name: "Amigo Moto", 
    url: "/projetos/amigo_moto",
    description: "Projeto em andamento"
  },
  { 
    category: "Projetos em Andamento", 
    name: "História da Ameciclo", 
    url: "/projetos/historia_da_ameciclo",
    description: "Projeto em andamento"
  },
  { 
    category: "Projetos em Andamento", 
    name: "Relatório da Mobilidade Ativa", 
    url: "/projetos/relatorio_da_mobilidade_ativa",
    description: "Projeto em andamento"
  },
  { 
    category: "Projetos em Andamento", 
    name: "Por um Recife sem Mortes no Trânsito", 
    url: "/projetos/por_um_recife_sem_mortes_no_transito",
    description: "Projeto em andamento"
  },
  { 
    category: "Projetos em Andamento", 
    name: "Bota Pra Rodar EN", 
    url: "/projetos/bota_pra_rodar_en",
    description: "Projeto em andamento"
  },
  { 
    category: "Projetos em Andamento", 
    name: "Ideciclo", 
    url: "/projetos/ideciclo",
    description: "Projeto em andamento"
  },
  { 
    category: "Projetos em Andamento", 
    name: "Bota Pra Rodar ES", 
    url: "/projetos/bota_pra_rodar_es",
    description: "Projeto em andamento"
  },
  { 
    category: "Projetos em Andamento", 
    name: "Contagem de Ciclistas", 
    url: "/projetos/contagem_de_ciclistas",
    description: "Projeto em andamento"
  },
  { 
    category: "Projetos em Andamento", 
    name: "Ki-Karro-o-Kê", 
    url: "/projetos/ki-karro-o-ke",
    description: "Projeto em andamento"
  },
  { 
    category: "Projetos em Andamento", 
    name: "Fundo de Ações Livres", 
    url: "/projetos/fundo_de_acoes_livres",
    description: "Projeto em andamento"
  },
  { 
    category: "Projetos em Andamento", 
    name: "Bota Pra Rodar", 
    url: "/projetos/bota_pra_rodar",
    description: "Projeto em andamento"
  },
  { 
    category: "Projetos em Andamento", 
    name: "Bicibot", 
    url: "/projetos/bicibot",
    description: "Projeto em andamento"
  },
  
  // Projetos Finalizados
  { 
    category: "Projetos Finalizados", 
    name: "Escola da Bicicleta", 
    url: "/projetos/escola_da_bicicleta",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "Ciclodados - Plataforma da Mobilidade por Bicicleta do Recife", 
    url: "/projetos/ciclodados_-_a_plataforma_da_mobilidade_por_bicicleta_do_recife",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "Foca na Leitura", 
    url: "/projetos/foca_na_leitura",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "Pedal Popular", 
    url: "/projetos/pedal_popular",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "Ameciclo nas Escolas", 
    url: "/projetos/ameciclo_nas_escolas",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "Desafio Intermodal do Recife", 
    url: "/projetos/desafio_intermodal_do_recife",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "LOA Clima", 
    url: "/projetos/loaclima",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "Diagnóstico Orçamentário Municipal", 
    url: "/projetos/diagnostico_orcamentario_municipal",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "Escola Bike Polo", 
    url: "/projetos/escola_bike_polo",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "Ciclo Integrar", 
    url: "/projetos/ciclo_integrar",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "Ameciclo Debates", 
    url: "/projetos/ameciclo_debates",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "Amecine", 
    url: "/projetos/amecine",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "Bicicletas Coloridas", 
    url: "/projetos/bicicletas_coloridas",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "Pesquisa Perfil do Ciclista", 
    url: "/projetos/pesquisa_perfil_do_ciclista",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "Alinhando as Rodas", 
    url: "/projetos/alinhando_as_rodas",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "Ciclopreto", 
    url: "/projetos/ciclopreto",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "Bike Noronha", 
    url: "/projetos/bike_noronha",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "Doe uma Viagem", 
    url: "/projetos/doe_uma_viagem",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "De Bicicleta ao Trabalho", 
    url: "/projetos/de_bicicleta_ao_trabalho",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "Bicicultura 2017", 
    url: "/projetos/bicicultura_2017",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "Meu Chinelo não é Freio", 
    url: "/projetos/meu_chinelo_nao_e_freio",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "Donde Vem Pronde Vão", 
    url: "/projetos/donde_vem_pronde_vao",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "I Fórum Nordestino da Bicicleta", 
    url: "/projetos/i_forum_nordestino_da_bicicleta",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "GT de Mulheres da Ameciclo", 
    url: "/projetos/gt_de_mulheres_da_ameciclo",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "Bicicleta na Boca do Povo", 
    url: "/projetos/bicicleta_na_boca_do_povo",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "I COLMOB - Conferência Livre de Mobilidade", 
    url: "/projetos/i_colmob_-_conferencia_livre_de_mobilidade",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "Cartilha Mecânica", 
    url: "/projetos/cartilha_mecanica",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "Laboratório de Políticas Ecossociais Revolucionárias", 
    url: "/projetos/laboratorio_de_politicas_ecossociais_revolucionarias",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "Bicicleta nos Planos", 
    url: "/projetos/bicicleta_nos_planos",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "VII Fórum Nordestino da Bicicleta", 
    url: "/projetos/vii_forum_nordestino_da_bicicleta",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "Pesquisa Mobilidade por Bicicleta no Recife", 
    url: "/projetos/pesquisa_mobilidade_por_bicicleta_no_recife",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "Solta o Frei", 
    url: "/projetos/solta_o_frei",
    description: "Projeto finalizado"
  },
  { 
    category: "Projetos Finalizados", 
    name: "Ameciclo Bot", 
    url: "/projetos/ameciclo_bot",
    description: "Projeto finalizado"
  },
  { 
    category: "Serviços Externos", 
    name: "Portal Participe", 
    url: "https://participe.ameciclo.org",
    description: "Portal de participação cidadã"
  },
  { 
    category: "Serviços Externos", 
    name: "Pautas", 
    url: "https://pautas.ameciclo.org",
    description: "Sistema de pautas e reuniões"
  },
  { 
    category: "Serviços Externos", 
    name: "Estatuto", 
    url: "https://estatuto.ameciclo.org",
    description: "Estatuto da organização"
  },
  { 
    category: "Serviços Externos", 
    name: "Drive", 
    url: "https://drive.ameciclo.org",
    description: "Arquivos e documentos compartilhados"
  },
  { 
    category: "Serviços Externos", 
    name: "Ocupe", 
    url: "https://ocupe.ameciclo.org",
    description: "Plataforma de mobilização urbana"
  },
  { 
    category: "Serviços Externos", 
    name: "Associe-se", 
    url: "https://queroser.ameciclo.org",
    description: "Associe-se à Ameciclo"
  },
  { 
    category: "Serviços Externos", 
    name: "Bota Pra Rodar - Site", 
    url: "https://botaprarodar.ameciclo.org",
    description: "Site institucional do projeto Bota Pra Rodar"
  },
  { 
    category: "Serviços Externos", 
    name: "Bota Pra Rodar - Gerenciamento", 
    url: "https://bpr.ameciclo.org",
    description: "Sistema de gerenciamento do Bota Pra Rodar"
  },
  { 
    category: "Serviços Externos", 
    name: "GTS - Sistema de Gestão", 
    url: "https://gts.ameciclo.org",
    description: "Sistema de gestão e controle interno"
  },
  { 
    category: "Desenvolvimento", 
    name: "Deploy de Desenvolvimento", 
    url: "https://ameciclodev.vercel.app",
    description: "Ambiente de desenvolvimento e testes"
  }
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
  const isDev = process.env.NODE_ENV === 'development';
  const timeout = isDev ? 120000 : 60000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: { 
        "Accept-Charset": "utf-8",
        "Content-Type": "text/html; charset=utf-8"
      }
    });
    
    clearTimeout(timeoutId);
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
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    let errorMessage = "Erro desconhecido ao acessar o serviço.";
    if (error.name === 'AbortError') {
      errorMessage = `Timeout: Serviço demorou mais de ${timeout/1000}s para responder`;
    } else if (error.message) {
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
  const [showOfflineServices, setShowOfflineServices] = useState<boolean>(false);
  const [showLoadingServices, setShowLoadingServices] = useState<boolean>(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [retryIntervals, setRetryIntervals] = useState<Record<number, NodeJS.Timeout>>({});


  const checkSingleService = async (service: Service, index: number) => {
    const fullUrl = service.url.startsWith("http") ? service.url : `${origin}${service.url}`;
    const statusData = await checkStatus(fullUrl);
    
    setServices(prev => {
      const updated = [...prev];
      updated[index] = { ...service, ...statusData } as ServiceStatus;
      return updated;
    });
    
    // Se deu timeout, programa nova verificação em 10 segundos
    if (statusData.errorMessage?.includes('Timeout')) {
      const intervalId = setTimeout(() => {
        checkSingleService(service, index);
      }, 10000);
      
      setRetryIntervals(prev => ({ ...prev, [index]: intervalId }));
    } else {
      // Remove interval se serviço voltou a funcionar
      setRetryIntervals(prev => {
        if (prev[index]) {
          clearTimeout(prev[index]);
          const { [index]: removed, ...rest } = prev;
          return rest;
        }
        return prev;
      });
    }
    
    return statusData;
  };

  useEffect(() => {
    const checkAllServices = async () => {
      const promises = initialServices.map((service, index) => 
        checkSingleService(service, index)
      );
      await Promise.allSettled(promises);
    };

    checkAllServices();
    
    // Cleanup intervals on unmount
    return () => {
      Object.values(retryIntervals).forEach(clearTimeout);
    };
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
    document.body.classList.toggle("high-contrast", highContrast);
    let styleElement = document.getElementById("high-contrast-styles");
    if (highContrast && !styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "high-contrast-styles";
      styleElement.innerHTML = highContrastStyles;
      document.head.appendChild(styleElement);
    } else if (!highContrast && styleElement) {
      styleElement.remove();
    }
  }, [highContrast, darkMode]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      // Cleanup retry intervals
      Object.values(retryIntervals).forEach(clearTimeout);
    };
  }, []);

  const categories = Array.from(new Set(services.map((service) => service.category)));
  const totalServices = services.length;
  const onlineServices = services.filter(s => s.status === "OK").length;
  const offlineServices = services.filter(s => s.status === "OFF").length;
  const uptime = totalServices > 0 ? ((onlineServices / totalServices) * 100).toFixed(1) : "0";
  
  // Calcula progresso baseado nos serviços verificados
  const verifiedServices = services.filter(s => s.status !== "LOADING").length;
  const actualProgress = totalServices > 0 ? (verifiedServices / totalServices) * 100 : 0;

  useEffect(() => {
    if (categories.length > 0 && Object.keys(collapsedSections).length === 0) {
      const initialState: Record<string, boolean> = {};
      categories.forEach(category => {
        const categoryServices = services.filter(s => s.category === category);
        const hasSlowServices = categoryServices.some(s => s.responseTime && s.responseTime > 3000 && s.status === "OK");
        initialState[category] = hasSlowServices;
      });
      setCollapsedSections(initialState);
    }
  }, [services, categories, collapsedSections]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const refreshPage = () => {
    window.location.reload();
  };
  
  const refreshOfflineServices = async () => {
    const offlineServices = services
      .map((service, index) => ({ service, index }))
      .filter(({ service }) => service.status === "OFF");
    
    if (offlineServices.length === 0) return;
    
    // Marca serviços offline como LOADING
    setServices(prev => {
      const updated = [...prev];
      offlineServices.forEach(({ index }) => {
        updated[index] = { ...updated[index], status: "LOADING" };
      });
      return updated;
    });
    
    // Verifica apenas os serviços offline
    const promises = offlineServices.map(({ service, index }) => 
      checkSingleService(service, index)
    );
    
    await Promise.allSettled(promises);
    setLastUpdate(new Date());
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="max-w-7xl mx-auto px-4 py-20 content">

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


        <StatusStats 
          services={services} 
          darkMode={darkMode} 
          lastUpdate={lastUpdate} 
          onFilterByStatus={setStatusFilter}
          onClearFilters={() => setStatusFilter("")}
          onRefresh={refreshPage}
          onRefreshOffline={refreshOfflineServices}
          loadingProgress={actualProgress}
        />


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


        {actualProgress < 100 && (
          <div 
            className={`p-4 rounded-lg border mb-6 ${
              darkMode ? "bg-blue-900/30 border-blue-500/30" : "bg-blue-50 border-blue-200"
            }`}
          >
            <div 
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer mb-3"
              onClick={() => setShowLoadingServices(!showLoadingServices)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full flex-shrink-0"></div>
                <span className="text-blue-400 font-medium text-sm sm:text-base truncate">
                  Verificando serviços... ({Math.round(actualProgress)}%)
                </span>
              </div>
              <div className={`transform transition-transform self-end sm:self-auto flex-shrink-0 ${showLoadingServices ? 'rotate-180' : ''}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className={`w-full bg-gray-200 rounded-full h-2 mb-3 overflow-hidden ${
              darkMode ? "bg-gray-700" : "bg-gray-200"
            }`}>
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(actualProgress, 100)}%` }}
              ></div>
            </div>
            {showLoadingServices && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {services.filter(s => s.status === "LOADING").map((service, index) => (
                  <div key={index} className={`flex items-center p-2 rounded ${
                    darkMode ? "bg-blue-800/20" : "bg-blue-100"
                  }`}>
                    <div className="animate-spin w-3 h-3 mr-2 border border-blue-500 border-t-transparent rounded-full flex-shrink-0"></div>
                    <span className="text-sm truncate">{fixEncoding(service.name)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {services.filter(s => s.status === "OFF").length > 0 && (
          <div className={`p-4 rounded-lg border mb-6 ${
            darkMode ? "bg-red-900/30 border-red-500/30" : "bg-red-50 border-red-200"
          }`}>
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowOfflineServices(!showOfflineServices)}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <h3 className={`font-semibold ${darkMode ? "text-red-400" : "text-red-700"}`}>
                  Serviços Indisponíveis ({services.filter(s => s.status === "OFF").length})
                </h3>
              </div>
              <div className={`transform transition-transform ${showOfflineServices ? 'rotate-180' : ''}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex justify-center">
              <button
                onClick={refreshOfflineServices}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  darkMode 
                    ? "bg-red-600 hover:bg-red-700 text-white" 
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                <RefreshIcon className="w-4 h-4" />
                Reverificar ({services.filter(s => s.status === "OFF").length})
              </button>
            </div>
            {showOfflineServices && (
              <div className="mt-4">
                <div className="space-y-4">
                  {Array.from(new Set(services
                    .filter(s => s.status === "OFF")
                    .map(s => s.category)
                  )).map(category => {
                    const categoryServices = services
                      .filter(s => s.status === "OFF" && s.category === category);
                    
                    return (
                      <div key={category}>
                        <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                          {fixEncoding(category)} ({categoryServices.length})
                        </h4>
                        <div className="space-y-2 ml-2">
                          {categoryServices.map((service, index) => (
                            <div key={index} className={`flex justify-between items-center p-2 rounded ${
                              darkMode ? "bg-red-800/20" : "bg-red-100"
                            }`}>
                              <span className="text-sm font-medium">{fixEncoding(service.name)}</span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                darkMode ? "bg-red-600 text-white" : "bg-red-200 text-red-800"
                              }`}>
                                {service.errorMessage || 'Indisponível'}
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


        <div className="space-y-6">
          {categories.map((category) => {
            const filteredServices = services
              .filter((service) => service.category === category)
              .filter((service) => !statusFilter || service.status === statusFilter);
            
            if (filteredServices.length === 0) return null;
            
            const isCollapsed = collapsedSections[category];
            const categoryHasSlowServices = filteredServices.some(s => s.responseTime && s.responseTime > 3000);
            
            return (
              <div key={category} className={`rounded-lg border ${
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}>
                <div className="relative">
                  <div className={`absolute -top-3 right-4 px-2 py-1 rounded text-xs font-medium ${
                    getCategoryType(category) === "backend" 
                      ? (darkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white")
                      : (darkMode ? "bg-green-600 text-white" : "bg-green-500 text-white")
                  }`}>
                    {getCategoryType(category)}
                  </div>
                  <div 
                    className={`p-6 cursor-pointer hover:bg-opacity-80 transition-colors ${
                      categoryHasSlowServices ? (darkMode ? "bg-orange-900/20" : "bg-orange-50") : ""
                    }`}
                    onClick={() => setCollapsedSections(prev => ({ ...prev, [category]: !prev[category] }))}
                  >
                    <div className="flex items-center justify-between">
                      <h2 className={`text-xl font-semibold flex items-center gap-3 ${
                        darkMode ? "text-green-400" : "text-green-700"
                      }`} style={{ fontSize: fontSize + 4 }}>
                        <StatusIcon status={
                          filteredServices.every(s => s.status === "OK") ? "OK" :
                          filteredServices.some(s => s.status === "OFF") ? "OFF" : "LOADING"
                        } />
                        {fixEncoding(category)} ({filteredServices.length})
                        {categoryHasSlowServices && (
                          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" title="Categoria com serviços lentos"></div>
                        )}
                      </h2>
                      <div className={`transform transition-transform ${isCollapsed ? '' : 'rotate-180'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                {!isCollapsed && (
                  <div className="px-6 pb-6">
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
                )}
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