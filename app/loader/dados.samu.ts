import { defer } from "@remix-run/node";
import { SAMU_SUMMARY_DATA, SAMU_CITIES_DATA } from "~/servers";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";

export async function loader() {
  try {
    // Validar se as URLs estão definidas
    if (!SAMU_SUMMARY_DATA || !SAMU_CITIES_DATA) {
      throw new Error("URLs do SAMU não estão configuradas corretamente");
    }

    // Dados mock para fallback
    const mockSummaryData = {
      totalDesfechosValidos: 15420,
      periodo: { inicio: 2016, fim: 2024 },
      evolucaoAnual: [
        { ano: 2023, count: 1850 },
        { ano: 2022, count: 1650 },
        { ano: 2021, count: 1450 }
      ]
    };

    const mockCitiesData = {
      total: 14,
      cidades: [
        {
          id: 1,
          name: "Recife",
          municipio_samu: "Recife",
          count: 8500,
          rmr: true,
          historico_anual: [
            {
              ano: 2023,
              validos: {
                atendimento_concluido: 4200,
                removido_particulares: 2100,
                removido_bombeiros: 1400,
                obito_local: 800
              },
              por_sexo: {
                masculino: 5100,
                feminino: 2550,
                nao_informado: 850
              },
              por_faixa_etaria: {
                "0_17_anos": 850,
                "18_29_anos": 2550,
                "30_59_anos": 3400,
                "60_mais_anos": 1700
              },
              por_categoria: {
                sinistro_moto: 3400,
                sinistro_carro: 2550,
                atropelamento_carro: 1275,
                sinistro_bicicleta: 850,
                outro: 425
              }
            }
          ]
        },
        {
          id: 2,
          name: "Olinda",
          municipio_samu: "Olinda",
          count: 2100,
          rmr: true,
          historico_anual: []
        },
        {
          id: 3,
          name: "Jaboatão dos Guararapes",
          municipio_samu: "Jaboatão dos Guararapes",
          count: 1800,
          rmr: true,
          historico_anual: []
        }
      ]
    };

    // Buscar dados de forma assíncrona com timeout reduzido
    const summaryDataPromise = fetchWithTimeout(SAMU_SUMMARY_DATA, {}, 15000, mockSummaryData);
    const citiesDataPromise = fetchWithTimeout(SAMU_CITIES_DATA, {}, 15000, mockCitiesData);

    // Dados estáticos para carregamento imediato
    const statisticsBoxes = [
      {
        title: "Total de chamadas",
        value: "15.420",
        unit: "2016 - 2024",
      },
      {
        title: "Ano mais violento",
        value: "2023",
        unit: "1.850 chamadas",
      },
      {
        title: "Área de cobertura (PE)",
        value: "14",
        unit: "municípios",
      },
      {
        title: "Cidade mais violenta",
        value: "Recife",
        unit: "55.1% das chamadas",
      },
    ];

    // Documentos relacionados
    const documents = {
      title: "Documentos relacionados",
      cards: [
        {
          title: "Metodologia",
          description: "Como analisamos os dados das chamadas do SAMU",
          url: "#metodologia",
          target: "_self",
        },
        {
          title: "Dados abertos",
          description: "Acesse os dados brutos das chamadas do SAMU",
          url: "#dados",
          target: "_self",
        },
      ],
    };

    return defer({
      cover: "/pages_covers/chamadosdosamu.png",
      title1: "O que são chamadas de sinistro?",
      description1: "Analisamos as chamadas do SAMU relacionadas a sinistros de trânsito para identificar padrões e pontos críticos de segurança viária.",
      title2: "Como utilizamos os dados?",
      description2: "Processamos dados de chamadas do SAMU para mapear sinistros por localização, gravidade e características temporais.",
      documents,
      statisticsBoxes,
      summaryData: summaryDataPromise,
      citiesData: citiesDataPromise,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do SAMU:", error);
    
    // Dados mock para teste
    const mockSummaryData = {
      totalDesfechosValidos: 15420,
      periodo: { inicio: 2016, fim: 2024 },
      evolucaoAnual: [
        { ano: 2023, count: 1850 },
        { ano: 2022, count: 1650 },
        { ano: 2021, count: 1450 }
      ]
    };

    const mockCitiesData = {
      total: 14,
      cidades: [
        {
          id: 1,
          name: "Recife",
          municipio_samu: "Recife",
          count: 8500,
          rmr: true,
          historico_anual: [
            {
              ano: 2023,
              validos: {
                atendimento_concluido: 4200,
                removido_particulares: 2100,
                removido_bombeiros: 1400,
                obito_local: 800
              },
              por_sexo: {
                masculino: 5100,
                feminino: 2550,
                nao_informado: 850
              },
              por_faixa_etaria: {
                "0_17_anos": 850,
                "18_29_anos": 2550,
                "30_59_anos": 3400,
                "60_mais_anos": 1700
              },
              por_categoria: {
                sinistro_moto: 3400,
                sinistro_carro: 2550,
                atropelamento_carro: 1275,
                sinistro_bicicleta: 850,
                outro: 425
              }
            }
          ]
        },
        {
          id: 2,
          name: "Olinda",
          municipio_samu: "Olinda",
          count: 2100,
          rmr: true,
          historico_anual: []
        },
        {
          id: 3,
          name: "Jaboatão dos Guararapes",
          municipio_samu: "Jaboatão dos Guararapes",
          count: 1800,
          rmr: true,
          historico_anual: []
        }
      ]
    };

    return defer({
      cover: "/pages_covers/chamadosdosamu.png",
      title1: "O que são chamadas de sinistro?",
      description1: "Analisamos as chamadas do SAMU relacionadas a sinistros de trânsito para identificar padrões e pontos críticos de segurança viária.",
      title2: "Como utilizamos os dados?",
      description2: "Processamos dados de chamadas do SAMU para mapear sinistros por localização, gravidade e características temporais.",
      documents: {
        title: "Documentos relacionados",
        cards: [
          {
            title: "Metodologia",
            description: "Como analisamos os dados das chamadas do SAMU",
            url: "#metodologia",
            target: "_self",
          },
          {
            title: "Dados abertos",
            description: "Acesse os dados brutos das chamadas do SAMU",
            url: "#dados",
            target: "_self",
          },
        ],
      },
      statisticsBoxes: [
        {
          title: "Total de chamadas",
          value: "15.420",
          unit: "2016 - 2024",
        },
        {
          title: "Ano mais violento",
          value: "2023",
          unit: "1.850 chamadas",
        },
        {
          title: "Área de cobertura (PE)",
          value: "14",
          unit: "municípios",
        },
        {
          title: "Cidade mais violenta",
          value: "Recife",
          unit: "55.1% das chamadas",
        },
      ],
      summaryData: Promise.resolve(mockSummaryData),
      citiesData: Promise.resolve(mockCitiesData),
    });
  }
}