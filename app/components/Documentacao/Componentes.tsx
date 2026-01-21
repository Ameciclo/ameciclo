import { ComponentIcon } from "~/components/Commom/Icones/DocumentationIcons";
import { DocumentationComponentProps } from "./types";

export default function Componentes({ darkMode = true, fontSize = 16 }: DocumentationComponentProps) {
  return (
    <section id="componentes" className="mb-12">
      <h2 className={`text-2xl lg:text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-4 lg:mb-6 flex items-center gap-3`} style={{ fontSize: fontSize + 8 }}>
        <ComponentIcon className="w-6 h-6 lg:w-8 lg:h-8" />
        Componentes
      </h2>
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-4 lg:p-6 border`}>
        <p className="mb-6" style={{ fontSize: fontSize }}>Os componentes são organizados por funcionalidade e reutilizabilidade:</p>
        
        <div className="space-y-6">
          <div>
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3`} style={{ fontSize: fontSize + 4 }}>Organização por Funcionalidade</h3>
            <div className={`${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-100 border-gray-300'} p-4 rounded border mb-4`}>
              <code className={`${darkMode ? 'text-green-300' : 'text-green-700'}`} style={{ fontSize: fontSize - 2 }}>
app/components/
├── Commom/              # 50+ componentes globais
├── Agenda/              # 2 componentes (EventCalendar, Loading)
├── Biciclopedia/        # 3 componentes (FAQ, Search, Accordion)
├── Charts/              # 4 componentes de gráficos
├── CicloDados/          # 20+ componentes (MapView, Sidebar, Filters)
├── Contagens/           # 9 componentes (Tabelas, Gráficos, Mapas)
├── Dados/               # 3 componentes (Loading, Grid, Boxes)
├── Documentacao/        # 11 componentes desta página
├── Documentos/          # 2 componentes (Lista, Sessão)
├── ExecucaoCicloviaria/ # 3 componentes (Stats, Charts, Loading)
├── Ideciclo/            # 10 componentes (Tabelas, Mapas, Stats)
├── PaginaInicial/       # 7 componentes (Banner, Carousel, Sections)
├── Perfil/              # 1 componente (Dashboard)
├── Projetos/            # 7 componentes (Cards, Search, Language)
├── QuemSomos/           # 3 componentes (Tabs, Modal, Loading)
├── Samu/                # 2 componentes (Map, ClientSide)
├── SinistrosFatais/     # 7 componentes (Matrix, Filters, Cards)
└── ViasInseguras/       # 12 componentes (Map, Ranking, Charts)
              </code>
            </div>
          </div>
          
          <div>
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3`} style={{ fontSize: fontSize + 4 }}>Componentes Principais</h3>
            
            <div className="space-y-3">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
                <h4 className={`font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-700'} mb-2`} style={{ fontSize: fontSize }}>CicloDados (Plataforma Colaborativa)</h4>
                <p className="text-sm mb-2" style={{ fontSize: fontSize - 2 }}>Sistema completo de visualização de dados com:</p>
                <ul className="text-sm space-y-1 ml-4" style={{ fontSize: fontSize - 2 }}>
                  <li>• MapView.tsx - Mapa interativo Mapbox com layers</li>
                  <li>• LeftSidebar.tsx, RightSidebar.tsx - Painéis laterais</li>
                  <li>• FilterSection.tsx - Filtros avançados</li>
                  <li>• FloatingChat.tsx - Chat integrado</li>
                  <li>• MuralView.tsx - Visualização tipo mural</li>
                </ul>
              </div>

              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
                <h4 className={`font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-700'} mb-2`} style={{ fontSize: fontSize }}>ViasInseguras (Análise de Vias)</h4>
                <p className="text-sm mb-2" style={{ fontSize: fontSize - 2 }}>Sistema de ranking e análise temporal:</p>
                <ul className="text-sm space-y-1 ml-4" style={{ fontSize: fontSize - 2 }}>
                  <li>• ViasInsegurasMap.tsx - Mapa com heatmap</li>
                  <li>• ViasRankingTable.tsx - Tabela ordenada</li>
                  <li>• TemporalAnalysis.tsx - Análise temporal</li>
                  <li>• ConcentrationChart.tsx - Gráficos de concentração</li>
                  <li>• ViaSearch.tsx - Busca com autocomplete</li>
                </ul>
              </div>

              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
                <h4 className={`font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-700'} mb-2`} style={{ fontSize: fontSize }}>Contagens (Visualização de Dados)</h4>
                <p className="text-sm mb-2" style={{ fontSize: fontSize - 2 }}>Componentes para contagens de ciclistas:</p>
                <ul className="text-sm space-y-1 ml-4" style={{ fontSize: fontSize - 2 }}>
                  <li>• CountsMap.tsx - Mapa de pontos de contagem</li>
                  <li>• HourlyCyclistsChart.tsx - Gráfico por hora</li>
                  <li>• FlowContainer.tsx - Fluxo de ciclistas</li>
                  <li>• CountingComparisionTable.tsx - Comparação</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3`} style={{ fontSize: fontSize + 4 }}>Exemplo de Uso</h3>
            <div className={`${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-100 border-gray-300'} p-4 rounded border`}>
              <code className={`${darkMode ? 'text-green-300' : 'text-green-700'}`} style={{ fontSize: fontSize - 2 }}>
{`import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { CountsMap } from "~/components/Contagens/CountsMap";

export default function ContagensPage() {
  return (
    <>
      <Banner image="/contagens.webp" alt="Contagens" />
      <Breadcrumb label="Contagens" slug="/dados/contagens" />
      <CountsMap data={counts} />
    </>
  );
}`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}