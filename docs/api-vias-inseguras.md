# API Vias Inseguras - Especificação de Dados

## Visão Geral
API para fornecer dados sobre vias inseguras no Recife baseado nos atendimentos do SAMU para sinistros de trânsito.

## Endpoints Necessários

### 1. Estatísticas Gerais
**Endpoint:** `/api/vias-inseguras/estatisticas`

**Resposta:**
```json
{
  "totalSinistros": 15420,
  "totalVias": 2847,
  "periodoInicio": "2018",
  "periodoFim": "2024",
  "anoMaisPerigoso": {
    "ano": "2022",
    "total": 2834
  },
  "viaMaisPerigosa": {
    "nome": "Av. Boa Viagem",
    "total": 287,
    "percentual": 1.86
  }
}
```

### 2. Ranking das Vias
**Endpoint:** `/api/vias-inseguras/ranking`

**Parâmetros:**
- `periodo` (opcional): "2018-2024", "2022-2024", "2024"
- `limite` (opcional): número de vias a retornar (padrão: 50)

**Resposta:**
```json
{
  "vias": [
    {
      "ranking": 1,
      "nome": "Av. Boa Viagem",
      "sinistros": 287,
      "percentual": 1.86,
      "extensao": 8.2,
      "sinistrosPorKm": 35.0,
      "coordenadas": {
        "inicio": [-34.9058, -8.1137],
        "fim": [-34.8951, -8.0889]
      }
    }
  ],
  "totalSinistros": 15420,
  "periodo": "2018-2024"
}
```

### 3. Dados para Mapa
**Endpoint:** `/api/vias-inseguras/mapa`

**Parâmetros:**
- `periodo` (opcional): "2018-2024", "2022-2024", "2024"

**Resposta:**
```json
{
  "vias": [
    {
      "nome": "Av. Boa Viagem",
      "sinistros": 287,
      "intensidade": "alta",
      "geometria": {
        "type": "LineString",
        "coordinates": [
          [-34.9058, -8.1137],
          [-34.9051, -8.1130],
          [-34.8951, -8.0889]
        ]
      }
    }
  ],
  "legendas": {
    "baixa": "1-10 sinistros",
    "media": "11-50 sinistros", 
    "alta": "51+ sinistros"
  }
}
```

### 4. Dados para Gráfico de Concentração
**Endpoint:** `/api/vias-inseguras/concentracao`

**Parâmetros:**
- `periodo` (opcional): "2018-2024", "2022-2024", "2024"
- `tipo`: "vias" ou "quilometragem"

**Resposta:**
```json
{
  "tipo": "vias",
  "dados": [
    {
      "quantidade": 10,
      "percentualSinistros": 33.2,
      "percentualAcumulado": 33.2
    },
    {
      "quantidade": 50,
      "percentualSinistros": 15.8,
      "percentualAcumulado": 49.0
    },
    {
      "quantidade": 100,
      "percentualSinistros": 8.5,
      "percentualAcumulado": 57.5
    }
  ]
}
```

### 5. Evolução Temporal
**Endpoint:** `/api/vias-inseguras/evolucao`

**Parâmetros:**
- `via` (opcional): nome da via específica

**Resposta:**
```json
{
  "evolucao": [
    {
      "ano": 2018,
      "sinistros": 2156
    },
    {
      "ano": 2019,
      "sinistros": 2298
    },
    {
      "ano": 2020,
      "sinistros": 1987
    }
  ],
  "via": null
}
```

## Dados Necessários no Backend

### Tabela: sinistros_vias
```sql
CREATE TABLE sinistros_vias (
  id SERIAL PRIMARY KEY,
  via_nome VARCHAR(255) NOT NULL,
  via_extensao DECIMAL(10,2),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  data_sinistro DATE,
  ano INTEGER,
  mes INTEGER,
  gravidade VARCHAR(50),
  tipo_sinistro VARCHAR(100),
  geometria_via GEOMETRY(LINESTRING, 4326),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Índices Recomendados
```sql
CREATE INDEX idx_sinistros_vias_nome ON sinistros_vias(via_nome);
CREATE INDEX idx_sinistros_vias_ano ON sinistros_vias(ano);
CREATE INDEX idx_sinistros_vias_data ON sinistros_vias(data_sinistro);
CREATE INDEX idx_sinistros_vias_geometria ON sinistros_vias USING GIST(geometria_via);
```

## Processamento de Dados

### 1. Agregação por Via
- Agrupar sinistros por nome da via
- Calcular total de sinistros por via
- Calcular percentual em relação ao total geral
- Calcular sinistros por quilômetro (sinistros/extensão)

### 2. Classificação de Intensidade
```python
def classificar_intensidade(sinistros):
    if sinistros >= 51:
        return "alta"
    elif sinistros >= 11:
        return "media"
    else:
        return "baixa"
```

### 3. Cálculo de Concentração
- Ordenar vias por número de sinistros (decrescente)
- Calcular percentual acumulado de sinistros
- Gerar pontos para gráfico de Pareto

## Considerações Técnicas

### Cache
- Implementar cache Redis para consultas frequentes
- TTL de 1 hora para dados agregados
- Invalidar cache quando novos dados forem inseridos

### Performance
- Usar views materializadas para agregações complexas
- Implementar paginação nos endpoints de ranking
- Otimizar consultas geoespaciais com índices apropriados

### Filtros Adicionais (Futuro)
- Filtro por tipo de sinistro
- Filtro por gravidade
- Filtro por período do dia
- Filtro por dia da semana