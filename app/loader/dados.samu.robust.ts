import { defer } from "@remix-run/node";

// Dados reais completos da API SAMU (baseados na resposta real da API)
const realSummaryData = {
  totalChamadas: 73667,
  totalDesfechosValidos: 73667,
  totalDesfechosInvalidos: 0,
  cidadeMaisViolenta: {
    municipio: "RECIFE",
    totalValidas: 26904,
    totalInvalidas: 0,
    total: 26904,
    evolucaoAnual: [
      { ano: 2020, totalValidas: 3757, totalInvalidas: 0, total: 3757 },
      { ano: 2021, totalValidas: 4407, totalInvalidas: 0, total: 4407 },
      { ano: 2022, totalValidas: 2562, totalInvalidas: 0, total: 2562 },
      { ano: 2023, totalValidas: 6015, totalInvalidas: 0, total: 6015 },
      { ano: 2024, totalValidas: 8187, totalInvalidas: 0, total: 8187 },
      { ano: 2025, totalValidas: 1976, totalInvalidas: 0, total: 1976 }
    ]
  },
  porCategoria: [
    { categoria: "Acidente de Moto", count: 54328 },
    { categoria: "Acidente de Carro", count: 5872 },
    { categoria: "Acidente de Bicicleta", count: 4844 },
    { categoria: "Atropelamento por Carro", count: 3287 },
    { categoria: "Atropelamento por Moto", count: 2873 },
    { categoria: "Acidente Ônibus/Caminhão", count: 1159 },
    { categoria: "Outro", count: 487 },
    { categoria: "Atropelamento Ônibus/Caminhão", count: 487 },
    { categoria: "Atropelamento por Bicicleta", count: 330 }
  ],
  porMotivoFinalizacao: [
    { motivo_fin_cat: "Atendimento SAMU", count: 73578 },
    { motivo_fin_cat: "Inválido/Trote/Duplicada/Desistência", count: 36 },
    { motivo_fin_cat: "Atendimento Bombeiros/CIODS", count: 33 },
    { motivo_fin_cat: "Atendimento Particular/Outros", count: 20 }
  ],
  porMotivoDesfecho: [
    { motivo_desf_cat: "Atendimento Concluído com Êxito", count: 58045 },
    { motivo_desf_cat: "Removido por Particulares", count: 8041 },
    { motivo_desf_cat: "Removido pelos Bombeiros/CIODS", count: 6580 },
    { motivo_desf_cat: "Óbito no Local/Atendimento", count: 1001 }
  ],
  evolucaoAnual: [
    { ano: 2020, count: 11547, ultimaData: "2020-12-31" },
    { ano: 2021, count: 12984, ultimaData: "2021-12-31" },
    { ano: 2022, count: 7237, ultimaData: "2022-07-31", projecao: 12460 },
    { ano: 2023, count: 15716, ultimaData: "2023-12-31" },
    { ano: 2024, count: 20785, ultimaData: "2024-12-31" },
    { ano: 2025, count: 5398, ultimaData: "2025-04-30", projecao: 16419 }
  ],
  periodo: {
    inicio: 2020,
    fim: 2025,
    ultimoMes: "2025.04",
    ultimoDia: "2025-04-30",
    totalDiasComDados: 1794
  },
  filtros: {
    incluir_invalidos: false
  }
};

const realCitiesData = {
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
          invalidos: 0,
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
            outro: 31,
            nao_informado: 0
          }
        },
        {
          ano: 2023,
          total_chamados: 6015,
          ultimaData: "2023-12-31",
          validos: {
            total: 6015,
            atendimento_concluido: 5262,
            removido_particulares: 347,
            removido_bombeiros: 359,
            obito_local: 47
          },
          por_sexo: {
            masculino: 4679,
            feminino: 1209,
            nao_informado: 127
          },
          por_faixa_etaria: {
            "0_17_anos": 176,
            "18_29_anos": 1546,
            "30_49_anos": 2080,
            "50_64_anos": 577,
            "65_mais_anos": 169,
            "nao_informado": 1467
          },
          por_categoria: {
            sinistro_moto: 4537,
            sinistro_carro: 327,
            atropelamento_carro: 283,
            atropelamento_moto: 248,
            sinistro_bicicleta: 438,
            sinistro_onibus_caminhao: 82,
            atropelamento_onibus_caminhao: 50,
            atropelamento_bicicleta: 28,
            outro: 22,
            nao_informado: 0
          }
        }
      ]
    },
    {
      municipio_samu: "JABOATAO DOS GUARARAPES",
      count: 6184,
      id: 2607901,
      name: "Jaboatão dos Guararapes",
      rmr: true,
      ranking: 2,
      historico_anual: [
        {
          ano: 2024,
          total_chamados: 1776,
          ultimaData: "2024-12-31",
          validos: {
            total: 1776,
            atendimento_concluido: 1190,
            removido_particulares: 263,
            removido_bombeiros: 295,
            obito_local: 28
          },
          por_sexo: {
            masculino: 1340,
            feminino: 360,
            nao_informado: 76
          },
          por_categoria: {
            sinistro_moto: 1317,
            sinistro_carro: 100,
            atropelamento_carro: 64,
            atropelamento_moto: 85,
            sinistro_bicicleta: 149,
            outro: 61
          }
        }
      ]
    },
    {
      municipio_samu: "OLINDA",
      count: 4532,
      id: 2609600,
      name: "Olinda",
      rmr: true,
      ranking: 3,
      historico_anual: [
        {
          ano: 2024,
          total_chamados: 1292,
          ultimaData: "2024-12-31",
          validos: {
            total: 1292,
            atendimento_concluido: 865,
            removido_particulares: 171,
            removido_bombeiros: 242,
            obito_local: 14
          },
          por_sexo: {
            masculino: 947,
            feminino: 288,
            nao_informado: 57
          },
          por_categoria: {
            sinistro_moto: 1019,
            sinistro_carro: 43,
            atropelamento_carro: 51,
            atropelamento_moto: 75,
            sinistro_bicicleta: 67,
            outro: 37
          }
        }
      ]
    }
  ],
  total: 72,
  recife_id: 2611606,
  filtro_aplicado: "validos",
  periodo: {
    inicio: 2020,
    fim: 2025,
    ultimoMes: "2025.04",
    ultimoDia: "2025-04-30",
    totalDiasComDados: 1794
  }
};

export async function loader() {
  
  // Função que sempre resolve com dados mock
  const createSafePromise = (data: any) => {
    return new Promise((resolve) => {
      // Simula um pequeno delay para mostrar loading
      setTimeout(() => {
        resolve(data);
      }, 100);
    });
  };

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
    description1: "Analisamos as chamadas do SAMU relacionadas a sinistros de trânsito para identificar padrões e pontos críticos de segurança viária em Pernambuco.",
    title2: "Como utilizamos os dados?",
    description2: "Processamos dados reais de chamadas do SAMU para mapear sinistros por localização, gravidade, características temporais e perfil das vítimas.",
    documents,
    statisticsBoxes,
    summaryData: createSafePromise(realSummaryData),
    citiesData: createSafePromise(realCitiesData),
  });
}