import { json } from "@remix-run/node";
import { SAMU_SUMMARY_DATA, SAMU_CITIES_DATA } from "~/servers";

export async function loader() {
  try {
    // Validar se as URLs estão definidas
    if (!SAMU_SUMMARY_DATA || !SAMU_CITIES_DATA) {
      throw new Error("URLs do SAMU não estão configuradas corretamente");
    }

    // Buscar dados em paralelo
    const [summaryRes, citiesRes] = await Promise.all([
      fetch(SAMU_SUMMARY_DATA, { cache: "no-cache" }),
      fetch(SAMU_CITIES_DATA, { cache: "no-cache" })
    ]);

    const [summaryData, citiesData] = await Promise.all([
      summaryRes.json(),
      citiesRes.json()
    ]);

    // Calcular estatísticas para o StatisticsBox
    const getStatisticsFromData = () => {
      if (!summaryData) return [];

      const totalChamadas = summaryData.totalDesfechosValidos || 0;

      // Usar dados do summary para período e ano mais violento
      const anoInicio = summaryData.periodoInicio || 2018;
      const anoFim = summaryData.periodoFim || 2024;
      const anoMaisViolento = {
        ano: summaryData.anoMaisViolento || "2024",
        total: summaryData.totalAnoMaisViolento || 0
      };

      // Contar cidades avaliadas
      const cidadesAvaliadas = citiesData?.total || 0;
      const cidadeMaisViolenta = citiesData?.cidades?.[0] || {};
      const chamadosMaisViolentaPercentual = (
        (100 * (cidadeMaisViolenta.count || 0)) /
        (summaryData.totalDesfechosValidos || 1)
      ).toFixed(1);

      return [
        {
          title: "Total de chamadas",
          value: totalChamadas.toLocaleString(),
          unit: `${anoInicio} - ${anoFim}`,
        },
        {
          title: "Ano mais violento",
          value: anoMaisViolento.ano,
          unit: `${anoMaisViolento.total.toLocaleString()} chamadas`,
        },
        {
          title: "Área de cobertura (PE)",
          value: cidadesAvaliadas || "N/A",
          unit: "municípios",
        },
        {
          title: "Cidade mais violenta",
          value: cidadeMaisViolenta.name || "N/A",
          unit: `${chamadosMaisViolentaPercentual}% das chamadas`,
        },
      ];
    };

    const statisticsBoxes = getStatisticsFromData();

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

    return json({
      cover: "/pages_covers/chamadosdosamu.png",
      title1: "O que são chamadas de sinistro?",
      description1: "Analisamos as chamadas do SAMU relacionadas a sinistros de trânsito para identificar padrões e pontos críticos de segurança viária.",
      title2: "Como utilizamos os dados?",
      description2: "Processamos dados de chamadas do SAMU para mapear sinistros por localização, gravidade e características temporais.",
      documents,
      statisticsBoxes,
      summaryData,
      citiesData,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do SAMU:", error);
    
    return json({
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
      statisticsBoxes: [],
      summaryData: {},
      citiesData: { cidades: [], total: 0 },
    });
  }
}