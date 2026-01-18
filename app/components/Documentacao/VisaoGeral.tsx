import { OverviewIcon, StatusIcon } from "~/components/Commom/Icones/DocumentationIcons";
import DocumentationSearchBar from "~/components/Documentacao/DocumentationSearchBar";

interface VisaoGeralProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: any[];
  scrollToSection: (sectionId: string) => void;
  darkMode?: boolean;
  fontSize?: number;
}

export default function VisaoGeral({ searchTerm, setSearchTerm, searchResults, scrollToSection, darkMode = true, fontSize = 16 }: VisaoGeralProps) {
  return (
    <section id="visao-geral" className="mb-12">
      <div className="flex justify-between items-center mb-4 lg:mb-6">
        <h2 className={`text-2xl lg:text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-700'} flex items-center gap-3`} style={{ fontSize: fontSize + 8 }}>
          <OverviewIcon className="w-8 h-8" />
          Visão Geral
        </h2>
        <div id="search-container">
          <DocumentationSearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchResults={searchResults}
            onResultClick={scrollToSection}
            placeholder="Buscar na documentação..."
            width="w-80"
            darkMode={darkMode}
          />
        </div>
      </div>
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-4 lg:p-6 border`}>
        <p className="text-lg mb-4" style={{ fontSize: fontSize + 2 }}>
          O projeto <strong className={darkMode ? 'text-green-400' : 'text-green-700'}>Ameciclo</strong> é uma plataforma web full-stack desenvolvida com <strong>Remix</strong>, <strong>TypeScript</strong> e <strong>React</strong>
          que fornece dados abertos sobre mobilidade ativa na região metropolitana do Recife.
        </p>
        <p className="mb-4" style={{ fontSize: fontSize }}>
          A plataforma integra múltiplas fontes de dados (APIs externas, CMS Strapi, dados estáticos) e oferece:
          visualizações interativas com mapas (Mapbox), gráficos (Highcharts), calendários (FullCalendar),
          observatórios especializados (Ideciclo, Sinistros Fatais, Vias Inseguras, SAMU, CicloDados),
          sistema de contagens de ciclistas, documentos públicos, projetos da organização e ferramentas de acessibilidade.
        </p>
        <div className={`${darkMode ? 'bg-blue-900/30 border-blue-500/30' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4 mb-6`}>
          <div className="flex items-center gap-2 mb-2">
            <h4 className={`font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-700'}`} style={{ fontSize: fontSize + 2 }}>Monitoramento em Tempo Real</h4>
          </div>
          <p className="text-sm mb-3" style={{ fontSize: fontSize - 2 }}>
            A plataforma conta com uma página dedicada ao monitoramento do status de todos os serviços e páginas em tempo real.
          </p>
          <a
            href="/status"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <StatusIcon className="w-4 h-4" />
            Ver Status dos Serviços
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-2`} style={{ fontSize: fontSize }}>Arquitetura</h4>
            <p className="text-sm" style={{ fontSize: fontSize - 2 }}>SSR com Remix, 27 rotas, 182+ componentes, deploy Vercel</p>
          </div>
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-2`} style={{ fontSize: fontSize }}>Stack Principal</h4>
            <p className="text-sm" style={{ fontSize: fontSize - 2 }}>Remix 2.16, React 18, TypeScript 5, Vite 5, Tailwind CSS 3</p>
          </div>
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-2`} style={{ fontSize: fontSize }}>Recursos</h4>
            <p className="text-sm" style={{ fontSize: fontSize - 2 }}>Mapas, gráficos, calendários, busca, acessibilidade WCAG</p>
          </div>
        </div>
      </div>
    </section>
  );
}