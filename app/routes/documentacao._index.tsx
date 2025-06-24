import { useState, useEffect, useMemo } from "react";
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
  ArrowUpIcon,
} from "~/components/Commom/Icones/DocumentationIcons";
import DocumentationSidebar from "~/components/DocumentationSidebar";
import DocumentationBanner from "~/components/DocumentationBanner";
import DocumentationSearchBar from "~/components/DocumentationSearchBar";
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
  const [isSearchFloating, setIsSearchFloating] = useState(false);

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

  const navigationItems = useMemo(() => [
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
  ], []);

  const searchData = useMemo(() => [
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
  ], []);

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
  }, [searchTerm, searchData]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
      setIsScrolled(window.scrollY > 0);
      
      // Controlar se a busca deve flutuar (quando chegar perto da navbar)
      const searchElement = document.getElementById('search-container');
      if (searchElement) {
        const rect = searchElement.getBoundingClientRect();
        setIsSearchFloating(rect.top <= 100);
      }

      // Detectar seção ativa - usando requestAnimationFrame para melhor performance
      requestAnimationFrame(() => {
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
      });
    };

    // Throttle para melhorar performance
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollListener, { passive: true });
    return () => window.removeEventListener('scroll', scrollListener);
  }, [navigationItems]);

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
    <div className="min-h-screen bg-gray-900 text-gray-100 pt-16">
      {isSearchFloating && (
        <div className="fixed top-20 right-4 z-40">
          <DocumentationSearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchResults={searchResults}
            onResultClick={scrollToSection}
            placeholder="Buscar..."
            width="w-64"
          />
        </div>
      )}

      <DocumentationBanner 
        title="Documentação" 
        subtitle="Guia completo para desenvolvedores da plataforma Ameciclo" 
      />

      <div className="flex max-w-7xl mx-auto px-4">
        <DocumentationSidebar
          navigationItems={navigationItems}
          activeSection={activeSection}
          isSidebarCollapsed={isSidebarCollapsed}
          isMobile={isMobile}
          isScrolled={isScrolled}
          onItemClick={handleSidebarItemClick}
        />

        <div className="flex-1 p-4">
          <div id="search-container" className="flex justify-between items-start mb-8">
            <div></div>
            <DocumentationSearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchResults={searchResults}
              onResultClick={scrollToSection}
              placeholder="Buscar na documentação..."
              width="w-80"
            />
          </div>
          
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