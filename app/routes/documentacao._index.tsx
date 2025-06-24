import { useState, useEffect } from "react";
import { MetaFunction } from "@remix-run/node";
import {
  OverviewIcon,
  InstallIcon,
  FolderIcon,
  ComponentIcon,
  RouteIcon,
  ApiIcon,
  TestIcon,
  ConfigIcon,
  TroubleshootIcon,
  DeployIcon,
  ContributeIcon,
  SearchIcon,
  ArrowUpIcon,
  HomeIcon,
} from "~/components/Commom/Icones/DocumentationIcons";
import VisaoGeral from "~/components/Documentacao/VisaoGeral";
import Instalacao from "~/components/Documentacao/Instalacao";
import EstruturaProjeto from "~/components/Documentacao/EstruturaProjeto";
import Componentes from "~/components/Documentacao/Componentes";
import Deploy from "~/components/Documentacao/Deploy";
import Rotas from "~/components/Documentacao/Rotas";
import API from "~/components/Documentacao/API";
import Contribuicao from "~/components/Documentacao/Contribuicao";
import Testes from "~/components/Documentacao/Testes";
import Configuracao from "~/components/Documentacao/Configuracao";
import Solucoes from "~/components/Documentacao/Solucoes";

export const meta: MetaFunction = () => {
  return [
    { title: "Documentação - Ameciclo" },
    { name: "description", content: "Documentação completa do projeto Ameciclo para desenvolvedores" },
  ];
};

export default function Docs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigationItems = [
    { id: 'visao-geral', title: 'Visão Geral', icon: OverviewIcon },
    { id: 'instalacao', title: 'Instalação', icon: InstallIcon },
    { id: 'estrutura', title: 'Estrutura do Projeto', icon: FolderIcon },
    { id: 'componentes', title: 'Componentes', icon: ComponentIcon },
    { id: 'rotas', title: 'Rotas', icon: RouteIcon },
    { id: 'api', title: 'API', icon: ApiIcon },
    { id: 'testes', title: 'Testes', icon: TestIcon },
    { id: 'configuracao', title: 'Configuração', icon: ConfigIcon },
    { id: 'solucoes', title: 'Soluções', icon: TroubleshootIcon },
    { id: 'deploy', title: 'Deploy', icon: DeployIcon },
    { id: 'contribuicao', title: 'Contribuição', icon: ContributeIcon }
  ];

  const searchData = [
    { id: "visao-geral", title: "Visão Geral", content: "Remix TypeScript mobilidade ativa Recife" },
    { id: "instalacao", title: "Instalação", content: "npm install desenvolvimento setup" },
    { id: "estrutura", title: "Estrutura do Projeto", content: "pastas arquivos componentes routes" },
    { id: "componentes", title: "Componentes", content: "React componentes reutilizáveis" },
    { id: "rotas", title: "Rotas", content: "Remix routing páginas navegação" },
    { id: "api", title: "API", content: "endpoints dados contagens" },
    { id: "testes", title: "Testes", content: "testing jest cypress" },
    { id: "configuracao", title: "Configuração", content: "environment variables config" },
    { id: "solucoes", title: "Soluções", content: "problemas erros soluções" },
    { id: "deploy", title: "Deploy", content: "produção build deployment" },
    { id: "contribuicao", title: "Contribuição", content: "git github pull request" }
  ];

  useEffect(() => {
    if (searchTerm.length > 2) {
      const results = searchData.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
      setIsScrolled(window.scrollY > 0);

      // Detectar seção ativa
      const sections = navigationItems.map(item => item.id);
      const currentSection = sections.find(sectionId => {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });

      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSidebarItemClick = (sectionId: string) => {
    if (isMobile && isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
    } else {
      scrollToSection(sectionId);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
      setSearchResults([]);
      setSearchTerm("");
      if (isMobile) {
        setIsSidebarCollapsed(true);
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mt-22 min-h-screen bg-gray-900 text-gray-100">
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar na documentação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => scrollToSection(result.id)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-700 border-b border-gray-600 last:border-b-0"
                  >
                    <div className="font-medium text-green-400">{result.title}</div>
                    <div className="text-sm text-gray-400 truncate">{result.content}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto">
        <div className={`${isSidebarCollapsed ? 'w-16' : isMobile ? 'w-1/3' : 'w-80'} bg-gray-800 min-h-screen p-3 lg:p-6 sticky top-20 overflow-y-auto max-h-screen transition-all duration-300 z-50 ${isMobile && !isSidebarCollapsed ? 'fixed' : ''
          }`}>
          <nav className={`space-y-2 ${isScrolled ? 'mt-0' : 'mt-20'} transition-all`}>
            {!isSidebarCollapsed && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-green-400 duration-300">Navegação</h2>
                <a href="/" className="text-sm text-gray-400 hover:text-green-400 transition-colors flex items-center gap-1">
                  <HomeIcon className="w-3 h-3" />
                  Voltar ao site
                </a>
              </div>
            )}
            {isSidebarCollapsed && (
              <div className="mb-4 flex justify-center">
                <a href="/" className="text-gray-400 hover:text-green-400 transition-colors">
                  <HomeIcon className="w-5 h-5" />
                </a>
              </div>
            )}

            <div className="space-y-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSidebarItemClick(item.id)}
                    className={`w-full text-left px-3 py-3 rounded hover:bg-gray-700 transition-colors flex items-center gap-3 ${activeSection === item.id
                        ? 'bg-gray-700 text-green-400 border-l-2 border-green-400'
                        : 'text-gray-300 hover:text-white'
                      } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                    title={isSidebarCollapsed ? item.title : ''}
                  >
                    <IconComponent className={`${isSidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
                    {!isSidebarCollapsed && <span className="text-sm">{item.title}</span>}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        <div className="flex-1 p-4">
          <VisaoGeral />
          <Instalacao />
          <EstruturaProjeto />
          <Componentes />
          <Rotas />
          <API />
          <Testes />
          <Configuracao />
          <Solucoes />
          <Deploy />
          <Contribuicao />
        </div>
      </div>
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