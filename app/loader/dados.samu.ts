import { defer } from "@remix-run/node";
import { SAMU_SUMMARY_DATA, SAMU_CITIES_DATA } from "~/servers";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import samuMockData from "~/data/samu-mock-data.json";

export async function loader() {
  
  try {
    // Validar se as URLs estão definidas
    if (!SAMU_SUMMARY_DATA || !SAMU_CITIES_DATA) {
      console.error('❌ URLs do SAMU não configuradas:', { SAMU_SUMMARY_DATA, SAMU_CITIES_DATA });
      throw new Error("URLs do SAMU não estão configuradas corretamente");
    }
    

    // Retornar dados mockados diretamente para garantir funcionamento
    const summaryDataPromise = Promise.resolve(samuMockData.summaryData);
    const citiesDataPromise = Promise.resolve(samuMockData.citiesData);
    

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
      usingMockData: true,
      mockDataDate: "16 de setembro de 2025",
    });
  } catch (error) {
    console.error("❌ Erro crítico no SAMU Loader:", error);
    throw error;
  }
}