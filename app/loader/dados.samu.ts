import { json } from "@remix-run/node";
import { SAMU_SUMMARY_API, SAMU_CITIES_API } from "~/servers";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { fetchCityDataServer } from "~/services/samu.server";
import samuMockData from "~/data/samu-mock-data.json";

export async function loader() {
  const errors: Array<{url: string, error: string}> = [];
  
  const onError = (url: string) => (error: string) => {
    errors.push({ url, error });
  };
  
  try {
    const cover = "/pages_covers/chamadosdosamu.png";
    const title1 = "O que são chamadas de sinistro?";
    const description1 = "Analisamos as chamadas do SAMU relacionadas a sinistros de trânsito para identificar padrões e pontos críticos de segurança viária em Pernambuco.";
    const title2 = "Como utilizamos os dados?";
    const description2 = "Processamos dados reais de chamadas do SAMU para mapear sinistros por localização, gravidade, características temporais e perfil das vítimas.";

    const [summaryData, citiesData] = await Promise.all([
      fetchWithTimeout(SAMU_SUMMARY_API, { cache: "force-cache" }, 10000, null, onError(SAMU_SUMMARY_API), 1),
      fetchWithTimeout(SAMU_CITIES_API, { cache: "force-cache" }, 10000, null, onError(SAMU_CITIES_API), 1)
    ]);

    let usingMockData = false;
    let processedData;

    if (summaryData && citiesData) {
      console.log('🔍 Dados de cidades da API:', citiesData.cidades?.[0]);
      
      const totalChamadas = summaryData.totalChamadas || 0;
      const evolucaoAnual = summaryData.evolucaoAnual || [];
      const anoMaisViolento = evolucaoAnual.length > 0 
        ? evolucaoAnual.reduce((max: any, curr: any) => curr.count > max.count ? curr : max)
        : { ano: 0, count: 0 };
      
      const cidadeMaisViolenta = summaryData.cidadeMaisViolenta || {};
      const totalCidades = citiesData.cidades?.length || 0;
      
      // Buscar dados detalhados das principais cidades da RMR
      const rmrCities = ["RECIFE", "OLINDA", "PAULISTA"];
      const citiesDetails = await Promise.all(
        rmrCities.map(city => fetchCityDataServer(city))
      );
      
      const citiesWithDetails = citiesData.cidades.map((city: any, index: number) => {
        // Adicionar campo municipio que está faltando
        const cityWithMunicipio = {
          ...city,
          municipio: city.municipio || city.nome || `CIDADE_${index}`
        };
        
        const rmrIndex = rmrCities.indexOf(cityWithMunicipio.municipio);
        if (rmrIndex !== -1 && citiesDetails[rmrIndex]) {
          return { ...cityWithMunicipio, ...citiesDetails[rmrIndex] };
        }
        return cityWithMunicipio;
      });
      
      processedData = {
        totalChamadas,
        anoMaisViolento: { 
          ano: anoMaisViolento.ano || 0, 
          total: anoMaisViolento.count || 0 
        },
        cidadeMaisViolenta: {
          municipio: cidadeMaisViolenta.municipio || "N/A",
          total: cidadeMaisViolenta.totalValidas || 0,
          percentual: totalChamadas > 0 ? ((cidadeMaisViolenta.totalValidas || 0) / totalChamadas) * 100 : 0
        },
        totalMunicipios: totalCidades,
        citiesData: { ...citiesData, cidades: citiesWithDetails }
      };
    } else {
      console.warn("⚠️ Usando dados estáticos do SAMU");
      usingMockData = true;
      processedData = {
        totalChamadas: 73667,
        anoMaisViolento: { ano: 2024, total: 20785 },
        cidadeMaisViolenta: { municipio: "Recife", total: 26904, percentual: 36.5 },
        totalMunicipios: 72,
        citiesData: samuMockData.citiesData
      };
    }

    const statisticsBoxes = [
      {
        title: "Total de chamadas",
        value: processedData.totalChamadas.toLocaleString(),
        unit: "2016 - 2024",
      },
      {
        title: "Ano mais violento",
        value: processedData.anoMaisViolento.ano.toString(),
        unit: `${processedData.anoMaisViolento.total.toLocaleString()} chamadas`,
      },
      {
        title: "Área de cobertura (PE)",
        value: processedData.totalMunicipios.toString(),
        unit: "municípios",
      },
      {
        title: "Cidade mais violenta",
        value: processedData.cidadeMaisViolenta.municipio,
        unit: `${processedData.cidadeMaisViolenta.percentual.toFixed(1)}% das chamadas`,
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
          url: "https://emergency-calls.atlas.ameciclo.org",
          target: "_blank",
        },
      ],
    };

    return json({
      cover,
      title1,
      description1,
      title2,
      description2,
      documents,
      statisticsBoxes,
      citiesData: processedData.citiesData,
      usingMockData,
      apiDown: errors.length > 0,
      apiErrors: errors,
    });
  } catch (error) {
    console.error("❌ Erro crítico no SAMU Loader:", error);
    throw error;
  }
}