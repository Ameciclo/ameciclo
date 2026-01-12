# Ameciclo.org - Migração Next.js → Remix

- [Issue desta Migração](https://github.com/Ameciclo/ameciclo/issues/108)
- [Pull Request desta Migração](https://github.com/Ameciclo/ameciclo/pull/109)

## Status da Migração: 🟡 Em Progresso

### Tecnologias Utilizadas
- **Framework**: Remix v2.16.5
- **Runtime**: Node.js >=20.0.0
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Mapas**: Mapbox GL + React Map GL v6
- **Gráficos**: Highcharts + React Google Charts
- **Animações**: Framer Motion
- **Deploy**: Vercel

## Configurações
  - [x] **INSTALAÇÃO** - Remoção do projeto Next e Instalação do projeto em Remix
  - [x] **SEO** - Implementação completa de meta tags e SEO
  - [x] **ARQUITETURA** - Definir arquitetura de processamento de dados para o Front em Remix (actions e loaders)
    - ✅ Loaders organizados em `app/loader/`
    - ✅ Componentes organizados por funcionalidade
    - ✅ Services para APIs externas em `app/services/`
  - [ ] **DEPLOY** - Pipeline de produção
  - [ ] **DOCKERIZAÇÃO** - Containerização da aplicação

--------------

# Páginas Implementadas

## Componentes Comuns ✅
- [x] **root.tsx** - Layout principal da aplicação
- [x] **Footer.tsx** - Rodapé com informações de contato e links
- [x] **Navbar.tsx** - Navegação principal com submenu de dados
  - [x] **AmecicloLogo.tsx** - Logo responsivo com animações
  - [x] **DataSubmenu.tsx** - Submenu para seção de dados
  - [ ] 🐛 **BUG** - Logo ainda não implementada completamente
- [x] **GoogleAnalytics.tsx** - Integração com Google Analytics
- [x] **404 - Página Não Encontrada** (`$.tsx`)
- [x] **Breadcrumb.tsx** - Navegação hierárquica
  - [ ] 🐛 **BUG** - Subcomponente BreadcrumbItem não linka para páginas dos itens
- [x] **SEO.tsx** - Componente para meta tags
- [x] **AccessibilityControls.tsx** - Controles de acessibilidade
- [x] **ChangeThemeButton.tsx** - Botão para alternar tema
   
## Páginas Principais (ameciclo.org) ✅
  - [x] **`/` (Home)** - Página inicial
    - [x] **Banner.tsx** - Banner principal
    - [x] **SectionCallToAction.tsx** - Seção de chamada para ação
    - [x] **SectionCarousel.tsx** - Carrossel de conteúdo
          - [ ] 🐛 **BUG** - Design quebrado (possível problema com lib `keen-slider`)
    - [x] **SectionData.tsx** - Seção de dados
          - [ ] 🐛 **BUG** - Problemas com a lib de animação
  - [x] **`/quem_somos`** - Sobre a organização
    - [x] **Tabs.tsx** - Abas de conteúdo
      - [ ] 🐛 **BUG** - Botões de tabs não estão filtrando
  - [x] **`/agenda`** - Calendário de eventos
    - [x] **EventCalendar.tsx** - Calendário integrado com Google Calendar
    - [ ] 🐛 **BUG** - Chave da API do Google Calendar não definida
  - [x] **`/projetos`** - Portfólio de projetos
    - [x] **ProjectCard.tsx** - Cartões de projetos
      - [ ] 🐛 **BUG** - Botão para exibir mais projetos não responde
  - [x] **`/contato`** - Informações de contato com mapa
    - [x] **AmecicloMap.tsx** - Mapa interativo (react-map-gl v6)
    - [ ] 🐛 **BUG** - Botão de participe não está direcionando
  - [x] **`/biciclopedia`** - FAQ sobre mobilidade urbana
    - [x] **SearchComponent.tsx** - Busca em perguntas frequentes
    - [x] **AccordionFAQ.tsx** - Accordion para categorias
  - [x] **`/participe`** - Página de engajamento
    - [x] Informações sobre voluntariado
    - [x] Links para associação e doações
    - [x] Integração com Bicibot (denuncias)
  - [x] **`/documentacao`** - Documentação técnica
    - [x] Guia completo para desenvolvedores
    - [x] Controles de acessibilidade avançados
  - [x] **`/status`** - Status dos serviços

## Plataforma de Dados (dados.ameciclo.org) 🟡
  - [x] **`/dados`** - Página inicial da plataforma de dados
    - [x] **ExplanationBoxes.tsx** - Caixas explicativas
    - [x] **CardsSession.tsx** - Seção de cartões
    - [x] **ImagesGrid.tsx** - Grade de imagens de parceiros

  - [x] **`/dados/ciclodados`** - 🆕 **NOVA PLATAFORMA IMPLEMENTADA**
    - [x] **CicloDadosHeader.tsx** - Cabeçalho com toggle mapa/mural
    - [x] **LeftSidebar.tsx** - Filtros avançados (infraestrutura, contagem, PDC, infrações, sinistros, estacionamento, perfil)
    - [x] **RightSidebar.tsx** - Cards com dados e gráficos
    - [x] **MapView.tsx** - Visualização do mapa com camadas interativas
    - [x] **MuralView.tsx** - Visualização em mural
    - [x] **FloatingChat.tsx** - Chat flutuante
    - [x] **Hooks customizados** - 15+ hooks para gerenciamento de estado e dados
    - [x] **Integração com APIs** - cyclist-counts.atlas.ameciclo.org e cyclist-profile.atlas.ameciclo.org
    - [ ] 🚧 **PENDENTE** - Integração com API real (alguns dados mockados)
    - [ ] 🚧 **PENDENTE** - Estados de loading e tratamento de erros

  - [x] **`/dados/contagens`** - Contagens de ciclistas
    - [x] **CountsTable.tsx** - Tabela de contagens
    - [x] **CountsMap.tsx** - Mapa de pontos de contagem
    - [x] **FlowContainer.tsx** - Container de fluxo
    - [x] **HourlyCyclistsChart.tsx** - Gráfico por horário
    - [x] **InfoCards.tsx** - Cartões informativos

  - [x] **`/dados/documentos`** - Estudos e pesquisas
    - [x] **DocumentList.tsx** - Lista de documentos
    - [x] **DocumentsSession.tsx** - Seção de documentos

  - [x] **`/dados/ideciclo`** - Índice de qualidade cicloviaria
    - [x] **IdecicloClientSide.tsx** - Componente principal
    - [x] **StatisticsBoxIdeciclo.tsx** - Estatísticas
    - [x] **IdecicloTable.tsx** - Tabela de dados
    - [x] **ExplanationBoxesIdeciclo.tsx** - Explicações

  - [x] **`/dados/perfil`** - Perfil de ciclistas
    - [x] **PerfilDashboard.tsx** - Dashboard principal

  - [x] **`/dados/execucaocicloviaria`** - Execução cicloviaria
    - [x] **StatisticsBox.tsx** - Caixa de estatísticas
    - [x] **CyclingInfrastructureByCity.tsx** - Infraestrutura por cidade

  - [x] **`/dados/loa`** - Orçamento estadual para o clima
  - [x] **`/dados/dom`** - Orçamento municipal para o clima
  - [x] **`/dados/samu`** - Chamados de sinistros SAMU
    - [x] **SamuClientSide.tsx** - Componente principal
    - [x] **SamuChoroplethMap.tsx** - Mapa coroplético
  - [x] **`/dados/vias-inseguras`** - Ranking de vias inseguras
    - [x] **ViasInsegurasClientSide.tsx** - Componente principal
    - [x] **ViasInsegurasMap.tsx** - Mapa de vias
    - [x] **ViasRankingTable.tsx** - Tabela de ranking
    - [x] **AdvancedFilters.tsx** - Filtros avançados
    - [x] **ConcentrationChart.tsx** - Gráfico de concentração
  - [x] **`/dados/sinistros-fatais`** - Sinistros fatais no trânsito
    - [x] **SinistrosFataisClientSide.tsx** - Componente principal
    - [x] **CollisionMatrix.tsx** - Matriz de colisões
    - [x] **SelectableInfoCards.tsx** - Cartões selecionáveis

--------------

# Arquitetura e Organização

## Estrutura de Pastas
```
app/
├── components/          # Componentes React organizados por funcionalidade
│   ├── Commom/           # Componentes comuns (Navbar, Footer, etc.)
│   ├── CicloDados/       # Componentes da plataforma CicloDados
│   ├── Contagens/        # Componentes de contagens
│   ├── Charts/           # Componentes de gráficos
│   └── [Outras seções]/  # Organizados por funcionalidade
├── routes/             # Rotas do Remix (file-based routing)
├── loader/             # Loaders para carregamento de dados
├── services/           # Serviços para APIs externas
├── hooks/              # Hooks customizados
├── contexts/           # Contextos React
├── utils/              # Utilitários e helpers
└── types/              # Definições de tipos TypeScript
```

## APIs Integradas
- **CMS Strapi**: cms.ameciclo.org
- **Cyclist Counts**: cyclist-counts.atlas.ameciclo.org
- **Cyclist Profile**: cyclist-profile.atlas.ameciclo.org
- **Google Calendar API**: Para eventos da agenda
- **Mapbox**: Para mapas interativos

## Componentes de Destaque

### CicloDados - Nova Plataforma 🆕
Plataforma integrada de visualização de dados de mobilidade urbana com:
- **15+ hooks customizados** para gerenciamento de estado
- **Filtros avançados** por categoria (infraestrutura, contagens, PDC, etc.)
- **Mapa interativo** com múltiplas camadas
- **Integração com APIs** em tempo real
- **Interface responsiva** com sidebars colapsáveis

### Sistema de Navegação
- **Navbar responsiva** com animações Framer Motion
- **Submenu de dados** com todas as seções da plataforma
- **Breadcrumb dinâmico** para navegação hierárquica

### Acessibilidade
- **Controles de acessibilidade** avançados
- **Suporte a temas** (claro/escuro)
- **Alto contraste** configurável
- **Tamanho de fonte** ajustável

--------------

# Bugs Conhecidos 🐛

## Prioridade Alta
- 🔴 **Google Calendar API** - Chave não definida na agenda
- 🔴 **Carousel Design** - Layout quebrado (keen-slider)
- 🔴 **Tabs Filtering** - Botões de filtro não funcionam

## Prioridade Média  
- 🟡 **Logo Implementation** - Logo ainda não completamente implementada
- 🟡 **Breadcrumb Links** - Links dos itens não funcionam
- 🟡 **Project Buttons** - Botão "ver mais" não responde
- 🟡 **Contact Redirect** - Botão participe não direciona
- 🟡 **Animation Library** - Problemas com lib de animação

--------------

# Próximos Passos 🚀

## Deploy e Infraestrutura
- [ ] **Pipeline CI/CD** - Configuração de deploy automatizado
- [ ] **Dockerização** - Container para produção
- [ ] **Monitoramento** - Logs e métricas de performance

## Melhorias Técnicas
- [ ] **Error Boundaries** - Tratamento de erros mais robusto
- [ ] **Loading States** - Estados de carregamento consistentes
- [ ] **Cache Strategy** - Estratégia de cache para APIs
- [ ] **Performance** - Otimização de bundle e lazy loading

## Funcionalidades
- [ ] **Mural View** - Implementação completa da visualização em mural
- [ ] **Real-time Data** - Integração com dados em tempo real
- [ ] **Export Features** - Exportação de dados e relatórios
- [ ] **Advanced Analytics** - Análises mais detalhadas

--------------

# Como Contribuir 🤝

## Desenvolvimento Local
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar testes
npm run lint
npm run typecheck
```

## Estrutura de Commits
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes

## Links Úteis
- **Repositório**: [github.com/Ameciclo/ameciclo](https://github.com/Ameciclo/ameciclo)
- **Documentação**: [ameciclo.org/documentacao](https://ameciclo.org/documentacao)
- **Issues**: [github.com/Ameciclo/ameciclo/issues](https://github.com/Ameciclo/ameciclo/issues)
- **Participe**: [ameciclo.org/participe](https://ameciclo.org/participe)

--------------

# Licença 📄

Este projeto está licenciado sob a **GNU Affero General Public License v3.0 (AGPL-3.0)**.

## O que isso significa?

- ✅ **Uso livre**: Você pode usar este software para qualquer propósito
- ✅ **Modificação**: Você pode modificar o código fonte
- ✅ **Distribuição**: Você pode distribuir o software original ou modificado
- ✅ **Uso comercial**: Permitido uso comercial
- ⚠️ **Copyleft**: Modificações devem ser disponibilizadas sob a mesma licença
- ⚠️ **Código aberto**: Se você executar uma versão modificada em um servidor, deve disponibilizar o código fonte

## Copyright

**Copyright (C) 2024 Ameciclo - Associação Metropolitana de Ciclistas do Recife**

Para mais detalhes, consulte o arquivo [LICENSE](./LICENSE) ou visite: https://www.gnu.org/licenses/agpl-3.0.html
