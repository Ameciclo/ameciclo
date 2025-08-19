import { json } from "@remix-run/node";

export async function loader() {
  try {
    // TODO: Substituir por chamadas reais da API quando estiver pronta
    
    const mockViasData = {
      totalSinistros: 15420,
      totalVias: 2847,
      periodoInicio: "2018",
      periodoFim: "2024",
      anoMaisPerigoso: { ano: "2022", total: 2834 },
      viaMaisPerigosa: { nome: "Av. Boa Viagem", total: 287, percentual: 1.86 },
      vias: [
        { ranking: 1, nome: "Av. Boa Viagem", sinistros: 287, percentual: 1.86, extensao: 8.2 },
        { ranking: 2, nome: "Av. Recife", sinistros: 245, percentual: 1.59, extensao: 12.5 },
        { ranking: 3, nome: "Av. Norte", sinistros: 198, percentual: 1.28, extensao: 15.3 },
        { ranking: 4, nome: "BR-101", sinistros: 176, percentual: 1.14, extensao: 22.1 },
        { ranking: 5, nome: "Av. Caxangá", sinistros: 164, percentual: 1.06, extensao: 18.7 }
      ]
    };

    const statisticsBoxes = [
      {
        title: "Total de sinistros",
        value: mockViasData.totalSinistros.toLocaleString(),
        unit: `${mockViasData.periodoInicio} - ${mockViasData.periodoFim}`,
      },
      {
        title: "Ano mais perigoso",
        value: mockViasData.anoMaisPerigoso.ano,
        unit: `${mockViasData.anoMaisPerigoso.total.toLocaleString()} sinistros`,
      },
      {
        title: "Total de vias",
        value: mockViasData.totalVias.toLocaleString(),
        unit: "vias analisadas",
      },
      {
        title: "Via com mais sinistros",
        value: `${mockViasData.viaMaisPerigosa.total}`,
        unit: mockViasData.viaMaisPerigosa.nome,
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
      ],
    };

    return json({
      cover: "/pages_covers/viasinseguras.png",
      title1: "O que são vias inseguras?",
      description1: "Identificamos as vias com maior concentração de sinistros de trânsito no Recife através da análise dos atendimentos do SAMU, permitindo mapear os pontos críticos da cidade.",
      title2: "Como analisamos os dados?",
      description2: "Processamos dados georreferenciados dos atendimentos do SAMU para identificar padrões de sinistralidade por via, considerando frequência, gravidade e extensão das vias.",
      documents,
      statisticsBoxes,
      viasData: mockViasData,
    });
  } catch (error) {
    console.error("Erro ao buscar dados das vias inseguras:", error);
    
    return json({
      cover: "/pages_covers/viasinseguras.png",
      title1: "O que são vias inseguras?",
      description1: "Identificamos as vias com maior concentração de sinistros de trânsito no Recife através da análise dos atendimentos do SAMU.",
      title2: "Como analisamos os dados?",
      description2: "Processamos dados georreferenciados dos atendimentos do SAMU para identificar padrões de sinistralidade por via.",
      documents: {
        title: "Documentos relacionados",
        cards: [],
      },
      statisticsBoxes: [],
      viasData: { vias: [], totalSinistros: 0, totalVias: 0 },
    });
  }
}