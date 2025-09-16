import { defer } from "@remix-run/node";
import { SAMU_SUMMARY_DATA, SAMU_CITIES_DATA } from "~/servers";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";

export async function loader() {
  console.log('🚑 SAMU Loader iniciado');
  
  try {
    // Validar se as URLs estão definidas
    if (!SAMU_SUMMARY_DATA || !SAMU_CITIES_DATA) {
      console.error('❌ URLs do SAMU não configuradas:', { SAMU_SUMMARY_DATA, SAMU_CITIES_DATA });
      throw new Error("URLs do SAMU não estão configuradas corretamente");
    }
    
    console.log('✅ URLs do SAMU configuradas:', { SAMU_SUMMARY_DATA, SAMU_CITIES_DATA });

    // Buscar dados reais da API com timeout de 30 segundos
    const summaryDataPromise = fetchWithTimeout(SAMU_SUMMARY_DATA, {}, 30000)
      .then(data => {
        if (data) {
          console.log('✅ Dados do SAMU summary carregados da API');
          return data;
        }
        throw new Error('Dados do summary não encontrados');
      })
      .catch(error => {
        console.warn('⚠️ API não respondeu em 30s, usando dados mockados:', error.message);
        return {
          totalChamadas: 73667,
          totalDesfechosValidos: 73667,
          cidadeMaisViolenta: {
            municipio: "RECIFE",
            totalValidas: 26904,
            total: 26904
          },
          evolucaoAnual: [
            { ano: 2025, count: 5398, ultimaData: "2025-04-30", projecao: 16419 },
            { ano: 2024, count: 20785, ultimaData: "2024-12-31" },
            { ano: 2023, count: 15716, ultimaData: "2023-12-31" },
            { ano: 2022, count: 7237, ultimaData: "2022-07-31", projecao: 12460 },
            { ano: 2021, count: 12984, ultimaData: "2021-12-31" },
            { ano: 2020, count: 11547, ultimaData: "2020-12-31" }
          ],
          periodo: {
            inicio: 2020,
            fim: 2025,
            ultimoMes: "2025.04",
            ultimoDia: "2025-04-30"
          }
        };
      });
    
    const citiesDataPromise = fetchWithTimeout(SAMU_CITIES_DATA, {}, 30000)
      .then(data => {
        if (data) {
          console.log('✅ Dados das cidades do SAMU carregados da API');
          return data;
        }
        throw new Error('Dados das cidades não encontrados');
      })
      .catch(error => {
        console.warn('⚠️ API não respondeu em 30s, usando dados mockados:', error.message);
        return {
          total: 72,
          cidades: [
            {
              municipio_samu: "RECIFE",
              count: 26904,
              id: 2611606,
              name: "Recife",
              rmr: true,
              ranking: 1,
              historico_anual: [
                {
                  ano: 2023,
                  total_chamados: 7529,
                  ultimaData: "2023-12-31",
                  validos: {
                    total: 7529,
                    atendimento_concluido: 6450,
                    removido_particulares: 512,
                    removido_bombeiros: 507,
                    obito_local: 60
                  },
                  por_sexo: {
                    masculino: 5721,
                    feminino: 1540,
                    nao_informado: 268
                  },
                  por_faixa_etaria: {
                    "0_17_anos": 188,
                    "18_29_anos": 2184,
                    "30_49_anos": 2606,
                    "50_64_anos": 676,
                    "65_mais_anos": 220,
                    "nao_informado": 1655
                  },
                  por_categoria: {
                    sinistro_moto: 5873,
                    sinistro_carro: 333,
                    atropelamento_carro: 323,
                    atropelamento_moto: 329,
                    sinistro_bicicleta: 465,
                    sinistro_onibus_caminhao: 85,
                    atropelamento_onibus_caminhao: 46,
                    atropelamento_bicicleta: 42,
                    outro: 33
                  }
                },
                {
                  ano: 2024,
                  total_chamados: 8187,
                  ultimaData: "2024-12-31",
                  validos: {
                    total: 8187,
                    atendimento_concluido: 7026,
                    removido_particulares: 558,
                    removido_bombeiros: 553,
                    obito_local: 50
                  },
                  por_sexo: {
                    masculino: 6226,
                    feminino: 1678,
                    nao_informado: 283
                  },
                  por_faixa_etaria: {
                    "0_17_anos": 204,
                    "18_29_anos": 2376,
                    "30_49_anos": 2835,
                    "50_64_anos": 735,
                    "65_mais_anos": 240,
                    "nao_informado": 1797
                  },
                  por_categoria: {
                    sinistro_moto: 6391,
                    sinistro_carro: 362,
                    atropelamento_carro: 351,
                    atropelamento_moto: 358,
                    sinistro_bicicleta: 506,
                    sinistro_onibus_caminhao: 92,
                    atropelamento_onibus_caminhao: 50,
                    atropelamento_bicicleta: 46,
                    outro: 31
                  }
                }
              ]
            }
          ]
        };
      });

    // Dados estáticos baseados nos dados reais para carregamento imediato
    const statisticsBoxes = [
      {
        title: "Total de chamadas",
        value: "73.667",
        unit: "2020 - 2025",
      },
      {
        title: "Ano mais violento",
        value: "2024",
        unit: "20.785 chamadas",
      },
      {
        title: "Área de cobertura (PE)",
        value: "72",
        unit: "municípios",
      },
      {
        title: "Cidade mais violenta",
        value: "Recife",
        unit: "36.5% das chamadas",
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

    console.log('✅ SAMU Loader retornando defer com promises');
    
    return defer({
      cover: "/pages_covers/chamadosdosamu.png",
      title1: "O que são chamadas de sinistro?",
      description1: "Analisamos as chamadas do SAMU relacionadas a sinistros de trânsito para identificar padrões e pontos críticos de segurança viária em Pernambuco.",
      title2: "Como utilizamos os dados?",
      description2: "Processamos dados reais de chamadas do SAMU para mapear sinistros por localização, gravidade, características temporais e perfil das vítimas.",
      documents,
      statisticsBoxes,
      summaryData: summaryDataPromise,
      citiesData: citiesDataPromise,
    });
  } catch (error) {
    console.error("❌ Erro crítico no SAMU Loader:", error);
    
    // Fallback com dados básicos baseados nos dados reais
    const fallbackSummaryData = {
      totalChamadas: 73667,
      totalDesfechosValidos: 73667,
      cidadeMaisViolenta: {
        municipio: "RECIFE",
        totalValidas: 26904,
        total: 26904
      },
      evolucaoAnual: [
        { ano: 2024, count: 20785 },
        { ano: 2023, count: 15716 },
        { ano: 2022, count: 7237 },
        { ano: 2021, count: 12984 },
        { ano: 2020, count: 11547 }
      ],
      periodo: { inicio: 2020, fim: 2025 }
    };

    const fallbackCitiesData = {
      total: 72,
      cidades: [
        {
          municipio_samu: "RECIFE",
          count: 26904,
          id: 2611606,
          name: "Recife",
          rmr: true,
          ranking: 1,
          historico_anual: []
        }
      ]
    };

    return defer({
      cover: "/pages_covers/chamadosdosamu.png",
      title1: "O que são chamadas de sinistro?",
      description1: "Analisamos as chamadas do SAMU relacionadas a sinistros de trânsito para identificar padrões e pontos críticos de segurança viária em Pernambuco.",
      title2: "Como utilizamos os dados?",
      description2: "Processamos dados reais de chamadas do SAMU para mapear sinistros por localização, gravidade, características temporais e perfil das vítimas.",
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
          value: "73.667",
          unit: "2020 - 2025",
        },
        {
          title: "Ano mais violento",
          value: "2024",
          unit: "20.785 chamadas",
        },
        {
          title: "Área de cobertura (PE)",
          value: "72",
          unit: "municípios",
        },
        {
          title: "Cidade mais violenta",
          value: "Recife",
          unit: "36.5% das chamadas",
        },
      ],
      summaryData: Promise.resolve(fallbackSummaryData),
      citiesData: Promise.resolve(fallbackCitiesData),
    });
  }
}