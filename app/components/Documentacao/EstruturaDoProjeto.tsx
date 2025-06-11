export default function EstruturaDoProjeto() {
  const scripts = [
    {
      name: "build",
      command: "remix vite:build",
      description: "Compila o projeto Remix utilizando Vite para produção."
    },
    {
      name: "dev",
      command: "remix vite:dev",
      description: "Inicia o servidor de desenvolvimento do Remix com Vite."
    },
    {
      name: "lint",
      command: "eslint --ignore-path .gitignore --cache --cache-location ./node_modules/.cache/eslint .",
      description: "Executa o ESLint para verificar problemas no código, ignorando arquivos listados no .gitignore."
    },
    {
      name: "start",
      command: "remix-serve ./build/server/index.js",
      description: "Inicia a aplicação Remix em produção a partir dos arquivos compilados."
    },
    {
      name: "typecheck",
      command: "tsc",
      description: "Executa o TypeScript para verificar a tipagem do código."
    }
  ];

  const dependencies = [
    {
      category: "Dependências de Produção",
      items: [
        { name: "@fullcalendar/daygrid", description: "Extensão do FullCalendar para exibição de eventos em um layout de grade diária." },
        { name: "@fullcalendar/google-calendar", description: "Integração do FullCalendar com o Google Calendar." },
        { name: "@fullcalendar/list", description: "Exibição de eventos do FullCalendar em formato de lista." },
        { name: "@fullcalendar/react", description: "Versão do FullCalendar compatível com React." },
        { name: "@remix-run/node", description: "Biblioteca do Remix para manipulação de requisições no backend com Node.js." },
        { name: "@remix-run/react", description: "Ferramentas do Remix para construir SPAs com React." },
        { name: "@remix-run/serve", description: "Servidor para rodar aplicações Remix em produção." },
        { name: "@tailwindcss/typography", description: "Plugin do Tailwind CSS para estilização tipográfica otimizada." },
        { name: "framer-motion", description: "Biblioteca para animações fluidas em React." },
        { name: "isbot", description: "Detecta se um usuário é um bot, útil para otimizar SEO e evitar acessos não humanos." },
        { name: "keen-slider", description: "Biblioteca para criação de carrosséis responsivos." },
        { name: "react", description: "Biblioteca principal para construir interfaces em React." },
        { name: "react-dom", description: "Responsável por interagir com a árvore DOM no React." },
        { name: "react-map-gl", description: "Componente React para integração com mapas do Mapbox." },
        { name: "react-markdown", description: "Renderiza Markdown no React." },
        { name: "styled-components", description: "Biblioteca para estilização de componentes em React utilizando CSS-in-JS." },
      ],
    },
    {
      category: "Dependências de Desenvolvimento",
      items: [
        { name: "@remix-run/dev", description: "Ferramentas de desenvolvimento para Remix, incluindo compilação e servidor local." },
        { name: "@types/react", description: "Tipagens TypeScript para React." },
        { name: "@types/react-dom", description: "Tipagens TypeScript para React DOM." },
        { name: "@types/react-map-gl", description: "Tipagens TypeScript para React Map GL." },
        { name: "@typescript-eslint/eslint-plugin", description: "Plugin ESLint para aplicar boas práticas ao TypeScript." },
        { name: "@typescript-eslint/parser", description: "Parser ESLint para entender código TypeScript." },
        { name: "autoprefixer", description: "Adiciona prefixos CSS automaticamente para compatibilidade entre navegadores." },
        { name: "eslint", description: "Ferramenta de linting para melhorar qualidade do código." },
        { name: "eslint-import-resolver-typescript", description: "Resolve imports no ESLint para projetos TypeScript." },
        { name: "eslint-plugin-import", description: "Regras adicionais para garantir imports corretos." },
        { name: "eslint-plugin-jsx-a11y", description: "Regras de acessibilidade para JSX no ESLint." },
        { name: "eslint-plugin-react", description: "Conjunto de regras para melhorar código React no ESLint." },
        { name: "eslint-plugin-react-hooks", description: "Regras específicas para garantir uso correto de React Hooks." },
        { name: "postcss", description: "Processador CSS para transformar estilos com plugins." },
        { name: "tailwindcss", description: "Framework de utilitários CSS para estilização eficiente." },
        { name: "typescript", description: "Linguagem baseada em JavaScript com tipagem estática." },
        { name: "vite", description: "Ferramenta rápida para desenvolvimento e build de projetos front-end." },
        { name: "vite-tsconfig-paths", description: "Plugin do Vite para suportar caminhos personalizados no tsconfig.json." },
      ],
    },
    {
      category: "Engines",
      items: [
        { name: "node >= 20.0.0", description: "Garante compatibilidade do projeto com versões modernas do Node.js." },
      ],
    },
  ];

  return (
    <div id="estrutura-do-projeto" className="p-4">
      <h1 id="estrutura-do-projeto-titulo" className="text-3xl font-bold mb-4">1. Estrutura do Projeto</h1>
      <p className="mb-6">
        A organização das pastas é essencial para manter a clareza e facilitar a colaboração entre desenvolvedores. Abaixo está a descrição das principais pastas:
      </p>

      <h2 id="arvore-de-pastas" className="mt-11 text-2xl pb-4 font-semibold">Árvore de Pastas</h2>
      <pre className="bg-black p-4 pt-0 pb-0 mb-5 text-white rounded-md overflow-x-auto">
        <code>
          {`
.
├── app/
│   ├── components/
│   │   ├── Commom/
│   │   ├── Agenda/
│   │   ├── Home/
│   │   ├── Projetos/
│   │   └── QuemSomos/
│   ├── loader/
│   ├── routes/
│   │   ├── _index.tsx
│   │   ├── $404.tsx
│   │   ├── agenda.tsx
│   │   ├── contato.tsx
│   │   ├── projetos.tsx
│   │   └── quem_somos.tsx
│   ├── public/
│   └── tailwind.css
├── .eslintrc.cjs
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
          `}
        </code>
      </pre>

      <h2 id="descricao-das-pastas" className="mt-11 text-2xl font-semibold mb-4">Descrição das Pastas</h2>
      <ul className="list-disc pl-6 space-y-4">
        <li><strong>app/</strong>: Pasta principal contendo todo o código-fonte da aplicação.</li>
        <li><strong>components/</strong>: Contém os componentes reutilizáveis da aplicação.</li>
        <ul className="list-decimal pl-6 space-y-4">
          <li><strong>Commom/</strong>: Inclui elementos compartilhados, como <strong>Navbar</strong>, <strong>Footer</strong> e <strong>GoogleAnalytics</strong>.</li>
          <li><strong>Agenda/</strong>, <strong>Home/</strong>, <strong>Projetos/</strong>, <strong>QuemSomos/</strong>: Contêm componentes específicos para diferentes páginas.</li>
        </ul>
        <li><strong>loader/</strong>: Contém funções de carregamento de dados (loaders) utilizadas nas rotas.</li>
        <li><strong>routes/</strong>: Armazena as rotas do Remix.</li>
        <ul className="list-decimal pl-6 space-y-4">
          <li>Arquivos como <code>agenda.tsx</code>, <code>contato.tsx</code>, <code>projetos.tsx</code>, <code>quem_somos.tsx</code>: Correspondem às páginas da aplicação.</li>
        </ul>
        <li><strong>public/</strong>: Contém arquivos estáticos acessíveis publicamente, como imagens e ícones.</li>
        <li><strong>tailwind.css</strong>: Arquivo de estilos principal da aplicação.</li>
      </ul>

      <h2 id="arquivos-de-configuracao" className="mt-11 text-2xl font-semibold mb-4">Arquivos de Configuração</h2>
      <ul className="list-disc pl-6 space-y-4">
        <li><strong>.eslintrc.cjs</strong>: Configuração do ESLint para garantir a qualidade do código.</li>
        <li><strong>tailwind.config.ts</strong>: Configuração do Tailwind CSS.</li>
        <li><strong>tsconfig.json</strong>: Configuração do TypeScript.</li>
        <li><strong>vite.config.ts</strong>: Configuração do Vite para build e desenvolvimento.</li>
      </ul>

      <h2 id="componente-root" className="mt-11 text-2xl font-semibold mb-4">Explicação do Componente `root.tsx`</h2>
      <p className="mb-4">
        O arquivo <code>root.tsx</code> é o componente principal do projeto. Ele define a estrutura básica da aplicação e garante a consistência entre todas as páginas. Suas principais funções são:
      </p>
      <ul className="list-disc pl-6 space-y-4">
        <li><strong>SEO e Metadados</strong>: Define metatags como título, descrição e palavras-chave para otimização nos motores de busca.</li>
        <li><strong>Links e Estilos</strong>: Importa estilos globais e fontes externas.</li>
        <li><strong>Estrutura da Página</strong>: Utiliza <strong>Navbar</strong> e <strong>Footer</strong> para garantir navegação e rodapé consistentes, e o <strong>Outlet</strong> do Remix para renderizar as páginas dinamicamente.</li>
        <li><strong>ScrollRestoration</strong>: Mantém a posição de rolagem ao navegar entre páginas.</li>
        <li><strong>Scripts</strong>: Carrega scripts necessários para o funcionamento do Remix.</li>
      </ul>

      <h2 id="arquivo-package-json" className="mt-11 text-2xl font-semibold mb-4">Arquivo package.json</h2>
      <p className="mb-4">
        Abaixo estão os scripts e dependências do arquivo <code className="font-bold">package.json</code> para o projeto:
      </p>

      <pre className="bg-black p-4 pt-0 pb-0 mb-5 text-white p-4 rounded-md overflow-x-auto">
        <code>
          {`
{
  "name": "ameciclo.org",
  "private": true,
  "sideEffects": false,
  "type": "module",
  "scripts": {
    "build": "remix vite:build",
    "dev": "remix vite:dev",
    "lint": "eslint --ignore-path .gitignore --cache --cache-location ./node_modules/.cache/eslint .",
    "start": "remix-serve ./build/server/index.js",
    "typecheck": "tsc"
  },
  "dependencies": {
    "@fullcalendar/daygrid": "^6.1.15",
    "@fullcalendar/google-calendar": "^6.1.15",
    "@fullcalendar/list": "^6.1.15",
    "@fullcalendar/react": "^6.1.15",
    "@remix-run/node": "^2.15.2",
    "@remix-run/react": "^2.15.2",
    "@remix-run/serve": "^2.15.2",
    "framer-motion": "^11.18.0",
    "isbot": "^4.1.0",
    "keen-slider": "^6.3.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-map-gl": "^6.1.21",
    "react-markdown": "^10.1.0",
    "styled-components": "^6.1.14"
  },
  "devDependencies": {
    "@remix-run/dev": "^2.15.2",
    "@types/react": "^18.2.20",
    "@types/react-dom": "^18.2.7",
    "@types/react-map-gl": "^6.1.7",
    "@typescript-eslint/eslint-plugin": "^6.7.4",
    "@typescript-eslint/parser": "^6.7.4",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.38.0",
    "eslint-import-resolver-typescript": "^3.6.1",
    "eslint-plugin-import": "^2.28.1",
    "eslint-plugin-jsx-a11y": "^6.7.1",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.1.6",
    "vite": "^5.1.0",
    "vite-tsconfig-paths": "^4.2.1"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}

          `}
        </code>
      </pre>
      <div className="p-4">
        {dependencies.map((section) => (
          <div key={section.category} className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">{section.category}</h2>
            <ul className="list-disc pl-6">
              {section.items.map((item) => (
                <li key={item.name}>
                  <strong>{item.name}</strong>: {item.description}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
