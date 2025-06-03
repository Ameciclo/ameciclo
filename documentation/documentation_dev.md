
---

# Documentação do Projeto para Desenvolvedores

## Índice

- [Visão Geral](#visão-geral)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Explicação do Componente root.tsx](#explicação-do-componente-roottsx)
- [Arquivo package.json](#arquivo-packagejson)
- [Recomendação de Não Alteração do package-lock.json](#recomendação-de-não-alteração-do-package-lockjson)
- [Conclusão](#conclusão)

## Visão Geral

Este projeto é um aplicativo web desenvolvido utilizando **Remix** e **TypeScript**. Ele tem como objetivo fornecer dados sobre mobilidade ativa na região metropolitana do Recife. O sistema é estruturado de forma modular, garantindo escalabilidade e manutenção eficiente.

## Estrutura do Projeto

A organização das pastas é essencial para manter a clareza e facilitar a colaboração entre desenvolvedores. Abaixo está a descrição das principais pastas:

### **Árvore de Pastas**

```bash
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
```

### **Descrição das Pastas**

- **app/**: Pasta principal contendo todo o código-fonte da aplicação.
  - **components/**: Contém os componentes reutilizáveis da aplicação.
    - `Commom/`: Inclui elementos compartilhados, como **Navbar**, **Footer** e **GoogleAnalytics**.
    - `Agenda/`, `Home/`, `Projetos/`, `QuemSomos/`: Contêm componentes específicos para diferentes páginas.
  - **loader/**: Contém funções de carregamento de dados (loaders) utilizadas nas rotas.
  - **routes/**: Armazena as rotas do Remix.
    - Arquivos como `agenda.tsx`, `contato.tsx`, `projetos.tsx`, `quem_somos.tsx`: Correspondem às páginas da aplicação.
  - **public/**: Contém arquivos estáticos acessíveis publicamente, como imagens e ícones.
  - **tailwind.css**: Arquivo de estilos principal da aplicação.

### Arquivos de Configuração

- `.eslintrc.cjs`: Configuração do ESLint para garantir a qualidade do código.
- `tailwind.config.ts`: Configuração do Tailwind CSS.
- `tsconfig.json`: Configuração do TypeScript.
- `vite.config.ts`: Configuração do Vite para build e desenvolvimento.

## Explicação do Componente `root.tsx`

**Exemplo Simplificado de `root.tsx`:**

```tsx
export default function App() {
  return (
    <html lang="pt-BR">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main><Outlet /></main>
          <Footer />
        </div>
        <ScrollRestoration />
        <Scripts />
        <GoogleAnalytics gaId="G-PQNS7S7FD3" />
      </body>
    </html>
  );
}
```

O arquivo `root.tsx` é o componente principal do projeto. Ele define a estrutura básica da aplicação e garante a consistência entre todas as páginas. Suas principais funções são:

- **SEO e Metadados**: Define metatags como título, descrição e palavras-chave para otimização nos motores de busca.
- **Links e Estilos**: Importa estilos globais e fontes externas.
- **Estrutura da Página**: Utiliza **Navbar** e **Footer** para garantir navegação e rodapé consistentes, e o **Outlet** do Remix para renderizar as páginas dinamicamente.
- **ScrollRestoration**: Mantém a posição de rolagem ao navegar entre páginas.
- **Scripts**: Carrega scripts necessários para o funcionamento do Remix.

## Arquivo `package.json`

Abaixo estão as dependências e scripts do arquivo `package.json` para o projeto:

```json
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
    "@tailwindcss/typography": "^0.5.16",
    "framer-motion": "^11.18.0",
    "isbot": "^4.1.0",
    "keen-slider": "^6.3.3",
    "marked": "^15.0.7",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-map-gl": "^6.1.21",
    "react-markdown": "^10.0.0",
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
```

---

### **Dependências**

As dependências no `package.json` são divididas entre **dependencies** e **devDependencies**.

#### **dependencies** (Dependências do Projeto)

Essas dependências são essenciais para o funcionamento da aplicação em produção. Cada uma delas tem um papel específico:

- **@fullcalendar/daygrid, @fullcalendar/google-calendar, @fullcalendar/list, @fullcalendar/react**: Pacotes para integração do **FullCalendar** com a interface do React, permitindo a visualização e interação com calendários.
- **@remix-run/node, @remix-run/react, @remix-run/serve**: Pacotes principais do **Remix**, um framework para React. Ele permite o roteamento, carregamento de dados e a renderização do lado do servidor.
- **@tailwindcss/typography**: Plugin do **Tailwind CSS** para estilização de textos complexos de forma automática.
- **framer-motion**: Biblioteca para animações e transições, especialmente útil para criar efeitos visuais dinâmicos.
- **isbot**: Utilizada para detectar se o agente de usuário é um bot (como os motores de busca).
- **keen-slider**: Biblioteca para criar sliders/carrosséis com alta performance e personalização.
- **marked**: Processador de Markdown para renderizar conteúdo em HTML.
- **react, react-dom**: As bibliotecas principais do **React**, necessárias para criar interfaces de usuário.
- **react-map-gl**: Biblioteca para integrar mapas interativos com o **React**, utilizando o **Mapbox GL**.
- **react-markdown**: Para renderizar conteúdo Markdown em componentes React.
- **styled-components**: Biblioteca para estilizar componentes no **React** utilizando template literals.

#### **devDependencies** (Dependências de Desenvolvimento)

Essas dependências são usadas apenas durante o desenvolvimento e não são necessárias em produção:

- **@remix-run/dev**: Ferramentas de desenvolvimento para o Remix, incluindo a execução do servidor local, hot reloading, etc.
- **@types/react, @types/react-dom, @types/react-map-gl**: Tipos TypeScript para as bibliotecas `react`, `react-dom` e `react-map-gl`, garantindo autocompletar e checagem de tipos no editor.
- **@typescript-eslint/eslint-plugin, @typescript-eslint/parser**: Ferramentas para usar **ESLint** com **TypeScript**, garantindo que o código siga boas práticas e não tenha erros.
- **autoprefixer, postcss**: Ferramentas para adicionar prefixos automaticamente aos estilos CSS, garantindo compatibilidade entre navegadores.
- **eslint, eslint-plugin-import, eslint-plugin-jsx-a11y, eslint-plugin-react, eslint-plugin-react-hooks**: Plugins para o **ESLint** que ajudam a garantir a qualidade e as boas práticas no código, como a checagem de importações, acessibilidade e hooks no React.
- **tailwindcss**: Framework CSS utilitário para facilitar a criação de layouts responsivos e estilizar rapidamente os componentes.
- **typescript**: Compilador TypeScript, essencial para a verificação de tipos e transformação do código para JavaScript.
- **vite, vite-tsconfig-paths**: Ferramentas de build e desenvolvimento para otimizar a construção do projeto e a navegação de módulos com caminhos configuráveis no `tsconfig.json`.

### **Scripts**

O arquivo `package.json` também define alguns **scripts** úteis para o gerenciamento do projeto:

- **build**: Constrói a versão otimizada do projeto para produção usando o Vite.
- **dev**: Inicia o servidor de desenvolvimento utilizando o Remix e Vite, com hot-reloading.
- **lint**: Executa a verificação de código com o **ESLint** para garantir que o código siga as boas práticas.
- **start**: Inicia o servidor de produção, após o build.
- **typecheck**: Verifica os tipos no código utilizando o **TypeScript**.

### **Estrutura do `package.json`**

- **name**: O nome do projeto.
- **private**: Define se o projeto é privado (não será publicado no npm).
- **sideEffects**: Impede a inclusão de arquivos que não possuem efeitos colaterais, otimizando o build.
- **type**: Define o tipo do módulo como `module`, permitindo o uso de **ESModules**.

### **Orientação sobre Adição e Remoção de Dependências**

Sempre que for necessário adicionar ou remover dependências, utilize o **npm** em vez de manipular diretamente o `package.json`. Isso garantirá que as dependências sejam corretamente instaladas e listadas, e também irá atualizar o arquivo `package-lock.json` de forma adequada, que é crucial para a consistência entre os ambientes.

**Comandos recomendados:**

- **Adicionar uma dependência**:
  ```bash
  npm install nome-do-pacote
  ```
- **Adicionar uma dependência de desenvolvimento**:
  ```bash
  npm install --save-dev nome-do-pacote
  ```
- **Remover uma dependência**:
  ```bash
  npm remove nome-do-pacote
  ```

**Atenção!!** Ao adicionar ou remover pacotes, sempre prefira usar os comandos do **npm** para garantir que o `package.json` e o `package-lock.json` sejam gerenciados corretamente, evitando inconsistências nas versões de dependências entre os desenvolvedores e ambientes.

---

## Conclusão

Esta documentação oferece uma visão geral da arquitetura do projeto e explica o papel fundamental do `root.tsx` e do arquivo `package.json`. Além disso, destacamos a importância do arquivo `package-lock.json` para garantir a consistência das dependências no projeto. Para mais detalhes sobre cada rota e componente, consulte a estrutura de arquivos e os comentários no código-fonte.

---
