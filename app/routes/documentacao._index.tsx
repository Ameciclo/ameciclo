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

// Adicione este CSS para aplicar o alto contraste quando ativado
const highContrastStyles = `
  .high-contrast {
    filter: contrast(1.5);
  }
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
  /* Exceções para os controles de acessibilidade */
  .high-contrast .accessibility-controls {
    filter: none !important;
  }
  .high-contrast .accessibility-controls * {
    color: inherit !important;
    background-color: inherit !important;
    border-color: inherit !important;
    filter: none !important;
  }
`;
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
  const [fontSize, setFontSize] = useState<number>(16);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [showAccessibilityMenu, setShowAccessibilityMenu] = useState<boolean>(false);

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
    <div className={`min-h-screen pt-16 transition-colors duration-300 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
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
        darkMode={darkMode}
      />

      <div className="flex max-w-7xl mx-auto px-4 content">
        <DocumentationSidebar
          navigationItems={navigationItems}
          activeSection={activeSection}
          isSidebarCollapsed={isSidebarCollapsed}
          isMobile={isMobile}
          isScrolled={isScrolled}
          onItemClick={handleSidebarItemClick}
          darkMode={darkMode}
          fontSize={fontSize}
        />

        <div className="flex-1 p-4">
          <VisaoGeral
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchResults={searchResults}
            scrollToSection={scrollToSection}
          />
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
      {/* Accessibility Button */}
      <div className="fixed top-1/2 right-0 transform -translate-y-1/2 z-40 accessibility-controls">
        <button
          onClick={() => setShowAccessibilityMenu(!showAccessibilityMenu)}
          className={`p-3 rounded-l-lg shadow-lg transition-colors flex items-center justify-center ${
            darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-gray-100"
          }`}
          aria-label="Opções de acessibilidade"
        >
          <ConfigIcon className="w-6 h-6 text-blue-500" />
        </button>
      </div>

      {/* Theme Toggle Button */}
      <div className="fixed top-1/2 right-0 transform -translate-y-1/2 translate-y-16 z-40 accessibility-controls">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-3 rounded-l-lg shadow-lg transition-colors flex items-center justify-center ${
            darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-gray-100"
          }`}
          aria-label={`Mudar para modo ${darkMode ? "claro" : "escuro"}`}
        >
          {darkMode ? "🌞" : "🌙"}
        </button>
      </div>

      {/* Accessibility Menu */}
      {showAccessibilityMenu && (
        <div className="fixed top-1/2 right-14 transform -translate-y-1/2 z-40 accessibility-controls">
          <div className={`p-3 rounded-lg border shadow-lg ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className="text-xs font-medium mb-2">Acessibilidade:</div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
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
                <span className="text-xs">Tamanho do texto</span>
              </div>
              <button 
                onClick={() => setHighContrast(!highContrast)} 
                className={`px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-2 ${
                  highContrast 
                    ? "bg-yellow-500 text-black" 
                    : darkMode 
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-200" 
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
                aria-label="Alternar alto contraste"
              >
                <span className={`w-3 h-3 rounded-full ${highContrast ? "bg-black" : "bg-gray-400"}`}></span>
                Alto contraste {highContrast ? "ON" : "OFF"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50 accessibility-controls"
          aria-label="Voltar ao topo"
        >
          <ArrowUpIcon className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}