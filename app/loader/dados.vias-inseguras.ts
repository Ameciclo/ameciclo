import { defer } from "@remix-run/node";
import { 
  VIAS_INSEGURAS_SUMMARY,
  VIAS_INSEGURAS_TOP,
  VIAS_INSEGURAS_MAP,
  VIAS_INSEGURAS_HISTORY
} from "../servers";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";

export async function loader() {
  try {
    // Dados mock para fallback
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

    // Buscar dados de forma assíncrona
    const summaryDataPromise = fetchWithTimeout(VIAS_INSEGURAS_SUMMARY, {}, 15000, mockSummaryData);
    const topViasDataPromise = fetchWithTimeout(`${VIAS_INSEGURAS_TOP}?limite=50`, {}, 15000, mockTopViasData);
    const mapDataPromise = fetchWithTimeout(`${VIAS_INSEGURAS_MAP}?limite=50`, {}, 15000, mockMapData);
    const historyDataPromise = fetchWithTimeout(VIAS_INSEGURAS_HISTORY, {}, 15000, mockHistoryData);

    // Estatísticas estáticas para carregamento imediato
    const statisticsBoxes = [
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
        title: "Vias identificadas",
        value: "2.341",
        unit: "vias analisadas",
      },
      {
        title: "Via com mais sinistros",
        value: "1.59%",
        unit: "Av. Norte Miguel Arraes",
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
      summaryData: summaryDataPromise,
      topViasData: topViasDataPromise,
      mapData: mapDataPromise,
      historyData: historyDataPromise,
    });
  } catch (error) {
    console.error("Erro ao buscar dados das vias inseguras:", error);
    
    // Fallback com dados mock em caso de erro
    const mockData = {
      totalSinistros: 15420,
      totalVias: 2341,
      periodoInicio: "2016",
      periodoFim: "2024",
      anoMaisPerigoso: { ano: "2023", total: 1850 },
      viaMaisPerigosa: { nome: "Avenida Norte Miguel Arraes de Alencar", total: 245, percentual: 1.59 }
    };

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
    });
  }
}