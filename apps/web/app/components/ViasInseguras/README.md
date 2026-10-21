# Componentes do Observatório de Vias Inseguras

Este diretório contém todos os componentes relacionados ao Observatório de Vias Inseguras, uma ferramenta completa para análise de sinistros de trânsito por via no Recife.

## Estrutura dos Componentes

### 🏗️ Componente Principal
- **`ViasInsegurasClientSide.tsx`** - Componente principal que orquestra todas as funcionalidades

### 📊 Componentes de Visualização
- **`ConcentrationChart.tsx`** - Gráfico de concentração de sinistros (Highcharts)
- **`ViasInsegurasMap.tsx`** - Mapa interativo das vias com sinistros (MapBox)
- **`TemporalAnalysis.tsx`** - Análise temporal com múltiplos gráficos

### 🔍 Componentes de Interação
- **`ViaSearch.tsx`** - Busca e seleção de vias específicas
- **`AdvancedFilters.tsx`** - Filtros avançados para análise personalizada

### 📋 Componentes de Dados
- **`ViasRankingTable.tsx`** - Tabela de ranking das vias mais perigosas
- **`InsightsPanel.tsx`** - Painel de insights e recomendações inteligentes

## Funcionalidades Implementadas

### 🎯 Análise de Concentração
- Gráfico de percentuais acumulativos
- Identificação de vias críticas
- Cálculo de densidade de sinistros por quilômetro

### 🗺️ Mapeamento Interativo
- Visualização geoespacial das vias
- Filtros por período
- Legenda dinâmica baseada na intensidade
- Controles de navegação personalizados

### 📈 Análise Temporal
- Evolução anual dos sinistros
- Distribuição mensal e sazonal
- Padrões por dia da semana
- Análise por horário do dia

### 🔍 Busca Inteligente
- Busca em tempo real por nome da via
- Sugestões automáticas
- Vias mais consultadas
- Integração com API de busca

### ⚙️ Filtros Avançados
- Seleção de período personalizado
- Filtro por tipo de desfecho
- Limite de vias para análise
- Intervalo de agrupamento temporal

### 💡 Insights e Recomendações
- Análise automática de padrões
- Recomendações baseadas em dados
- Identificação de tendências
- Sugestões de intervenção

## APIs Utilizadas

### Endpoints da API SAMU
- `/samu-calls/streets/summary` - Resumo geral
- `/samu-calls/streets/top` - Ranking das vias
- `/samu-calls/streets/map` - Dados geoespaciais
- `/samu-calls/streets/history` - Histórico temporal
- `/samu-calls/streets/search` - Busca por via

## Tecnologias

### Visualização
- **Highcharts** - Gráficos interativos
- **MapBox GL JS** - Mapas interativos
- **React Map GL** - Integração React com MapBox

### Interface
- **Tailwind CSS** - Estilização
- **React Hooks** - Gerenciamento de estado
- **TypeScript** - Tipagem estática

### Dados
- **Fetch API** - Requisições HTTP
- **JSON** - Formato de dados
- **GeoJSON** - Dados geoespaciais

## Estrutura de Dados

### Resumo Geral
```typescript
interface SummaryData {
  totalSinistros: number;
  totalVias: number;
  periodoInicio: string;
  periodoFim: string;
  anoMaisPerigoso: {
    ano: string;
    total: number;
  };
  viaMaisPerigosa: {
    nome: string;
    total: number;
    percentual: number;
  };
}
```

### Ranking de Vias
```typescript
interface ViaRanking {
  top: number;
  sinistros: number;
  km: number;
  sinistros_por_km: number;
  percentual_total: number;
}
```

### Dados Temporais
```typescript
interface YearData {
  ano: number;
  sinistros: number;
  meses: Record<string, number>;
  dias_semana: Record<string, number>;
  horarios: Record<string, number>;
  dias_com_dados: number;
  dias_com_sinistros: number;
}
```

## Como Usar

### Importação
```typescript
import { ViasInsegurasClientSide } from '~/components/ViasInseguras';
```

### Uso Básico
```typescript
<ViasInsegurasClientSide
  summaryData={summaryData}
  topViasData={topViasData}
  mapData={mapData}
  historyData={historyData}
/>
```

## Navegação por Abas

O componente principal organiza as funcionalidades em abas:

1. **📊 Visão Geral** - Resumo e gráfico de concentração
2. **🗺️ Mapa** - Visualização geoespacial interativa
3. **🏆 Ranking** - Tabela das vias mais perigosas
4. **📈 Análise Temporal** - Gráficos de evolução temporal
5. **💡 Insights** - Análises e recomendações automáticas
6. **🔍 Buscar Via** - Ferramenta de busca específica
7. **⚙️ Filtros** - Configurações avançadas

## Responsividade

Todos os componentes são totalmente responsivos:
- **Mobile First** - Otimizado para dispositivos móveis
- **Breakpoints** - Adaptação para tablet e desktop
- **Touch Friendly** - Controles otimizados para touch
- **Performance** - Carregamento otimizado

## Acessibilidade

- **ARIA Labels** - Rótulos para leitores de tela
- **Keyboard Navigation** - Navegação por teclado
- **Color Contrast** - Contraste adequado
- **Focus Management** - Gerenciamento de foco

## Performance

### Otimizações Implementadas
- **Lazy Loading** - Carregamento sob demanda
- **Debouncing** - Busca com delay
- **Memoization** - Cache de cálculos
- **Code Splitting** - Divisão de código

### Métricas
- **Bundle Size** - Otimizado para web
- **Loading Time** - Carregamento rápido
- **Interactivity** - Resposta imediata

## Manutenção

### Estrutura Modular
- Cada componente tem responsabilidade única
- Fácil manutenção e extensão
- Reutilização de código
- Testes unitários facilitados

### Documentação
- Código bem documentado
- TypeScript para tipagem
- Comentários explicativos
- Exemplos de uso

## Próximos Passos

### Melhorias Planejadas
- [ ] Cache inteligente de dados
- [ ] Exportação de relatórios
- [ ] Comparação entre períodos
- [ ] Alertas automáticos
- [ ] Integração com outras fontes de dados

### Novas Funcionalidades
- [ ] Análise preditiva
- [ ] Clustering de vias similares
- [ ] Heatmaps temporais
- [ ] Integração com redes sociais
- [ ] API pública para desenvolvedores