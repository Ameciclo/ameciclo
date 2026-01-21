import { FolderIcon, ComponentIcon, RouteIcon, ApiIcon } from "~/components/Commom/Icones/DocumentationIcons";
import { DocumentationComponentProps } from "./types";

export default function EstruturaProjeto({ darkMode = true, fontSize = 16 }: DocumentationComponentProps) {
  return (
    <section id="estrutura" className="mb-12">
      <h2 className={`text-2xl lg:text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-4 lg:mb-6 flex items-center gap-3`} style={{ fontSize: fontSize + 8 }}>
        <FolderIcon className="w-6 h-6 lg:w-8 lg:h-8" />
        Estrutura do Projeto
      </h2>
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-4 lg:p-6 border`}>
        <div className={`${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-100 border-gray-300'} p-4 rounded border mb-6`}>
          <pre className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-700'} overflow-x-auto`} style={{ fontSize: fontSize - 2 }}>
{`ameciclo/
├── app/
│   ├── components/          # 182+ componentes React organizados por funcionalidade
│   │   ├── Commom/         # Componentes globais reutilizáveis
│   │   │   ├── Navbar.tsx, Footer.tsx, Banner.tsx, Breadcrumb.tsx
│   │   │   ├── AccessibilityControls.tsx, ChangeThemeButton.tsx
│   │   │   ├── ErrorBoundary.tsx, ApiStatusHandler.tsx
│   │   │   ├── Charts/, Maps/, Table/, Icones/
│   │   │   └── GoogleAnalytics.tsx, SEO.tsx
│   │   ├── Agenda/         # FullCalendar com Google Calendar API
│   │   ├── Biciclopedia/   # FAQ com busca e accordion
│   │   ├── CicloDados/     # Plataforma de dados colaborativos
│   │   ├── Contagens/      # Visualização de contagens de ciclistas
│   │   ├── Dados/          # Hub central de dados
│   │   ├── Documentacao/   # Esta documentação (11 componentes)
│   │   ├── ExecucaoCicloviaria/ # Execução de infraestrutura
│   │   ├── Ideciclo/       # Índice de ciclabilidade
│   │   ├── PaginaInicial/  # Componentes da home
│   │   ├── Projetos/       # Projetos da organização
│   │   ├── QuemSomos/      # Sobre a Ameciclo
│   │   ├── Samu/           # Dados de chamados do SAMU
│   │   ├── SinistrosFatais/ # Análise de sinistros fatais
│   │   └── ViasInseguras/  # Ranking de vias perigosas
│   ├── routes/             # 27 rotas (file-based routing do Remix)
│   │   ├── _index.tsx      # Home com seções dinâmicas
│   │   ├── agenda.tsx, biciclopedia.tsx, contato.tsx
│   │   ├── dados._index.tsx, dados.ciclodados._index.tsx
│   │   ├── dados.contagens.$slug.tsx, dados.via.$slug.tsx
│   │   ├── dados.ideciclo.$id.tsx, dados.sinistros-fatais.tsx
│   │   ├── dados.vias-inseguras.tsx, dados.samu.tsx
│   │   ├── projetos.$projeto.tsx, quemsomos.tsx
│   │   └── documentacao._index.tsx # Esta página
│   ├── loader/             # Loaders para SSR e data fetching
│   │   ├── home.ts, agenda.ts, projetos.ts, quemsomos.ts
│   │   ├── dados.contagens.ts, dados.ideciclo.ts
│   │   ├── dados.sinistros-fatais.ts, dados.samu.ts
│   │   └── compareContagensLoader.ts
│   ├── services/           # Serviços e APIs
│   │   ├── fetchWithTimeout.ts  # Fetch com timeout e fallback
│   │   ├── cmsApi.ts            # Integração com Strapi CMS
│   │   ├── contagens.service.ts # Serviço de contagens
│   │   ├── ciclodados.service.ts, streets.service.ts
│   │   ├── cache.ts, staticFallbacks.ts
│   │   └── SinistrosFatais/
│   ├── contexts/           # React Context API
│   │   └── ApiStatusContext.tsx # Status global de APIs
│   ├── providers/          # Providers globais
│   │   └── QueryProvider.tsx    # TanStack Query
│   ├── hooks/              # Custom hooks
│   │   ├── useApiWithAlert.ts, useFocusTrap.ts
│   ├── utils/              # Utilitários
│   │   ├── mapbox.server.ts, slugify.ts, translations.ts
│   │   └── contagens/
│   ├── types/              # TypeScript types
│   ├── root.tsx            # Root component com layout global
│   ├── entry.client.tsx    # Entry point do cliente
│   ├── entry.server.tsx    # Entry point do servidor
│   └── globals.css         # Estilos globais
├── public/                 # Assets estáticos
│   ├── icons/              # Ícones SVG organizados por seção
│   ├── ideciclo/, images/, pages_covers/
│   ├── data/               # GeoJSON e dados estáticos
│   └── dbs/                # Databases JSON locais
├── docs/                   # Documentação de APIs
├── .env                    # Variáveis de ambiente
├── vite.config.ts          # Configuração Vite + Remix
├── tailwind.config.ts      # Configuração Tailwind CSS
├── tsconfig.json           # Configuração TypeScript
├── vercel.json             # Deploy Vercel
└── package.json            # Dependências e scripts`}
          </pre>
        </div>
        
        <h3 className={`text-xl font-semibold mb-4`} style={{ fontSize: fontSize + 4 }}>Detalhamento das Pastas</h3>
        <div className="space-y-4">
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3 flex items-center gap-2`} style={{ fontSize: fontSize }}>
              <ComponentIcon className="w-5 h-5" />
              app/components/Commom/
            </h4>
            <p className="text-sm mb-3" style={{ fontSize: fontSize - 2 }}>Pasta de <strong>componentes reutilizáveis</strong> usados em toda a aplicação:</p>
            <ul className="text-sm space-y-1 ml-4" style={{ fontSize: fontSize - 2 }}>
              <li>• <strong>Navbar.tsx</strong> - Navegação responsiva com menu mobile</li>
              <li>• <strong>Footer.tsx</strong> - Rodapé com links e redes sociais</li>
              <li>• <strong>Banner.tsx</strong> - Banners de páginas com imagens otimizadas</li>
              <li>• <strong>Breadcrumb.tsx</strong> - Navegação estrutural (SEO)</li>
              <li>• <strong>AccessibilityControls.tsx</strong> - Controles WCAG (fonte, contraste)</li>
              <li>• <strong>ChangeThemeButton.tsx</strong> - Toggle dark/light mode</li>
              <li>• <strong>ErrorBoundary.tsx</strong> - Tratamento de erros React</li>
              <li>• <strong>ApiStatusHandler.tsx</strong> - Monitoramento de APIs</li>
              <li>• <strong>Charts/</strong> - Componentes Highcharts reutilizáveis</li>
              <li>• <strong>Maps/</strong> - Componentes Mapbox GL reutilizáveis</li>
              <li>• <strong>Table/</strong> - Tabelas com filtros e ordenação</li>
              <li>• <strong>GoogleAnalytics.tsx</strong> - GA4 tracking</li>
            </ul>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3 flex items-center gap-2`} style={{ fontSize: fontSize }}>
              <RouteIcon className="w-5 h-5" />
              app/routes/
            </h4>
            <p className="text-sm mb-3" style={{ fontSize: fontSize - 2 }}>Sistema de roteamento baseado em arquivos do Remix:</p>
            <ul className="text-sm space-y-1 ml-4" style={{ fontSize: fontSize - 2 }}>
              <li>• <strong>_index.tsx</strong> - Home (banner, carrossel, dados, CTA)</li>
              <li>• <strong>dados._index.tsx</strong> - Hub de dados com cards</li>
              <li>• <strong>dados.ciclodados._index.tsx</strong> - Plataforma colaborativa</li>
              <li>• <strong>dados.contagens.$slug.tsx</strong> - Contagem individual com gráficos</li>
              <li>• <strong>dados.contagens.$slug.$compareSlug.tsx</strong> - Comparação</li>
              <li>• <strong>dados.ideciclo.$id.tsx</strong> - Detalhes do Ideciclo</li>
              <li>• <strong>dados.sinistros-fatais.tsx</strong> - Análise de sinistros</li>
              <li>• <strong>dados.vias-inseguras.tsx</strong> - Ranking de vias</li>
              <li>• <strong>dados.via.$slug.tsx</strong> - Detalhes de via individual</li>
              <li>• <strong>dados.samu.tsx</strong> - Chamados SAMU com mapa coroplético</li>
              <li>• <strong>projetos.$projeto.tsx</strong> - Projeto individual do CMS</li>
              <li>• <strong>biciclopedia.$question.tsx</strong> - FAQ individual</li>
            </ul>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3 flex items-center gap-2`} style={{ fontSize: fontSize }}>
              <ApiIcon className="w-5 h-5" />
              app/loader/
            </h4>
            <p className="text-sm mb-3" style={{ fontSize: fontSize - 2 }}>Funções para carregamento de dados do servidor:</p>
            <ul className="text-sm space-y-1 ml-4" style={{ fontSize: fontSize - 2 }}>
              <li>• <strong>home.ts</strong> - Dados da home (projetos, contagens)</li>
              <li>• <strong>dados.contagens.ts</strong> - Lista de contagens da API</li>
              <li>• <strong>compareContagensLoader.ts</strong> - Comparação de contagens</li>
              <li>• <strong>dados.ideciclo.ts</strong> - Dados do índice de ciclabilidade</li>
              <li>• <strong>dados.sinistros-fatais.ts</strong> - Dados de sinistros</li>
              <li>• <strong>dados.vias-inseguras.ts</strong> - Ranking de vias</li>
              <li>• <strong>dados.samu.ts</strong> - Chamados do SAMU</li>
              <li>• <strong>projetos.ts</strong> - Projetos do CMS Strapi</li>
              <li>• <strong>agenda.ts</strong> - Google Calendar API</li>
              <li>• <strong>quemsomos.ts</strong> - Dados da página institucional</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}