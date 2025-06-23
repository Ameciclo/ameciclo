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
  ExternalLinkIcon,
  EmailIcon
} from "~/components/Commom/Icones/DocumentationIcons";

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

  const navigationItems = [
    { id: 'visao-geral', title: 'Visão Geral', icon: OverviewIcon },
    { id: 'instalacao', title: 'Instalação', icon: InstallIcon },
    { id: 'estrutura', title: 'Estrutura do Projeto', icon: FolderIcon },
    { id: 'componentes', title: 'Componentes', icon: ComponentIcon },
    { id: 'rotas', title: 'Rotas', icon: RouteIcon },
    { id: 'api', title: 'API', icon: ApiIcon },
    { id: 'testes', title: 'Testes', icon: TestIcon },
    { id: 'configuracao', title: 'Configuração', icon: ConfigIcon },
    { id: 'troubleshooting', title: 'Troubleshooting', icon: TroubleshootIcon },
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
    { id: "troubleshooting", title: "Troubleshooting", content: "problemas erros soluções" },
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
      setSearchResults([]);
      setSearchTerm("");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mt-22 min-h-screen bg-gray-900 text-gray-100">
      {/* Header com busca */}
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
        <div className="w-80 bg-gray-800 min-h-screen p-6 sticky top-20 overflow-y-auto max-h-screen">
          <nav className={`space-y-2 ${isScrolled ? 'mt-0' : 'mt-20'} transition-all`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-green-400 duration-300">Navegação</h2>
              <a href="/" className="text-sm text-gray-400 hover:text-green-400 transition-colors flex items-center gap-1">
                <HomeIcon className="w-3 h-3" />
                Voltar ao site
              </a>
            </div>
            
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                      activeSection === item.id 
                        ? 'bg-gray-700 text-green-400 border-l-2 border-green-400' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {item.title}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 p-8">
          {/* Visão Geral */}
          <section id="visao-geral" className="mb-12">
            <h2 className="text-3xl font-bold text-green-400 mb-6 flex items-center gap-3">
              <OverviewIcon className="w-8 h-8" />
              Visão Geral
            </h2>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <p className="text-lg mb-4">
                O projeto <strong className="text-green-400">Ameciclo</strong> é uma plataforma web desenvolvida com <strong>Remix</strong> e <strong>TypeScript</strong> 
                que tem como objetivo fornecer dados sobre mobilidade ativa na região metropolitana do Recife.
              </p>
              <p className="mb-4">
                A plataforma oferece visualização de dados de contagens de ciclistas, documentos relacionados à mobilidade urbana, 
                e observatórios especializados em diferentes aspectos da mobilidade ativa.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="font-semibold text-green-400 mb-2">Objetivo</h4>
                  <p className="text-sm">Promover a mobilidade ativa através de dados e informações acessíveis</p>
                </div>
                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="font-semibold text-green-400 mb-2">Tecnologias</h4>
                  <p className="text-sm">Remix, TypeScript, React, Tailwind CSS</p>
                </div>
              </div>
            </div>
          </section>

          {/* Instalação */}
          <section id="instalacao" className="mb-12">
            <h2 className="text-3xl font-bold text-green-400 mb-6 flex items-center gap-3">
              <InstallIcon className="w-8 h-8" />
              Instalação
            </h2>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Pré-requisitos</h3>
              <ul className="list-disc list-inside mb-6 space-y-2">
                <li>{"Node.js >= 20.0.0"}</li>
                <li>npm ou yarn</li>
                <li>Git</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-4">Passos para instalação</h3>
              <div className="space-y-4">
                <div>
                  <p className="mb-2">1. Clone o repositório:</p>
                  <div className="bg-gray-900 p-3 rounded border border-gray-600">
                    <code className="text-green-300">git clone https://github.com/Ameciclo/ameciclo.git</code>
                  </div>
                </div>
                
                <div>
                  <p className="mb-2">2. Instale as dependências:</p>
                  <div className="bg-gray-900 p-3 rounded border border-gray-600">
                    <code className="text-green-300">npm install</code>
                  </div>
                </div>
                
                <div>
                  <p className="mb-2">3. Inicie o servidor de desenvolvimento:</p>
                  <div className="bg-gray-900 p-3 rounded border border-gray-600">
                    <code className="text-green-300">npm run dev</code>
                  </div>
                </div>
                
                <div>
                  <p className="mb-2">4. Acesse a aplicação:</p>
                  <div className="bg-gray-900 p-3 rounded border border-gray-600">
                    <code className="text-green-300">http://localhost:5173</code>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Estrutura do Projeto */}
          <section id="estrutura" className="mb-12">
            <h2 className="text-3xl font-bold text-green-400 mb-6 flex items-center gap-3">
              <FolderIcon className="w-8 h-8" />
              Estrutura do Projeto
            </h2>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="bg-gray-900 p-4 rounded border border-gray-600 mb-6">
                <pre className="text-sm text-green-300 overflow-x-auto">
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
              
              <h3 className="text-xl font-semibold mb-4">Detalhamento das Pastas</h3>
              <div className="space-y-4">
                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                    <ComponentIcon className="w-5 h-5" />
                    app/components/Commom/
                  </h4>
                  <p className="text-sm mb-3">Pasta de <strong>componentes reutilizáveis</strong> usados em toda a aplicação:</p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• <strong>Navbar.tsx</strong> - Barra de navegação com logo responsiva</li>
                    <li>• <strong>Footer.tsx</strong> - Rodapé com links e informações</li>
                    <li>• <strong>Banner.tsx</strong> - Banner de cabeçalho das páginas</li>
                    <li>• <strong>Breadcrumb.tsx</strong> - Navegação estrutural</li>
                    <li>• <strong>GoogleAnalytics.tsx</strong> - Integração com GA</li>
                    <li>• <strong>Icones/</strong> - Ícones SVG personalizados</li>
                  </ul>
                </div>
                
                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                    <RouteIcon className="w-5 h-5" />
                    app/routes/
                  </h4>
                  <p className="text-sm mb-3">Sistema de roteamento baseado em arquivos do Remix:</p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• <strong>_index.tsx</strong> - Página inicial com seções dinâmicas</li>
                    <li>• <strong>dados._index.tsx</strong> - Hub central de dados</li>
                    <li>• <strong>contagens.$slug.tsx</strong> - Páginas dinâmicas de contagens</li>
                    <li>• <strong>projetos.$projeto.tsx</strong> - Páginas dinâmicas de projetos</li>
                    <li>• <strong>documentacao._index.tsx</strong> - Esta documentação</li>
                  </ul>
                </div>
                
                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                    <ApiIcon className="w-5 h-5" />
                    app/loader/
                  </h4>
                  <p className="text-sm mb-3">Funções para carregamento de dados do servidor:</p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• <strong>dados.contagens.ts</strong> - Carrega dados de contagens de ciclistas</li>
                    <li>• <strong>projetos.ts</strong> - Carrega informações dos projetos</li>
                    <li>• <strong>agenda.ts</strong> - Integração com Google Calendar</li>
                  </ul>
                </div>
                
                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                    <FolderIcon className="w-5 h-5" />
                    Componentes por Seção
                  </h4>
                  <p className="text-sm mb-3">Cada seção tem seus componentes específicos:</p>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <strong>Agenda/</strong> - Calendário de eventos<br/>
                      <strong>Contagens/</strong> - Visualização de dados<br/>
                      <strong>Dados/</strong> - Dashboards e gráficos
                    </div>
                    <div>
                      <strong>Projetos/</strong> - Cards e detalhes<br/>
                      <strong>QuemSomos/</strong> - Informações da organização<br/>
                      <strong>Documentacao/</strong> - Esta documentação
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Componentes */}
          <section id="componentes" className="mb-12">
            <h2 className="text-3xl font-bold text-green-400 mb-6 flex items-center gap-3">
              <ComponentIcon className="w-8 h-8" />
              Componentes
            </h2>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <p className="mb-6">Os componentes são organizados por funcionalidade e reutilizabilidade:</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-green-400 mb-3">Componentes Comuns</h3>
                  <div className="bg-gray-900 p-4 rounded border border-gray-600">
                    <code className="text-green-300">
                      app/components/Commom/
                      <br />├── Navbar.tsx          # Barra de navegação
                      <br />├── Footer.tsx          # Rodapé
                      <br />├── Banner.tsx          # Banner de páginas
                      <br />├── Breadcrumb.tsx      # Navegação estrutural
                      <br />└── GoogleAnalytics.tsx # Analytics
                    </code>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-green-400 mb-3">Exemplo de uso</h3>
                  <div className="bg-gray-900 p-4 rounded border border-gray-600">
                    <code className="text-green-300">
{`import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";

export default function MinhaPage() {
  return (
    <>
      <Banner image="/imagem.webp" alt="Descrição" />
      <Breadcrumb 
        label="Página Atual" 
        slug="/pagina-atual" 
        routes={["/", "/secao"]} 
      />
      {/* Conteúdo da página */}
    </>
  );
}`}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Rotas */}
          <section id="rotas" className="mb-12">
            <h2 className="text-3xl font-bold text-green-400 mb-6 flex items-center gap-3">
              <RouteIcon className="w-8 h-8" />
              Rotas
            </h2>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <p className="mb-6">O Remix utiliza roteamento baseado em arquivos. Cada arquivo em <code className="bg-gray-700 px-2 py-1 rounded">app/routes/</code> representa uma rota:</p>
              
              <div className="space-y-4">
                <div className="bg-gray-900 p-4 rounded border border-gray-600">
                  <h4 className="font-semibold text-green-400 mb-2">Rotas principais:</h4>
                  <code className="text-green-300 text-sm">
                    /_index.tsx                 → /
                    <br />agenda.tsx                   → /agenda
                    <br />dados._index.tsx             → /dados
                    <br />dados.contagens.tsx          → /dados/contagens
                    <br />contagens.$slug.tsx          → /contagens/:slug
                    <br />projetos.$projeto.tsx        → /projetos/:projeto
                  </code>
                </div>
                
                <div>
                  <h4 className="font-semibold text-green-400 mb-2">Exemplo de rota com loader:</h4>
                  <div className="bg-gray-900 p-4 rounded border border-gray-600">
                    <code className="text-green-300 text-sm">
{`// app/routes/contagens.$slug.tsx
import { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params;
  const response = await fetch(\`http://api.garfo.ameciclo.org/cyclist-counts\`);
  const data = await response.json();
  
  const contagem = data.counts?.find((c: any) => c.slug === slug);
  
  if (!contagem) {
    throw new Response("Contagem não encontrada", { status: 404 });
  }
  
  return { contagem };
}`}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* API */}
          <section id="api" className="mb-12">
            <h2 className="text-3xl font-bold text-green-400 mb-6 flex items-center gap-3">
              <ApiIcon className="w-8 h-8" />
              API
            </h2>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <p className="mb-6">A aplicação consome dados de diferentes APIs para fornecer informações sobre mobilidade ativa:</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-green-400 mb-3">Endpoints principais</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-700 p-4 rounded">
                      <div className="font-semibold text-green-400 mb-2">Contagens de Ciclistas</div>
                      <code className="text-sm text-gray-300 block mb-2">GET http://api.garfo.ameciclo.org/cyclist-counts</code>
                      <p className="text-sm text-gray-400">Retorna dados de contagens de ciclistas realizadas em diferentes pontos da cidade</p>
                    </div>
                    
                    <div className="bg-gray-700 p-4 rounded">
                      <div className="font-semibold text-green-400 mb-2">Contagem Individual</div>
                      <code className="text-sm text-gray-300 block mb-2">GET http://api.garfo.ameciclo.org/cyclist-counts/edition/:id</code>
                      <p className="text-sm text-gray-400">Retorna dados detalhados de uma contagem específica</p>
                    </div>
                    
                    <div className="bg-gray-700 p-4 rounded">
                      <div className="font-semibold text-green-400 mb-2">CMS - Conteúdo</div>
                      <code className="text-sm text-gray-300 block mb-2">GET http://cms.ameciclo.org/api/</code>
                      <p className="text-sm text-gray-400">Sistema de gerenciamento de conteúdo para projetos e informações</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-green-400 mb-3">Estrutura de Dados - Contagens</h3>
                  <div className="bg-gray-900 p-4 rounded border border-gray-600">
                    <code className="text-green-300 text-sm">
{`{
  "counts": [
    {
      "id": 1,
      "name": "Ponte do Jiquiá",
      "slug": "ponte-do-jiquia",
      "date": "2024-03-15",
      "total_cyclists": 245,
      "total_women": 89,
      "total_helmet": 156,
      "total_juveniles": 23,
      "location": {
        "lat": -8.0476,
        "lng": -34.8770
      }
    }
  ]
}`}
                    </code>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-green-400 mb-3">Exemplo de consumo</h3>
                  <div className="bg-gray-900 p-4 rounded border border-gray-600">
                    <code className="text-green-300 text-sm">
{`// app/routes/contagens.$slug.tsx
import { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params;
  
  try {
    const response = await fetch('http://api.garfo.ameciclo.org/cyclist-counts');
    const data = await response.json();
    
    const contagem = data.counts?.find((c: any) => c.slug === slug);
    
    if (!contagem) {
      throw new Response("Contagem não encontrada", { status: 404 });
    }
    
    return { contagem };
  } catch (error) {
    throw new Response("Erro ao carregar contagem", { status: 500 });
  }
}`}
                    </code>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-green-400 mb-3">Tratamento de Erros</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-700 p-3 rounded">
                      <div className="font-semibold text-yellow-400 mb-1">404 - Não Encontrado</div>
                      <p className="text-sm">Quando um recurso específico não é encontrado</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded">
                      <div className="font-semibold text-red-400 mb-1">500 - Erro do Servidor</div>
                      <p className="text-sm">Quando há problemas na comunicação com a API</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testes */}
          <section id="testes" className="mb-12">
            <h2 className="text-3xl font-bold text-green-400 mb-6 flex items-center gap-3">
              <TestIcon className="w-8 h-8" />
              Testes
            </h2>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <p className="mb-6">O projeto utiliza ferramentas de qualidade de código para garantir a confiabilidade:</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-green-400 mb-3">Linting e Type Checking</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="mb-2">Verificar qualidade do código:</p>
                      <div className="bg-gray-900 p-3 rounded border border-gray-600">
                        <code className="text-green-300">npm run lint</code>
                      </div>
                    </div>
                    
                    <div>
                      <p className="mb-2">Verificar tipos TypeScript:</p>
                      <div className="bg-gray-900 p-3 rounded border border-gray-600">
                        <code className="text-green-300">npm run typecheck</code>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-green-400 mb-3">Configuração do ESLint</h3>
                  <div className="bg-gray-900 p-4 rounded border border-gray-600">
                    <code className="text-green-300 text-sm">
{`// .eslintrc.cjs
module.exports = {
  extends: [
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node"
  ],
  rules: {
    // Regras personalizadas do projeto
  }
};`}
                    </code>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-900 border border-blue-600 rounded">
                <p className="text-blue-200">
                  <strong>Dica:</strong> Execute os testes antes de fazer commit para garantir a qualidade do código.
                </p>
              </div>
            </div>
          </section>

          {/* Configuração */}
          <section id="configuracao" className="mb-12">
            <h2 className="text-3xl font-bold text-green-400 mb-6 flex items-center gap-3">
              <ConfigIcon className="w-8 h-8" />
              Configuração
            </h2>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Variáveis de Ambiente</h3>
              <p className="mb-4">O projeto pode utilizar variáveis de ambiente para configurações específicas:</p>
              
              <div className="space-y-4">
                <div>
                  <p className="mb-2">Crie um arquivo <code className="bg-gray-700 px-2 py-1 rounded">.env</code> na raiz do projeto:</p>
                  <div className="bg-gray-900 p-3 rounded border border-gray-600">
                    <code className="text-green-300">
                      # APIs<br />
                      API_BASE_URL=http://api.garfo.ameciclo.org<br />
                      CMS_BASE_URL=http://cms.ameciclo.org<br /><br />
                      # Analytics<br />
                      GOOGLE_ANALYTICS_ID=G-PQNS7S7FD3<br /><br />
                      # Desenvolvimento<br />
                      NODE_ENV=development
                    </code>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mt-6 mb-4">Configurações do Tailwind</h3>
              <div className="bg-gray-900 p-4 rounded border border-gray-600">
                <code className="text-green-300 text-sm">
{`// tailwind.config.ts
export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ameciclo: "#2E8B57", // Verde Ameciclo
      },
    },
  },
  plugins: [],
};`}
                </code>
              </div>
            </div>
          </section>

          {/* Troubleshooting */}
          <section id="troubleshooting" className="mb-12">
            <h2 className="text-3xl font-bold text-green-400 mb-6 flex items-center gap-3">
              <TroubleshootIcon className="w-8 h-8" />
              Troubleshooting
            </h2>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Problemas Comuns</h3>
              
              <div className="space-y-6">
                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="font-semibold text-red-400 mb-2">Erro: "Module not found"</h4>
                  <p className="text-sm mb-2"><strong>Solução:</strong></p>
                  <div className="bg-gray-900 p-2 rounded">
                    <code className="text-green-300 text-sm">npm install</code>
                  </div>
                  <p className="text-sm mt-2">Reinstale as dependências se algum módulo não for encontrado.</p>
                </div>
                
                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="font-semibold text-red-400 mb-2">Erro: "Port already in use"</h4>
                  <p className="text-sm mb-2"><strong>Solução:</strong></p>
                  <div className="bg-gray-900 p-2 rounded">
                    <code className="text-green-300 text-sm">npx kill-port 5173</code>
                  </div>
                  <p className="text-sm mt-2">Mate o processo que está usando a porta 5173.</p>
                </div>
                
                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="font-semibold text-red-400 mb-2">Erro de API: "Failed to fetch"</h4>
                  <p className="text-sm mb-2"><strong>Possíveis causas:</strong></p>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    <li>API externa indisponível</li>
                    <li>Problemas de CORS</li>
                    <li>URL da API incorreta</li>
                  </ul>
                  <p className="text-sm mt-2"><strong>Solução:</strong> Verifique a conectividade e URLs das APIs.</p>
                </div>
                
                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="font-semibold text-red-400 mb-2">Problemas com react-map-gl</h4>
                  <p className="text-sm mb-2"><strong>Solução:</strong></p>
                  <div className="bg-gray-900 p-2 rounded">
                    <code className="text-green-300 text-sm">npm remove react-map-gl && npm install react-map-gl@6</code>
                  </div>
                  <p className="text-sm mt-2">Use a versão 6 para compatibilidade com Vite.</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-900 border border-yellow-600 rounded">
                <p className="text-yellow-200">
                  <strong>Dica:</strong> Se o problema persistir, consulte os issues no GitHub ou abra um novo issue com detalhes do erro.
                </p>
              </div>
            </div>
          </section>

          {/* Deploy */}
          <section id="deploy" className="mb-12">
            <h2 className="text-3xl font-bold text-green-400 mb-6 flex items-center gap-3">
              <DeployIcon className="w-8 h-8" />
              Deploy
            </h2>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Dependências Principais</h3>
              <div className="space-y-4 mb-8">
                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="font-semibold text-green-400 mb-3">Framework e Core</h4>
                  <ul className="text-sm space-y-2">
                    <li><strong className="text-blue-300">@remix-run/*</strong> - Framework full-stack React com SSR</li>
                    <li><strong className="text-blue-300">react</strong> - Biblioteca para interfaces de usuário</li>
                    <li><strong className="text-blue-300">typescript</strong> - Superset do JavaScript com tipagem</li>
                    <li><strong className="text-blue-300">vite</strong> - Build tool rápido e moderno</li>
                  </ul>
                </div>
                
                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="font-semibold text-green-400 mb-3">UI e Estilização</h4>
                  <ul className="text-sm space-y-2">
                    <li><strong className="text-blue-300">tailwindcss</strong> - Framework CSS utilitário</li>
                    <li><strong className="text-blue-300">framer-motion</strong> - Animações e transições</li>
                    <li><strong className="text-blue-300">styled-components</strong> - CSS-in-JS</li>
                  </ul>
                </div>
                
                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="font-semibold text-green-400 mb-3">Funcionalidades Específicas</h4>
                  <ul className="text-sm space-y-2">
                    <li><strong className="text-blue-300">@fullcalendar/*</strong> - Calendário interativo para agenda</li>
                    <li><strong className="text-blue-300">highcharts</strong> - Gráficos e visualizações</li>
                    <li><strong className="text-blue-300">react-map-gl</strong> - Mapas interativos</li>
                    <li><strong className="text-blue-300">keen-slider</strong> - Carrossel/slider responsivo</li>
                    <li><strong className="text-blue-300">react-markdown</strong> - Renderização de Markdown</li>
                  </ul>
                </div>
                
                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="font-semibold text-green-400 mb-3">Utilitários</h4>
                  <ul className="text-sm space-y-2">
                    <li><strong className="text-blue-300">match-sorter</strong> - Busca e ordenação inteligente</li>
                    <li><strong className="text-blue-300">react-spinners</strong> - Indicadores de carregamento</li>
                    <li><strong className="text-blue-300">react-lazyload</strong> - Carregamento lazy de componentes</li>
                  </ul>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-4">Build para produção</h3>
              <div className="space-y-4">
                <div>
                  <p className="mb-2">1. Gerar build otimizado:</p>
                  <div className="bg-gray-900 p-3 rounded border border-gray-600">
                    <code className="text-green-300">npm run build</code>
                  </div>
                </div>
                
                <div>
                  <p className="mb-2">2. Iniciar servidor de produção:</p>
                  <div className="bg-gray-900 p-3 rounded border border-gray-600">
                    <code className="text-green-300">npm start</code>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-900 border border-yellow-600 rounded">
                <p className="text-yellow-200">
                  <strong>Nota:</strong> O pipeline de deploy ainda está em desenvolvimento. 
                  Consulte o README.md para atualizações sobre o processo de deploy.
                </p>
              </div>
            </div>
          </section>

          {/* Contribuição */}
          <section id="contribuicao" className="mb-12">
            <h2 className="text-3xl font-bold text-green-400 mb-6 flex items-center gap-3">
              <ContributeIcon className="w-8 h-8" />
              Contribuição
            </h2>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <p className="mb-6">Contribuições são sempre bem-vindas! Siga este guia para contribuir com o projeto:</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-green-400 mb-4">Processo de Contribuição</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-700 p-4 rounded">
                      <h4 className="font-semibold text-green-400 mb-2">1. Fork e Clone</h4>
                      <div className="bg-gray-900 p-2 rounded mt-2">
                        <code className="text-green-300 text-sm">
                          git clone https://github.com/SEU-USUARIO/ameciclo.git<br />
                          cd ameciclo
                        </code>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 p-4 rounded">
                      <h4 className="font-semibold text-green-400 mb-2">2. Crie uma branch</h4>
                      <div className="bg-gray-900 p-2 rounded mt-2">
                        <code className="text-green-300 text-sm">git checkout -b feature/nova-funcionalidade</code>
                      </div>
                      <p className="text-sm mt-2">Use nomes descritivos: <code className="bg-gray-600 px-1 rounded">feature/</code>, <code className="bg-gray-600 px-1 rounded">fix/</code>, <code className="bg-gray-600 px-1 rounded">docs/</code></p>
                    </div>
                    
                    <div className="bg-gray-700 p-4 rounded">
                      <h4 className="font-semibold text-green-400 mb-2">3. Desenvolva e Teste</h4>
                      <div className="bg-gray-900 p-2 rounded mt-2">
                        <code className="text-green-300 text-sm">
                          npm install<br />
                          npm run dev<br />
                          npm run lint<br />
                          npm run typecheck
                        </code>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 p-4 rounded">
                      <h4 className="font-semibold text-green-400 mb-2">4. Commit e Push</h4>
                      <div className="bg-gray-900 p-2 rounded mt-2">
                        <code className="text-green-300 text-sm">
                          git add .<br />
                          git commit -m "feat: adiciona nova funcionalidade"<br />
                          git push origin feature/nova-funcionalidade
                        </code>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 p-4 rounded">
                      <h4 className="font-semibold text-green-400 mb-2">5. Abra um Pull Request</h4>
                      <p className="text-sm">Descreva claramente as alterações e inclua screenshots se necessário</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-green-400 mb-4">Padrões de Código</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-700 p-3 rounded">
                      <div className="font-semibold text-yellow-400 mb-1">Commits</div>
                      <p className="text-sm">Use conventional commits: <code className="bg-gray-600 px-1 rounded">feat:</code>, <code className="bg-gray-600 px-1 rounded">fix:</code>, <code className="bg-gray-600 px-1 rounded">docs:</code></p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded">
                      <div className="font-semibold text-yellow-400 mb-1">TypeScript</div>
                      <p className="text-sm">Sempre tipifique variáveis e funções</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded">
                      <div className="font-semibold text-yellow-400 mb-1">Componentes</div>
                      <p className="text-sm">Use nomes descritivos e organize por funcionalidade</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-green-400 mb-4">Tipos de Contribuição</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 p-3 rounded">
                      <div className="font-semibold text-blue-400 mb-1">Correção de Bugs</div>
                      <p className="text-sm">Identifique e corrija problemas existentes</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded">
                      <div className="font-semibold text-purple-400 mb-1">Novas Funcionalidades</div>
                      <p className="text-sm">Adicione recursos que melhorem a plataforma</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded">
                      <div className="font-semibold text-green-400 mb-1">Documentação</div>
                      <p className="text-sm">Melhore ou adicione documentação</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded">
                      <div className="font-semibold text-orange-400 mb-1">Design/UX</div>
                      <p className="text-sm">Melhore a interface e experiência do usuário</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-900 border border-blue-600 rounded">
                <p className="text-blue-200">
                  <strong>Dica:</strong> Consulte os <a href="https://github.com/Ameciclo/ameciclo/issues" className="text-blue-300 underline" target="_blank" rel="noopener noreferrer">issues abertos</a> no GitHub para encontrar tarefas que precisam de ajuda.
                </p>
              </div>
            </div>
          </section>
          {/* Footer da Documentação */}
          <footer className="mt-16 pt-8 border-t border-gray-700">
            <div className="text-center text-gray-400">
              <p className="mb-4">
                Documentação do projeto <strong className="text-green-400">Ameciclo</strong>
              </p>
              <div className="flex justify-center space-x-6 text-sm">
                <a href="https://github.com/Ameciclo/ameciclo" className="hover:text-green-400 transition-colors flex items-center gap-1" target="_blank" rel="noopener noreferrer">
                  <ExternalLinkIcon className="w-4 h-4" />
                  GitHub
                </a>
                <a href="https://ameciclo.org" className="hover:text-green-400 transition-colors flex items-center gap-1" target="_blank" rel="noopener noreferrer">
                  <HomeIcon className="w-4 h-4" />
                  Site Principal
                </a>
                <a href="https://ameciclo.org/contato" className="hover:text-green-400 transition-colors flex items-center gap-1">
                  <EmailIcon className="w-4 h-4" />
                  Contato
                </a>
              </div>
              <p className="mt-4 text-xs">
                © 2024 Ameciclo - Associação Metropolitana de Ciclistas do Recife
              </p>
            </div>
          </footer>
        </div>
      </div>

      {/* Botão Scroll to Top */}
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