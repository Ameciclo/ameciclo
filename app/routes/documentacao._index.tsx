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
  CheckIcon,
} from "~/components/Commom/Icones/DocumentationIcons";


const highContrastStyles = `
  .high-contrast {
    background-color: #fff !important;
    color: #000 !important;
  }
  .high-contrast * {
    color: #000 !important;
    background-color: #fff !important;
    border-color: #000 !important;
  }
  .high-contrast.dark {
    background-color: #000 !important;
    color: #fff !important;
  }
  .high-contrast.dark * {
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
import DocumentationSidebar from "~/components/Documentacao/DocumentationSidebar";
import DocumentationBanner from "~/components/Documentacao/DocumentationBanner";
import DocumentationSearchBar from "~/components/Documentacao/DocumentationSearchBar";
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
import BoasPraticas from "~/components/Documentacao/BoasPraticas";
import AccessibilityControls from "~/components/Commom/AccessibilityControls";
import ChangeThemeButton from "~/components/Commom/ChangeThemeButton";

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
    { id: 'contribuicao', title: 'Contribuição', icon: ContributeIcon },
    { id: 'boas-praticas', title: 'Boas Práticas', icon: CheckIcon }
  ], []);

  const searchData = useMemo(() => [
    { id: "visao-geral", title: "Visão Geral", content: "Remix TypeScript mobilidade ativa Recife plataforma web framework React SSR" },
    { id: "instalacao", title: "Instalação", content: "npm install desenvolvimento setup Node.js yarn git clone repositório dependências" },
    { id: "estrutura", title: "Estrutura do Projeto", content: "pastas arquivos componentes routes app public build assets styles" },
    { id: "componentes", title: "Componentes", content: "React componentes reutilizáveis Breadcrumb Header Footer Sidebar Navigation Menu Button Card Modal" },
    { id: "rotas", title: "Rotas", content: "Remix routing páginas navegação loader action params slug dynamic routes nested" },
    { id: "api", title: "API", content: "endpoints dados contagens cyclist-counts cms strapi fetch timeout" },
    { id: "testes", title: "Testes", content: "testing jest cypress eslint typecheck lint qualidade código" },
    { id: "configuracao", title: "Configuração", content: "environment variables config .env tailwind analytics google" },
    { id: "solucoes", title: "Soluções", content: "problemas erros soluções troubleshooting debug port timeout module not found" },
    { id: "deploy", title: "Deploy", content: "produção build deployment npm start servidor dependências framework" },
    { id: "contribuicao", title: "Contribuição", content: "git github pull request fork clone commit push issues contribuir" },
    { id: "boas-praticas", title: "Boas Práticas", content: "loaders servers cores padrão cards bordas fontes estrutura pastas arquivos componentes" }
  ], []);

  useEffect(() => {
    if (searchTerm.length > 2) {
      const searchLower = searchTerm.toLowerCase();
      const results = searchData.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(searchLower);
        const contentMatch = item.content.toLowerCase().includes(searchLower);
        const wordsMatch = searchLower.split(' ').some(word => 
          item.title.toLowerCase().includes(word) || 
          item.content.toLowerCase().includes(word)
        );
        return titleMatch || contentMatch || wordsMatch;
      }).sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(searchLower);
        const bTitle = b.title.toLowerCase().includes(searchLower);
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
        return 0;
      });
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, searchData]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
      setIsScrolled(window.scrollY > 0);


      const searchElement = document.getElementById('search-container');
      if (searchElement) {
        const rect = searchElement.getBoundingClientRect();
        setIsSearchFloating(rect.top <= 100);
      }


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
            darkMode={darkMode}
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
            darkMode={darkMode}
            fontSize={fontSize}
          />
          <Instalacao darkMode={darkMode} fontSize={fontSize} />
          <EstruturaProjeto darkMode={darkMode} fontSize={fontSize} />
          <Componentes darkMode={darkMode} fontSize={fontSize} />
          <Rotas darkMode={darkMode} fontSize={fontSize} />
          <API darkMode={darkMode} fontSize={fontSize} />
          <Testes darkMode={darkMode} fontSize={fontSize} />
          <Configuracao darkMode={darkMode} fontSize={fontSize} />
          <Solucoes darkMode={darkMode} fontSize={fontSize} />
          <Deploy darkMode={darkMode} fontSize={fontSize} />
          <Contribuicao darkMode={darkMode} fontSize={fontSize} />
          <BoasPraticas darkMode={darkMode} fontSize={fontSize} />
        </div>
      </div>
      <AccessibilityControls
        darkMode={darkMode}
        fontSize={fontSize}
        setFontSize={setFontSize}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        showAccessibilityMenu={showAccessibilityMenu}
        setShowAccessibilityMenu={setShowAccessibilityMenu}
        showScrollTop={showScrollTop}
        onScrollTop={scrollToTop}
      />
      <ChangeThemeButton
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    </div>
  );
}