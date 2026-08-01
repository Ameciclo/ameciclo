# TODO — PointInfoPopup (Modal de Dados)

## 1. Padronização de Nomes e Ícones

### 1.1 Abas vs Cards — Nomenclatura consistente

| Onde | Atual | Deveria ser | Observação |
|---|---|---|---|
| Aba | Segurança | Vias Perigosas | O card chama "Emergências", mas os dados são de sinistros/vias perigosas |
| Card overview | Emergências | Sinistros | Alinhar com nomenclatura da página vias-inseguras |
| Aba | Infraestrutura | Infraestrutura | OK |
| Card overview | Bicicletários | Bicicletários | OK |
| Card overview | Bike PE | Bike PE | OK |
| Card overview | Infraestrutura | Infraestrutura | OK |
| Aba | Contagens | Contagens | OK |
| Aba | Perfil | Perfil | OK |
| Aba | Infrações | Infrações | OK |
| Aba | Análises | (a definir) | Será substituída pelo **Construtor de Prompt** |

### 1.2 "Acidente" → "Sinistro"

No modal, substituir "Acidente" por "Sinistro" em todos os lugares:

- Título: `Por Categoria de Acidente` → `Por Categoria de Sinistro`
- Labels: `Acidente de Moto` → `Sinistro de Moto`, etc.
- Alinhar com a página `vias-inseguras` que já usa "Sinistro"

**Arquivo:** `PointInfoPopup.tsx` — seção `by_category` (linha ~755)

### 1.3 Datas de Último Mês — Informação única e correta

Há **três fontes** diferentes de informação sobre atualidade dos dados:

| Local | Texto atual | Problema |
|---|---|---|
| Subtítulo no gráfico de emergências | `* O último ano (2026) contém dados até abril` | Pode estar hardcoded |
| Label no gráfico (Análises) | `Dados até março` | Outra data |
| Último mês (`last_month_data`) | Ex: `Abril 2025` | Terceira info |

**Solução:** Usar **apenas** o dado vindo da API (`last_month_data.month`) para exibir o período. Remover textos fixos/hardcoded. Criar um único rodapé/nota dinâmico baseado no `last_month_data` e `annual_history`.

### 1.4 "Ver dados completos" — Links para páginas específicas

| Aba | Link atual | Link desejado | Observação |
|---|---|---|---|
| Segurança | `/dados/sinistros` | `/dados/vias-inseguras/[street-name]` | Precisamos do nome ou slug da rua |
| Infraestrutura | `/dados/execucao-cicloviaria` | `/dados/execucao-cicloviaria` | OK (sem página específica por rua) |
| Contagens | `/dados/contagens` | `/dados/contagens/[id-do-ponto]` | O ponto tem `id` único no formato `139-2023-05-11-av-cosme-viana-x-r-21-de-abril` |
| Perfil | `/dados/perfil` | `/dados/perfil` | OK (sem página específica por rua) |
| Infrações | `/dados/infracoes` | `/dados/infracoes` | OK |

**Requisitos:**
- Para Contagens: o `id` do ponto precisa estar disponível nos dados da API (`cyclist_counts.counts[].id`)
- Para Segurança: o slug/nome da rua precisa estar disponível (`location.nearest_street.name` ou `official_name`)

### 1.5 Ordenação de Faixa Etária (Emergências)

Atualmente:
```
31-50  83
18-30  75
Menor de 18  43
Não informado  43
51-70  18
Maior de 70  4
```

**Solução:** Ordenar por ordem lógica de faixa etária:
```
Menor de 18
18-30
31-50
51-70
Maior de 70
Não informado
```

**Arquivo:** `PointInfoPopup.tsx` — seção `by_age_group`

### 1.6 Características dos Ciclistas — Nomes e Ícones

**Atual no modal:**
| Nome | Ícone |
|---|---|
| Capacete | ShieldCheck |
| Mulheres | User |
| Contramão | RotateCcw |
| Carga | Package |
| Juvenis | Baby |
| Calçada | Footprints |
| Bike Compartilhada | Bike |
| Serviços | Wrench |
| Motorizada | Zap |
| Acompanhantes | UserPlus |

**Na página de contagens:**
| Nome |
|---|
| Mulheres |
| Crianças e Adolescentes |
| Carona |
| Capacete |
| Serviço |
| Cargueira |
| Compartilhada |
| Calçada |
| Contramão |

**Problemas:**
1. Nomes diferentes para mesmas métricas (ex: "Carga" vs "Cargueira", "Juvenis" vs "Crianças e Adolescentes", "Acompanhantes" vs "Carona")
2. Ícones diferentes ou ausentes na página de contagens
3. Percentual calculado como `(valor / total)` no modal, mas na página de contagens já vem pronto

**Solução:** Padronizar nomes conforme a página de contagens e usar os mesmos componentes/ícones. Idealmente, extrair um componente compartilhado `CharacteristicBadge` ou similar.

### 1.7 Perfil — Ordenação por título (não por quantidade)

Nos dados de perfil (renda, escolaridade, faixa etária, etc.), ordenar por ordem lógica do título, não pelo valor.

Exemplo faixa etária: `18-25, 26-35, 36-45, 46-60, 60+` (não por quantidade).
Exemplo escolaridade: `Fundamental, Médio, Superior, Pós-graduação` (não por quantidade).
Exemplo renda: `Até 1SM, 1-2SM, 2-3SM, 3-5SM, 5-10SM, +10SM` (não por quantidade).

**Arquivo:** `PointInfoPopup.tsx` — seção `by_edition` (distribuições de raça, gênero, idade, escolaridade, renda)

---

## 2. Aba Análises — Remover conteúdo atual e substituir

### 2.1 Destino do conteúdo atual

| Conteúdo | Deve ir para |
|---|---|
| Evolução de Emergências (gráfico) | Aba Segurança |
| Emergências por Categoria (gráfico) | Aba Segurança |
| Infraestrutura Cicloviária Próxima | Aba Infraestrutura |
| Ciclistas Contados por Ano | Aba Contagens |
| Perfil de Gênero (gráfico pizza) | Aba Perfil |
| Resumo de Indicadores | Aba Visão Geral (ou remover) |

### 2.2 Novo conteúdo: Construtor de Prompt

Substituir a aba Análises por um **construtor de prompt** para LLMs (ChatGPT, Claude, etc.).

**Funcionalidades:**

1. **Seleção de tipo de solicitação** (checkboxes):
   - Melhoria de ciclovia
   - Implantação de paraciclo
   - Melhoria da segurança no trânsito
   - (outras opções a definir)

2. **Seleção de dados a incluir** (checkboxes):
   - Contagens
   - Perfil de ciclistas
   - Infraestrutura próxima
   - Ruas próximas
   - Paraciclos/Bicicletários
   - Sinistros
   - Infrações
   - (combinações predefinidas como "Contagens + Perfil")

3. **Caixa de texto personalizado** — para a pessoa escrever observações adicionais

4. **Campo de endereçamento** — para quem o documento será enviado (ex: "Secretaria de Mobilidade", "Prefeitura", " vereador(a) X")

5. **Saída:** Ao finalizar, o prompt montado é copiado para a área de transferência (CTRL+C ou botão "Copiar"). A pessoa cola no seu LLM favorito para gerar documentos prontos para envio.

**Como funciona internamente:**
- Cada seleção gera um trecho de prompt pré-definido
- Os trechos são concatenados com os dados reais do ponto (ex: "Na Rua X, há Y ciclistas/dia, Z% mulheres...")
- O resultado final é exibido numa caixa de texto e copiado com um clique

---

## 3. Reuso de Componentes

**Problema atual:** Código duplicado entre:
- `PointInfoPopup.tsx` (características, distribuições, gráficos)
- Páginas de contagens, perfil, vias-inseguras

**Solução:** Extrair componentes compartilhados:

- `CharacteristicBadge` — badge de característica de ciclista (ícone + nome + valor + % + barra)
- `AgeGroupDistribution` — distribuição etária com ordenação lógica
- `GenderDistribution` — distribuição por gênero
- `EducationDistribution` — distribuição por escolaridade
- `IncomeDistribution` — distribuição por renda
- `RaceDistribution` — distribuição racial
- `CategoryBreakdown` — lista de categoria + valor + barra

Ideia: criar em `app/components/CicloDados/shared/` e importar tanto no modal quanto nas páginas.

---

## 4. Correções no Mapa

### 4.1 Data NaN nas contagens da Prefeitura (aba Contagens do modal)

No modal, na **aba Contagens**, a data das contagens da prefeitura mostra `NaN` em alguns registros.

**Causa:** A data vem de `extraData` com fallback `item.properties.items?.[0]?.properties?.date` (`MapView.tsx:1178`). Quando o ponto não está num cluster (zoom alto), `items` pode ser `undefined` → `prefData.date` = `undefined` → `new Date(undefined)` = `Invalid Date`.

**Solução:** Validar data antes de converter:
```tsx
date: prefData.date ? new Date(prefData.date).toLocaleDateString('pt-BR') : 'Data não disponível',
```

**Arquivos:** `PointInfoPopup.tsx` (linhas 267 e 312)

### 4.2 Clustering das contagens da Prefeitura (zoom out)

**Problema:** Quando dá zoom out, os clusters de contagens da prefeitura SOMAM o total de ciclistas. Ex: se 3 postos têm 100, 200 e 300, mostra "600".

**Deveria:** Mostrar apenas o valor de UM ponto e indicar quantos outros existem (ex: "100 +2").

**Arquivo:** `MapView.tsx` — linhas 1104-1105

### 4.3 Bolinha laranja/vermelha nas contagens da Ameciclo

É o indicador de cluster em `MapView.tsx:1250-1252`:
```tsx
<div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-1 rounded-full font-bold border border-red-600">
  +{item.properties.count - 1}
</div>
```
Mostra `+N` no canto superior direito do balão verde quando há mais pontos agrupados. É um badge de contagem de cluster — comportamento similar ao que as contagens da prefeitura **deveriam** ter (item 4.2).

### 4.4 Duplicação de contagens da Prefeitura no modal

As contagens da prefeitura entram no modal por **duas rotas diferentes**:
1. **Dentro da queryFn** (`PointInfoPopup.tsx:246-291`): fetch direto do `/dbs/PCR_CONTAGENS.json`
2. **Via extraData do MapView** (rota `onPointClick`, linha 619): filtro por `pontosContagem.features`

Isso pode causar duplicação dos mesmos dados. **Solução:** Remover a busca dentro da queryFn e deixar apenas o `extraData` (ou vice-versa).

---

## 5. Aba Infrações — Dividir card de Total

Atualmente o card de total de infrações é único. Dividir em dois:
1. Total de infrações (grande)
2. Período coberto (anos)

**Arquivo:** `PointInfoPopup.tsx` — linhas ~1456-1468

---

---

## 6. Reformulação do Mural (MuralView)

### Situação atual

O Mural é um dashboard **desconectado** do resto do CicloDados:
- **Dados mock/estáticos** — nenhum dado vem de API real, tudo é hardcoded (`mockRaceData`, arrays fixos de números)
- **Sem integração com filtros do mapa** — não recebe `selectedInfra`, `selectedContagem`, etc.
- **Sem busca** — não tem campo de busca por rua nem por coordenadas GPS (o `CicloDadosHeader` com street search existe mas não é renderizado no layout)
- **Sem compartilhamento/export** — não há botão de compartilhar, copiar link, exportar PDF/CSV
- **Camadas duplicadas** — tem seu próprio sistema de visibilidade de cards (`MuralSidebar`) separado das camadas do mapa (`LeftSidebar`), mas conceitualmente são a mesma coisa
- **Layout engessado** — grid fixo com cards de altura pré-definida, sem responsividade refinada

### Proposta de reformulação

#### 6.1 Integração com dados reais

O mural deve consumir os **mesmos dados** que o mapa e o modal:

| Card atual | Fonte de dados real |
|---|---|
| Sinistros | `emergency_calls` do `POINT_CICLO_NEARBY` ou da API de sinistros |
| Velocidade | Dados de velocidade (se disponível na API) |
| Fluxo de Ciclistas | `cyclist_counts` do `POINT_CICLO_NEARBY` |
| Percentual de Mulheres | `cyclist_profile.gender_distribution` |
| Dados Gerais (Contagens + Sinistros) | `cyclist_counts` + `emergency_calls.annual_history` |
| Perfil de Ciclistas | `cyclist_profile.by_edition` |
| Ciclistas por Raça/Cor | `cyclist_profile.race_distribution` |
| Análise Completa | Combinado de todos os anteriores |

**Formato:** O mural receber um `locationData` opcional (mesmo formato do `PointData`) e renderiza cards com dados reais quando disponível, ou mostra um estado vazio/fallback quando não há dados para a região.

#### 6.2 Busca por rua e coordenadas

Adicionar no topo do mural:
- **Campo de busca por nome de rua** (reaproveitar o `searchStreets` de `CicloDadosHeader.tsx`)
- **Campo de coordenadas GPS** (lat/lon) com validação e botão "Ir"
- Ao buscar, o mural carrega os dados da rua/ponto via `POINT_CICLO_NEARBY` e exibe os cards populados

#### 6.3 Unificação de camadas com o mapa

- O `MuralSidebar` deve incorporar (ou espelhar) os filtros de camada do `LeftSidebar`
- Ao alternar uma camada no mural, o efeito é o mesmo que alternar no mapa (compartilhar estado)
- Ideal: unificar `MuralSidebar` e `LeftSidebar` num único componente de controle lateral, que funciona nos dois modos de visualização

#### 6.4 Layout responsivo e flexível

- Cards com altura **auto** (não fixa), ajustando ao conteúdo
- Grid responsivo: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4`
- Opção de visualização em **lista** (alternável)
- Cards reorganizáveis por drag-and-drop (opcional)

#### 6.5 Gráficos e componentes compartilhados

- Reaproveitar os `Mini*Chart` componentes de `utils/chartData.tsx` (já usados na RightSidebar)
- Quando o dado for o mesmo, usar o **mesmo componente** que o modal ou a página de dados usa
- Ex: o `CategoryBreakdown` de sinistros deve ser o mesmo no modal, no mural e na página vias-inseguras

#### 6.6 Export e compartilhamento

- Botão "Copiar link" com lat/lon (aproveitar lógica do `PointInfoPopup`)
- Botão "Exportar PDF" (usar `window.print()` com CSS de impressão ou lib tipo html2canvas)
- Cada card deve ter um link direto "Ver na página de dados" (ex: card de sinistros → `/dados/vias-inseguras/[street]`)

#### 6.7 Estado vazio e onboarding

- Quando não há busca ativa, mostrar um estado inicial explicativo: "Pesquise uma rua ou insira coordenadas para ver os dados"
- Sugestões de ruas próximas (baseado em geolocalização do browser ou coordenadas da URL)

---

## 7. Caça aos Dados Mock

### Escopo

Varrer todas as páginas de dados e componentes em busca de dados mock/estáticos/hardcoded que deveriam vir de API:

| Arquivo | Provável mock | Linhas |
|---|---|---|
| `MuralView.tsx` | `mockRaceData`, todos os arrays de chart (ex: `[1200, 1450, ...]`) | 443-474, todas as funções de chart |
| `RightSidebar.tsx` | `streets` fallback no `StreetSelectionModal` | ~671-674 |
| `CicloDadosMap.ts` ou hooks | Dados de contagem mock para fallback | ? |
| `dados.contagens.tsx` (página de contagens) | Dados estáticos no loader | Verificar |
| `dados.vias-inseguras.tsx` | Dados mock | Verificar |
| `dados.perfil.tsx` | Dados mock | Verificar |
| `dados.infracoes.tsx` | Dados mock | Verificar |

### Critérios

- **Todo número que não vem de `fetch()` ou `useQuery()` é suspeito**
- Arrays fixos dentro de funções de chart (`series: [{ data: [1200, 1450, ...] }]`)
- Objetos de dados que não têm uma query associada
- Fallbacks que escondem dados reais (ex: `streets: [ ... ]` no `StreetSelectionModal`)
- Componentes que renderizam "exemplo" em vez de "sem dados"

### Ação

Para cada ocorrência:
1. Identificar se o dado mock pode ser substituído por uma chamada de API existente
2. Se não existir API, substituir por estado vazio com mensagem clara ("Dados indisponíveis para esta região")
3. Se o mock é proposital (ex: protótipo de funcionalidade futura), marcar com comentário `// TODO: substituir por API quando disponível`

---

## 8. Ordem de Execução Sugerida

1. ~~Backend: `clogra_codi` + `nearby_streets`~~ ✅
2. ~~Frontend: integrar `clogra_codi` e `nearby_streets` no modal~~ ✅
3. ~~Remover botão flutuante "Expandir gráficos" da RightSidebar~~ ✅
4. Fix: data NaN nas contagens da prefeitura
5. Fix: duplicação de contagens da prefeitura no modal
6. Fix: clustering das contagens da prefeitura (não somar)
7. Padronizar nomes (Acidente → Sinistro, abas vs cards)
8. Corrigir datas do último mês (dinâmico via API)
9. Ajustar "Ver dados completos" com links específicos
10. Ordenar faixa etária corretamente
11. Extrair componentes compartilhados (CharacteristicBadge, etc.)
12. Padronizar características de ciclistas (nomes + ícones)
13. Ordenar distribuições do perfil por ordem lógica
14. Mover conteúdo da aba Análises para as abas corretas
15. Dividir card de total de infrações em Total + Período
16. Caça aos dados mock em todas as páginas
17. Reformulação do Mural (integração com dados reais, busca, unificação com mapa)
18. Implementar Construtor de Prompt na aba Análises
