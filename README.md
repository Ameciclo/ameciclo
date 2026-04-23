# 🚴 Ameciclo - Plataforma de Dados de Mobilidade Ativa

<div align="center">
  <img src="public/miniatura-ameciclo-logo.webp" alt="Ameciclo Logo" width="200"/>
  
  ### Associação Metropolitana de Ciclistas do Recife
  
  [![Node.js](https://img.shields.io/badge/Node.js-24.x-green.svg)](https://nodejs.org/)
  [![TanStack Start](https://img.shields.io/badge/TanStack%20Start-1.167-blue.svg)](https://tanstack.com/start)
  [![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.1-blue.svg)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
</div>

---

## 📋 Sobre o Projeto

A **Plataforma Ameciclo** é uma aplicação web full-stack que centraliza e visualiza dados abertos sobre mobilidade ativa na Região Metropolitana do Recife. Desenvolvida com tecnologias modernas, oferece ferramentas interativas para estudantes, jornalistas, pesquisadores, cicloativistas e cidadãos interessados em uma cidade mais humana, democrática e sustentável.

### 🎯 Principais Funcionalidades

- **📊 Observatórios Especializados**: Ideciclo, Sinistros Fatais, Vias Inseguras, SAMU, CicloDados
- **🗺️ Visualizações Interativas**: Mapas (Mapbox), gráficos (Highcharts), tabelas dinâmicas
- **📈 Contagens de Ciclistas**: Dados históricos com análises comparativas
- **📚 Biciclopédia**: FAQ sobre mobilidade ativa
- **📁 Documentos Públicos**: Acesso a relatórios e estudos
- **🎨 Acessibilidade**: Controles WCAG (tamanho de fonte, alto contraste, dark mode)

---

## 🛠️ Stack Tecnológica

### Core
- **[TanStack Start](https://tanstack.com/start)** 1.167 - Framework full-stack com SSR
- **[TanStack Router](https://tanstack.com/router)** 1.168 - Roteamento tipado file-based
- **[React](https://react.dev/)** 18.2 - Biblioteca UI
- **[TypeScript](https://www.typescriptlang.org/)** 5.1 - Tipagem estática
- **[Vite](https://vitejs.dev/)** 7.3 - Build tool

### Deploy & Runtime
- **[Cloudflare Workers](https://workers.cloudflare.com/)** - Runtime edge via `@cloudflare/vite-plugin`
- **[Wrangler](https://developers.cloudflare.com/workers/wrangler/)** 4.84 - CLI de deploy

### UI & Styling
- **[Tailwind CSS](https://tailwindcss.com/)** 3.4 - Framework CSS utility-first
- **[Framer Motion](https://www.framer.com/motion/)** - Animações
- **[Lucide React](https://lucide.dev/)** - Ícones

### Visualização de Dados
- **[Highcharts](https://www.highcharts.com/)** - Gráficos interativos
- **[Mapbox GL](https://www.mapbox.com/)** - Mapas interativos
- **[FullCalendar](https://fullcalendar.io/)** - Calendário de eventos

### Gerenciamento de Estado
- **[TanStack Query](https://tanstack.com/query)** - Cache e sincronização (SSR via `@tanstack/react-router-with-query`)
- **React Context API** - Estado global

---

## 🚀 Como Rodar o Projeto

### ⚠️ Requisitos Obrigatórios

- **Node.js** 24.x (LTS) — a versão exata está pinada em `mise.toml`
- **Git** ([Download](https://git-scm.com/))

> **Dica**: recomendamos [mise](https://mise.jdx.dev/) para gerenciar a versão do Node. Com `mise` instalado, basta rodar `mise install` na raiz do projeto e a versão correta será instalada automaticamente.

### 📦 Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/Ameciclo/ameciclo.git
cd ameciclo

# 2. Ative a versão do Node (se usar mise)
mise install

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

O projeto estará disponível em: **http://localhost:5173**

### 🔧 Scripts Disponíveis

```bash
npm run dev        # Inicia servidor de desenvolvimento (Vite)
npm run build      # Gera build de produção
npm run preview    # Servidor local para inspecionar o build
npm run deploy     # Build + deploy no Cloudflare Workers (wrangler)
npm run lint       # Verifica qualidade do código
npm run typecheck  # Verifica tipos TypeScript
```

---

## 📁 Estrutura do Projeto

```
ameciclo/
├── app/
│   ├── components/      # 220+ componentes React
│   │   ├── Commom/      # Componentes globais
│   │   ├── CicloDados/  # Plataforma colaborativa
│   │   ├── ViasInseguras/ # Análise de vias
│   │   └── ...
│   ├── routes/          # 29 rotas (file-based routing via TanStack Router)
│   ├── loader/          # Loaders para SSR
│   ├── services/        # Lógica de negócio e APIs
│   ├── contexts/        # React Context
│   ├── hooks/           # Custom hooks
│   └── utils/           # Utilitários
├── public/              # Assets estáticos
├── docs/                # Documentação de APIs
└── package.json
```

---

## 🌐 Variáveis de Ambiente

Em produção (Cloudflare Workers), a configuração vive no `wrangler.jsonc`:

- **Valores públicos** (URLs, IDs de calendário, etc.) ficam no bloco `vars` do `wrangler.jsonc` e são acessíveis em runtime via `process.env.*` graças à flag `nodejs_compat`.
- **Segredos** (tokens, chaves de API) **não** vão no `wrangler.jsonc`. Use:

  ```bash
  wrangler secret put MAPBOX_ACCESS_TOKEN
  wrangler secret put GOOGLE_CALENDAR_API_KEY
  ```

### Desenvolvimento local

Crie um arquivo `.dev.vars` na raiz do projeto (já está no `.gitignore`) para carregar segredos durante `npm run dev`:

```env
MAPBOX_ACCESS_TOKEN=pk.seu_token_aqui
GOOGLE_CALENDAR_API_KEY=sua_chave_aqui
```

Variáveis públicas do `wrangler.jsonc` (`SITE_URL`, `GOOGLE_CALENDAR_EXTERNAL_ID`, `GOOGLE_CALENDAR_INTERNAL_ID`) são carregadas automaticamente.

---

## ☁️ Deploy

O deploy é feito diretamente para Cloudflare Workers via Wrangler:

```bash
# Login (primeira vez)
npx wrangler login

# Deploy
npm run deploy
```

A configuração do Worker (nome, domínios customizados, vars) está no `wrangler.jsonc`. O site é servido nos domínios **ameciclo.org** e **www.ameciclo.org**.

---

## 📖 Documentação

Acesse a documentação completa em: **[ameciclo.org/documentacao](https://ameciclo.org/documentacao)**

A documentação inclui:
- Visão geral da arquitetura
- Estrutura detalhada do projeto
- Guia de componentes
- Rotas e APIs
- Boas práticas de desenvolvimento
- Configurações e deploy
- Solução de problemas

---

## 🤝 Como Contribuir

Contribuições são bem-vindas! Siga os passos:

1. **Clone o repositório**
   ```bash
   git clone https://github.com/Ameciclo/ameciclo.git
   cd ameciclo
   ```

2. **Crie uma branch**
   ```bash
   git checkout -b feature/minha-funcionalidade
   ```

3. **Desenvolva e teste**
   ```bash
   npm install
   npm run dev
   npm run lint
   npm run typecheck
   ```

4. **Commit e push**
   ```bash
   git add .
   git commit -m "feat: adiciona nova funcionalidade"
   git push origin feature/minha-funcionalidade
   ```

5. **Abra um Pull Request** no GitHub

### 📝 Padrões de Código

- Use **Conventional Commits**: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`
- Sempre tipifique com **TypeScript**
- Siga os padrões de estilo do **ESLint**
- Componentes em **PascalCase**, arquivos de serviço em **camelCase**

---

## 🐛 Problemas Comuns

### Erro: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Port already in use"
```bash
lsof -ti:5173 | xargs kill -9
```

### Erro: Mapbox não carrega
Configure `MAPBOX_ACCESS_TOKEN` no arquivo `.dev.vars` (dev) ou via `wrangler secret put MAPBOX_ACCESS_TOKEN` (produção).

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📞 Contato

**Ameciclo** - Associação Metropolitana de Ciclistas do Recife

- 🌐 Website: [ameciclo.org](https://ameciclo.org)
- 📧 Email: contato@ameciclo.org
- 📱 Instagram: [@ameciclo](https://instagram.com/ameciclo)

---

<div align="center">
  Feito com ❤️ pela comunidade Ameciclo
</div>
