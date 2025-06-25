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
│   ├── components/          # Componentes React organizados por funcionalidade
│   │   ├── Commom/         # Componentes reutilizáveis (Navbar, Footer, Banner, etc.)
│   │   │   ├── Navbar.tsx  # Barra de navegação principal
│   │   │   ├── Footer.tsx  # Rodapé do site
│   │   │   ├── Banner.tsx  # Banner de páginas
│   │   │   ├── Breadcrumb.tsx # Navegação estrutural
│   │   │   └── Icones/     # Ícones SVG personalizados
│   │   ├── Agenda/         # Componentes específicos da agenda
│   │   ├── Contagens/      # Componentes para visualização de contagens
│   │   ├── Dados/          # Componentes da seção de dados
│   │   ├── Documentacao/   # Componentes da documentação
│   │   ├── Projetos/       # Componentes da seção de projetos
│   │   └── QuemSomos/      # Componentes da página "Quem Somos"
│   ├── routes/             # Rotas da aplicação (file-based routing)
│   │   ├── _index.tsx      # Página inicial (/)
│   │   ├── agenda.tsx      # Página da agenda (/agenda)
│   │   ├── dados._index.tsx # Página principal de dados (/dados)
│   │   ├── dados.contagens.tsx # Página de contagens (/dados/contagens)
│   │   ├── contagens.$slug.tsx # Página individual de contagem
│   │   ├── projetos._index.tsx # Página de projetos
│   │   ├── projetos.$projeto.tsx # Página individual de projeto
│   │   ├── documentacao._index.tsx # Esta documentação
│   │   └── *.tsx           # Outras rotas
│   ├── loader/             # Funções de carregamento de dados
│   │   ├── agenda.ts       # Loader para dados da agenda
│   │   ├── dados.contagens.ts # Loader para contagens
│   │   ├── projetos.ts     # Loader para projetos
│   │   └── *.ts            # Outros loaders
│   ├── services/           # Serviços e utilitários
│   │   └── utils.ts        # Funções utilitárias
│   └── types/              # Definições de tipos TypeScript
├── public/                 # Arquivos estáticos
│   ├── icons/              # Ícones e imagens
│   └── *.webp              # Imagens otimizadas
├── documentation/          # Documentação adicional
└── package.json           # Dependências e scripts`}
          </pre>
        </div>
        
        <h3 className={`text-xl font-semibold mb-4`} style={{ fontSize: fontSize + 4 }} style={{ fontSize: fontSize + 4 }}>Detalhamento das Pastas</h3>
        <div className="space-y-4">
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3 flex items-center gap-2`} style={{ fontSize: fontSize }}>
              <ComponentIcon className="w-5 h-5" />
              app/components/Commom/
            </h4>
            <p className="text-sm mb-3" style={{ fontSize: fontSize - 2 }}>Pasta de <strong>componentes reutilizáveis</strong> usados em toda a aplicação:</p>
            <ul className="text-sm space-y-1 ml-4" style={{ fontSize: fontSize - 2 }}>
              <li>• <strong>Navbar.tsx</strong> - Barra de navegação com logo responsiva</li>
              <li>• <strong>Footer.tsx</strong> - Rodapé com links e informações</li>
              <li>• <strong>Banner.tsx</strong> - Banner de cabeçalho das páginas</li>
              <li>• <strong>Breadcrumb.tsx</strong> - Navegação estrutural</li>
              <li>• <strong>GoogleAnalytics.tsx</strong> - Integração com GA</li>
              <li>• <strong>Icones/</strong> - Ícones SVG personalizados</li>
            </ul>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3 flex items-center gap-2`} style={{ fontSize: fontSize }}>
              <RouteIcon className="w-5 h-5" />
              app/routes/
            </h4>
            <p className="text-sm mb-3" style={{ fontSize: fontSize - 2 }}>Sistema de roteamento baseado em arquivos do Remix:</p>
            <ul className="text-sm space-y-1 ml-4" style={{ fontSize: fontSize - 2 }}>
              <li>• <strong>_index.tsx</strong> - Página inicial com seções dinâmicas</li>
              <li>• <strong>dados._index.tsx</strong> - Hub central de dados</li>
              <li>• <strong>contagens.$slug.tsx</strong> - Páginas dinâmicas de contagens</li>
              <li>• <strong>projetos.$projeto.tsx</strong> - Páginas dinâmicas de projetos</li>
              <li>• <strong>documentacao._index.tsx</strong> - Esta documentação</li>
            </ul>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
            <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3 flex items-center gap-2`} style={{ fontSize: fontSize }}>
              <ApiIcon className="w-5 h-5" />
              app/loader/
            </h4>
            <p className="text-sm mb-3" style={{ fontSize: fontSize - 2 }}>Funções para carregamento de dados do servidor:</p>
            <ul className="text-sm space-y-1 ml-4" style={{ fontSize: fontSize - 2 }}>
              <li>• <strong>dados.contagens.ts</strong> - Carrega dados de contagens de ciclistas</li>
              <li>• <strong>projetos.ts</strong> - Carrega informações dos projetos</li>
              <li>• <strong>agenda.ts</strong> - Integração com Google Calendar</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}