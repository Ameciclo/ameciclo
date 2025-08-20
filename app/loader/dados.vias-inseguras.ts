import { json } from "@remix-run/node";

const API_BASE_URL = "http://localhost:8080";

async function fetchWithTimeout(url: string, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function loader() {
  try {
    // Buscar dados do resumo geral
    const summaryResponse = await fetchWithTimeout(`${API_BASE_URL}/samu-calls/streets/summary`);
    const summaryData = summaryResponse.ok ? await summaryResponse.json() : null;

    // Buscar top vias
    const topViasResponse = await fetchWithTimeout(`${API_BASE_URL}/samu-calls/streets/top?limite=50`);
    const topViasData = topViasResponse.ok ? await topViasResponse.json() : null;

    // Buscar dados do mapa
    const mapResponse = await fetchWithTimeout(`${API_BASE_URL}/samu-calls/streets/map?limite=50`);
    const mapData = mapResponse.ok ? await mapResponse.json() : null;

    // Buscar histórico geral
    const historyResponse = await fetchWithTimeout(`${API_BASE_URL}/samu-calls/streets/history`);
    const historyData = historyResponse.ok ? await historyResponse.json() : null;

    // Processar dados para estatísticas
    const statisticsBoxes = summaryData ? [
      {
        title: "Total de sinistros",
        value: summaryData.totalSinistros?.toLocaleString() || "0",
        unit: `${summaryData.periodoInicio} - ${summaryData.periodoFim}`,
      },
      {
        title: "Ano mais perigoso",
        value: summaryData.anoMaisPerigoso?.ano || "N/A",
        unit: `${summaryData.anoMaisPerigoso?.total?.toLocaleString() || "0"} sinistros`,
      },
      {
        title: "Total de vias",
        value: summaryData.totalVias?.toLocaleString() || "0",
        unit: "vias analisadas",
      },
      {
        title: "Via com mais sinistros",
        value: `${summaryData.viaMaisPerigosa?.total || "0"}`,
        unit: summaryData.viaMaisPerigosa?.nome || "N/A",
      },
    ] : [];

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

    return json({
      cover: "/pages_covers/vias-inseguras.png",
      title1: "O que são vias inseguras?",
      description1: "Identificamos as vias com maior concentração de sinistros de trânsito no Recife através da análise dos atendimentos do SAMU, permitindo mapear os pontos críticos da cidade e orientar políticas públicas de segurança viária.",
      title2: "Como analisamos os dados?",
      description2: "Processamos dados georreferenciados dos atendimentos do SAMU para identificar padrões de sinistralidade por via, considerando frequência, gravidade, extensão das vias e densidade de sinistros por quilômetro.",
      documents,
      statisticsBoxes,
      summaryData: summaryData || {},
      topViasData: topViasData || { dados: [], parametros: {} },
      mapData: mapData || { vias: [] },
      historyData: historyData || { evolucao: [] },
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

    return json({
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
          value: mockData.totalSinistros.toLocaleString(),
          unit: `${mockData.periodoInicio} - ${mockData.periodoFim}`,
        },
        {
          title: "Ano mais perigoso",
          value: mockData.anoMaisPerigoso.ano,
          unit: `${mockData.anoMaisPerigoso.total.toLocaleString()} sinistros`,
        },
        {
          title: "Total de vias",
          value: mockData.totalVias.toLocaleString(),
          unit: "vias analisadas",
        },
        {
          title: "Via com mais sinistros",
          value: `${mockData.viaMaisPerigosa.total}`,
          unit: mockData.viaMaisPerigosa.nome,
        },
      ],
      summaryData: mockData,
      topViasData: { dados: [], parametros: {} },
      mapData: { vias: [] },
      historyData: { evolucao: [] },
    });
  }
}