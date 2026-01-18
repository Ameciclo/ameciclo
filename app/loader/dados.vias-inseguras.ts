import { defer } from "@remix-run/node";
import { 
  VIAS_INSEGURAS_SUMMARY,
  VIAS_INSEGURAS_TOP,
  VIAS_INSEGURAS_MAP,
  VIAS_INSEGURAS_HISTORY
} from "../servers";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";

export async function loader() {
  const errors: Array<{url: string, error: string}> = [];
  
  const onError = (url: string) => (error: string) => {
    errors.push({ url, error });
  };
  
  try {
    const mockSummaryData = {
      totalSinistros: 15420,
      totalVias: 2341,
      periodoInicio: "2016",
      periodoFim: "2024",
      anoMaisPerigoso: { ano: "2023", total: 1850 },
      viaMaisPerigosa: { nome: "Avenida Norte Miguel Arraes de Alencar", total: 245, percentual: 1.59 }
    };

    const mockTopViasData = { dados: [], parametros: {} };
    const mockMapData = { vias: [] };
    const mockHistoryData = { evolucao: [] };

    // Aguardar todas as chamadas para capturar erros
    const [summaryDataRaw, topViasDataRaw, mapDataRaw] = await Promise.all([
      fetchWithTimeout(VIAS_INSEGURAS_SUMMARY, {}, 5000, mockSummaryData, onError(VIAS_INSEGURAS_SUMMARY)),
      fetchWithTimeout(VIAS_INSEGURAS_TOP, {}, 5000, mockTopViasData, onError(VIAS_INSEGURAS_TOP)),
      fetchWithTimeout(VIAS_INSEGURAS_MAP, {}, 5000, mockMapData, onError(VIAS_INSEGURAS_MAP))
    ]);

    // Adaptar dados da API v2 para o formato esperado
    const summaryData = {
      totalSinistros: summaryDataRaw.total_accidents || summaryDataRaw.totalSinistros || 15420,
      totalVias: parseInt(summaryDataRaw.total_streets) || summaryDataRaw.totalVias || 2341,
      periodoInicio: summaryDataRaw.period?.start_year?.toString() || "2018",
      periodoFim: summaryDataRaw.period?.end_year?.toString() || "2025",
      viaMaisPerigosa: {
        nome: summaryDataRaw.most_dangerous_street?.name || summaryDataRaw.viaMaisPerigosa?.nome || "BR",
        total: summaryDataRaw.most_dangerous_street?.total_accidents || summaryDataRaw.viaMaisPerigosa?.total || 1819,
        percentual: ((summaryDataRaw.most_dangerous_street?.total_accidents || 1819) / (summaryDataRaw.total_accidents || 38275) * 100) || 4.75
      }
    };

    // Combinar dados de concentration com geojson para ter informações completas
    const concentrationMap = new Map(
      (topViasDataRaw.concentration_data || []).map((item: any) => [
        item.ranking,
        {
          ranking: item.ranking,
          total_accidents: item.total_accidents,
          length_km: item.street_extension_km
        }
      ])
    );

    // Processar features do GeoJSON e combinar com dados de concentration
    const viasCompletas = (mapDataRaw.features || []).map((feature: any) => {
      const ranking = feature.properties.ranking;
      const concentrationData = concentrationMap.get(ranking) || {};
      
      return {
        ranking: ranking,
        street_name: feature.properties.street_name,
        total_accidents: feature.properties.accidents_count || concentrationData.total_accidents || 0,
        length_km: feature.properties.extension_km || concentrationData.length_km || 0,
        accidents_per_km: feature.properties.extension_km 
          ? (feature.properties.accidents_count / feature.properties.extension_km)
          : 0,
        percentage: summaryData.totalSinistros 
          ? ((feature.properties.accidents_count || 0) / summaryData.totalSinistros * 100)
          : 0,
        geometry: feature.geometry
      };
    });

    // Calcular dados acumulados
    let accumulatedAccidents = 0;
    let accumulatedKm = 0;
    
    const topViasData = {
      dados: viasCompletas.map((via: any) => {
        accumulatedAccidents += via.total_accidents;
        accumulatedKm += via.length_km;
        
        return {
          top: via.ranking,
          nome: via.street_name,
          sinistros: via.total_accidents,
          sinistros_acum: accumulatedAccidents,
          km: via.length_km,
          km_acum: accumulatedKm,
          sinistros_por_km: via.accidents_per_km,
          sinistros_por_km_acum: accumulatedKm > 0 ? accumulatedAccidents / accumulatedKm : 0,
          percentual: via.percentage,
          percentual_acum: (accumulatedAccidents / summaryData.totalSinistros) * 100
        };
      }),
      parametros: {
        intervalo: 150,
        periodo: `${summaryData.periodoInicio}-${summaryData.periodoFim}`,
        total_sinistros: summaryData.totalSinistros,
        limite: 150
      }
    };

    const mapData = {
      vias: viasCompletas.map((via: any, index: number) => ({
        id: index + 1,
        nome: via.street_name,
        top: via.ranking,
        sinistros: via.total_accidents,
        km: via.length_km,
        sinistros_por_km: via.accidents_per_km,
        percentual: via.percentage,
        geometria: via.geometry
      }))
    };

    const historyData = mockHistoryData;

    // Estatísticas dinâmicas baseadas nos dados reais
    const statisticsBoxes = [
      {
        title: "Total de sinistros",
        value: summaryData.totalSinistros.toLocaleString('pt-BR'),
        unit: `${summaryData.periodoInicio} - ${summaryData.periodoFim}`,
      },
      {
        title: "Ano mais perigoso",
        value: "2024",
        unit: "11.030 sinistros",
      },
      {
        title: "Vias identificadas",
        value: summaryData.totalVias.toLocaleString('pt-BR'),
        unit: "vias analisadas",
      },
      {
        title: "Via com mais sinistros",
        value: `${summaryData.viaMaisPerigosa.percentual.toFixed(2)}%`,
        unit: summaryData.viaMaisPerigosa.nome,
      },
    ];

    const documents = {
      title: "Documentos relacionados",
      cards: [
        {
          title: "Metodologia",
          description: "Como identificamos e classificamos as vias inseguras",
          url: "#metodologia",
          target: "_self",
        },
        {
          title: "Dados abertos",
          description: "Acesse os dados brutos dos sinistros por via",
          url: "#dados",
          target: "_self",
        },
        {
          title: "API de Vias Inseguras",
          description: "Documentação da API para desenvolvedores",
          url: "/docs/api-vias-inseguras",
          target: "_blank",
        },
      ],
    };

    return defer({
      cover: "/pages_covers/vias-inseguras.png",
      title1: "O que são vias inseguras?",
      description1: "Identificamos as vias com maior concentração de sinistros de trânsito no Recife através da análise dos atendimentos do SAMU, permitindo mapear os pontos críticos da cidade e orientar políticas públicas de segurança viária.",
      title2: "Como analisamos os dados?",
      description2: "Processamos dados georreferenciados dos atendimentos do SAMU para identificar padrões de sinistralidade por via, considerando frequência, gravidade, extensão das vias e densidade de sinistros por quilômetro.",
      documents,
      statisticsBoxes,
      summaryData: Promise.resolve(summaryData),
      topViasData: Promise.resolve(topViasData),
      mapData: Promise.resolve(mapData),
      historyData: Promise.resolve(historyData),
      apiDown: errors.length > 0,
      apiErrors: errors,
    });
  } catch (error) {
    console.error("Erro ao buscar dados das vias inseguras:", error);
    
    
    return defer({
      cover: "/pages_covers/vias-inseguras.png",
      title1: "O que são vias inseguras?",
      description1: "Identificamos as vias com maior concentração de sinistros de trânsito no Recife através da análise dos atendimentos do SAMU.",
      title2: "Como analisamos os dados?",
      description2: "Processamos dados georreferenciados dos atendimentos do SAMU para identificar padrões de sinistralidade por via.",
      documents: {
        title: "Documentos relacionados",
        cards: [],
      },
      statisticsBoxes: [
        {
          title: "Total de sinistros",
          value: "15.420",
          unit: "2016 - 2024",
        },
        {
          title: "Ano mais perigoso",
          value: "2023",
          unit: "1.850 sinistros",
        },
        {
          title: "Total de vias",
          value: "2.341",
          unit: "vias analisadas",
        },
        {
          title: "Via com mais sinistros",
          value: "245",
          unit: "Av. Norte Miguel Arraes",
        },
      ],
      summaryData: Promise.resolve(mockData),
      topViasData: Promise.resolve({ dados: [], parametros: {} }),
      mapData: Promise.resolve({ vias: [] }),
      historyData: Promise.resolve({ evolucao: [] }),
      apiDown: true,
      apiErrors: [{ url: 'vias-inseguras', error: String(error) }],
    });
  }
}