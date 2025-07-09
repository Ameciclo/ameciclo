// Configuração para o Observatório de Sinistros Fatais
import { IntlNumber, IntlPercentil } from "~/services/utils";

// Tipos para melhorar a tipagem
type CityData = {
  id: number;
  nome?: string;
  name?: string;
  [key: string]: any;
};

type CitiesByYearData = {
  tipo?: string;
  locationType?: string;
  anos?: number[];
  years?: number[];
  cidades?: CityData[];
  cities?: CityData[];
};

type SummaryData = {
  porLocalOcorrencia: {
    ultimoAno: string;
    totalUltimoAno: number;
    crescimentoRelacaoAnoAnterior: number;
    dadosPorAno: { total: number }[];
    anoMaisViolento: { ano: string; total: number };
  };
  porLocalResidencia: {
    ultimoAno: string;
    totalUltimoAno: number;
    crescimentoRelacaoAnoAnterior: number;
    dadosPorAno: { total: number }[];
    anoMaisViolento: { ano: string; total: number };
  };
};

// Função para formatar os dados de estatísticas gerais
export function getGeneralStatistics(summaryData: SummaryData, tipoLocal = "ocorrencia") {
  const data = tipoLocal === "ocorrencia" 
    ? summaryData.porLocalOcorrencia 
    : summaryData.porLocalResidencia;
  
  return [
    {
      title: `Mortes no último ano (${data.ultimoAno})`,
      value: data.totalUltimoAno,
      unit: ""
    },
    {
      title: "Variação em relação ao ano anterior",
      value: IntlPercentil(data.crescimentoRelacaoAnoAnterior / 100),
      unit: ""
    },
    {
      title: "Mortes nos últimos 5 anos",
      value: data.dadosPorAno
        .slice(-5)
        .reduce((sum, item) => sum + item.total, 0),
      unit: ""
    },
    {
      title: `Ano mais violento: ${data.anoMaisViolento.ano}`,
      value: data.anoMaisViolento.total,
      unit: "mortes"
    }
  ];
}

// Função para formatar os dados de cidades por ano
export function getCityCardsByYear(citiesByYearData: any, selectedYear: number, tipoLocal = "ocorrencia", selectedEndYear: number | null = null) {
  if (!citiesByYearData || !selectedYear) return [];
  
  // Verificar se usa a estrutura nova (cities) ou antiga (cidades)
  const cities = citiesByYearData.cities || citiesByYearData.cidades || [];
  
  if (cities.length === 0) {
    return [{
      id: 0,
      label: "Sem dados disponíveis",
      value: 0,
      unit: "mortes"
    }];
  }
  
  return cities
    .map((city: any) => {
      let totalMortes = 0;
      
      if (selectedEndYear) {
        for (let ano = selectedYear; ano <= selectedEndYear; ano++) {
          totalMortes += city[ano.toString()] || 0;
        }
      } else {
        totalMortes = city[selectedYear.toString()] || 0;
      }
      
      return {
        id: city.id,
        label: city.name || city.nome, // API usa 'name', código antigo usa 'nome'
        value: totalMortes,
        unit: "mortes"
      };
    })
    .sort((a: any, b: any) => b.value - a.value);
}

// Mapeamento de códigos de modo de transporte para nomes legíveis
export const modoTransporteLabels: Record<string, string> = {
  "V0": "Pedestres",
  "V1": "Ciclistas",
  "V2": "Motociclistas",
  "V4": "Ocupante de automóvel",
  "V7": "Ocupante de ônibus",
  "outros": "Outros veículos"
};