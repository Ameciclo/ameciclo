### Resumo Geral de Vias

**Endpoint:** `/samu-calls/streets/summary`

**Método:** GET

**Descrição:** Retorna estatísticas gerais sobre vias com sinistros do SAMU.

**Exemplo de Uso:**
```
GET http://localhost:8080/samu-calls/streets/summary
```

**Resposta:**
```json
{
  "totalSinistros": 15420,
  "totalVias": 2341,
  "periodoInicio": "2016",
  "periodoFim": "2024",
  "mesUltimoDado": "2024.03",
  "anoMaisPerigoso": {
    "ano": "2023",
    "total": 1850
  },
  "viaMaisPerigosa": {
    "nome": "Avenida Norte Miguel Arraes de Alencar",
    "id": 1,
    "total": 245,
    "percentual": 1.59,
    "extensao": 2321
  }
}
```

### Top Vias com Dados Cumulativos

**Endpoint:** `/samu-calls/streets/top`

**Método:** GET

**Parâmetros:**
- `intervalo` (opcional): Intervalo para agrupamento (padrão: 1)
- `anoInicio` (opcional): Ano inicial para filtrar (padrão: 2018)
- `anoFim` (opcional): Ano final para filtrar (padrão: 2024)
- `limite` (opcional): Número máximo de vias (padrão: 50)

**Descrição:** Retorna análise cumulativa das vias mais perigosas, com dados de sinistros, quilometragem e densidade.

**Exemplos de Uso:**
```
# Top 50 vias com dados cumulativos
GET http://localhost:8080/samu-calls/streets/top

# Top 20 vias entre 2020-2023 com intervalo de 5
GET http://localhost:8080/samu-calls/streets/top?limite=20&anoInicio=2020&anoFim=2023&intervalo=5
```

**Resposta:**
```json
{
  "dados": [
    {
      "top": 1,
      "sinistros": 245,
      "km": 12.5,
      "sinistros_por_km": 19.6,
      "percentual_total": 1.59
    },
    {
      "top": 2,
      "sinistros": 467,
      "km": 25.8,
      "sinistros_por_km": 18.1,
      "percentual_total": 3.03
    }
  ],
  "parametros": {
    "intervalo": 1,
    "periodo": "2018-2024",
    "total_sinistros": 15420
  }
}
```

### Mapa GeoJSON das Vias

**Endpoint:** `/samu-calls/streets/map`

**Método:** GET

**Parâmetros:**
- `anoInicio` (opcional): Ano inicial para filtrar (padrão: 2018)
- `anoFim` (opcional): Ano final para filtrar (padrão: 2024)
- `limite` (opcional): Número máximo de vias (padrão: 50)
- `desfechos` (opcional): Filtro de desfechos - `validos` (padrão), `invalidos`, ou `todos`

**Descrição:** Retorna dados geoespaciais das vias com sinistros em formato adequado para mapas.

**Exemplos de Uso:**
```
# Mapa das 50 vias mais perigosas (desfechos válidos)
GET http://localhost:8080/samu-calls/streets/map

# Mapa das 20 vias entre 2020-2023 incluindo todos os desfechos
GET http://localhost:8080/samu-calls/streets/map?limite=20&anoInicio=2020&anoFim=2023&desfechos=todos
```

**Resposta:**
```json
{
  "vias": [
    {
      "id": 12345,
      "nome": "Avenida Norte Miguel Arraes de Alencar",
      "sinistros": 245,
      "geometria": {
        "type": "LineString",
        "coordinates": [[-34.123, -8.456], [-34.124, -8.457]]
      }
    }
  ],
  "filtro_desfechos": "validos"
}
```

### Buscar Sinistros por Via

**Endpoint:** `/samu-calls/streets/search`

**Método:** GET

**Parâmetros:**
- `street` (obrigatório): Nome da via para buscar
- `limit` (opcional): Número máximo de resultados (padrão: 100)

**Descrição:** Busca chamadas do SAMU em uma via específica.

**Exemplo de Uso:**
```
GET http://localhost:8080/samu-calls/streets/search?street=Boa%20Viagem&limit=50
```

### Histórico de Sinistros por Via

**Endpoint:** `/samu-calls/streets/history`

**Método:** GET

**Parâmetros:**
- `via` (opcional): Nome da via para filtrar (busca parcial)
- `desfechos` (opcional): Filtro de desfechos - `validos` (padrão), `invalidos`, ou `todos`

**Descrição:** Retorna histórico detalhado de sinistros por ano, incluindo distribuição mensal, por dia da semana, por horário, dias com dados e dias com sinistros.

**Exemplos de Uso:**
```
# Histórico geral (todos os anos, desfechos válidos)
GET http://localhost:8080/samu-calls/streets/history

# Histórico de uma via específica
GET http://localhost:8080/samu-calls/streets/history?via=Avenida Norte Miguel Arraes

# Histórico incluindo desfechos inválidos
GET http://localhost:8080/samu-calls/streets/history?via=Boa Viagem&desfechos=invalidos

# Histórico com todos os desfechos
GET http://localhost:8080/samu-calls/streets/history?desfechos=todos
```

**Resposta:**
```json
{
  "evolucao": [
    {
      "ano": 2023,
      "sinistros": 150,
      "meses": {
        "1": 12,  // Janeiro
        "2": 15,  // Fevereiro
        "3": 18,  // Março
        "4": 10,  // Abril
        "5": 14,  // Maio
        "6": 16,  // Junho
        "7": 13,  // Julho
        "8": 11,  // Agosto
        "9": 9,   // Setembro
        "10": 12, // Outubro
        "11": 10, // Novembro
        "12": 10  // Dezembro
      },
      "dias_com_dados": 365,      // Dias com dados no ano (geral)
      "dias_com_sinistros": 89,   // Dias com sinistros na via específica
      "ultimo_dia": "2023-12-31",
      "dias_semana": {
        "0": 20,  // Domingo
        "1": 25,  // Segunda-feira
        "2": 22,  // Terça-feira
        "3": 18,  // Quarta-feira
        "4": 24,  // Quinta-feira
        "5": 26,  // Sexta-feira
        "6": 15   // Sábado
      },
      "horarios": {
        "0": 2,   // 00:00-00:59
        "1": 1,   // 01:00-01:59
        "2": 0,   // 02:00-02:59
        "3": 1,   // 03:00-03:59
        "4": 2,   // 04:00-04:59
        "5": 4,   // 05:00-05:59
        "6": 8,   // 06:00-06:59
        "7": 12,  // 07:00-07:59
        "8": 15,  // 08:00-08:59
        "9": 10,  // 09:00-09:59
        "10": 8,  // 10:00-10:59
        "11": 9,  // 11:00-11:59
        "12": 11, // 12:00-12:59
        "13": 9,  // 13:00-13:59
        "14": 7,  // 14:00-14:59
        "15": 6,  // 15:00-15:59
        "16": 8,  // 16:00-16:59
        "17": 12, // 17:00-17:59
        "18": 14, // 18:00-18:59
        "19": 8,  // 19:00-19:59
        "20": 6,  // 20:00-20:59
        "21": 4,  // 21:00-21:59
        "22": 3,  // 22:00-22:59
        "23": 2   // 23:00-23:59
      }
    }
  ],
  "via": "Avenida Norte Miguel Arraes",
  "filtro_desfechos": "validos"
}
```

**Métricas Incluídas:**
- **sinistros**: Total de sinistros no ano
- **meses**: Distribuição mensal (1-12)
- **dias_com_dados**: Dias com dados no sistema (geral do ano)
- **dias_com_sinistros**: Dias com sinistros na via específica
- **ultimo_dia**: Última data com dados no ano
- **dias_semana**: Distribuição por dia da semana (0=Domingo, 6=Sábado)
- **horarios**: Distribuição por hora do dia (0-23h)
