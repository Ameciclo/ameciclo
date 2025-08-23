import { useLoaderData } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import SinistrosFataisClientSide from "~/components/SinistrosFatais/SinistrosFataisClientSide";
import { DATASUS_CITIES_BY_YEAR_DATA, DATASUS_SUMMARY_DATA, OBSERVATORIO_SINISTROS_PAGE_DATA } from "~/servers.js";

export const loader = async () => {
  // Valores padrão para o caso de falha na API
  let pageData = {
    id: 4,
    title: "Observatório de Sinistros Fatais",
    coverImage: "/public/pages_covers/sinistros-fatais.png",
    explanationBoxes: [],
    supportFiles: []
  };
  
  let summary = { 
    porLocalOcorrencia: {
      totalSinistrosUltimos10Anos: 0,
      totalUltimoAno: 0,
      ultimoAno: 2022,
      crescimentoRelacaoAnoAnterior: 0,
      anoMaisViolento: { ano: 2019, total: 0 },
      dadosPorAno: []
    },
    porLocalResidencia: {
      totalSinistrosUltimos10Anos: 0,
      totalUltimoAno: 0,
      ultimoAno: 2022,
      crescimentoRelacaoAnoAnterior: 0,
      anoMaisViolento: { ano: 2019, total: 0 },
      dadosPorAno: []
    }
  };
  
  let citiesByYear = {
    tipo: "Local de Ocorrência",
    anos: [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022],
    cidades: []
  };

  try {
    // Buscar dados do Strapi
    const strapiRes = await fetch(OBSERVATORIO_SINISTROS_PAGE_DATA, {
      cache: "no-cache",
    });
    
    if (strapiRes.ok) {
      const strapiData = await strapiRes.json();
      
      if (strapiData && strapiData.data && Array.isArray(strapiData.data) && strapiData.data.length > 0) {
        const platformData = strapiData.data[0];
        
        if (platformData) {
          const supportFiles = platformData.supportfiles?.map(file => ({
            title: file.title || "Documento",
            description: file.description || "",
            url: file.file?.url || "#",
            src: file.cover?.url || (
              file.type === "legislação" ? "/icons/legislation.svg" : 
              file.type === "relatório" ? "/icons/report.svg" : 
              "/icons/document.svg"
            )
          })) || [];
          
          pageData = {
            id: platformData.id,
            title: platformData.title,
            coverImage: platformData.cover?.url || "/images/covers/sinistros-fatais.jpg",
            explanationBoxes: platformData.explanationbox?.map(box => ({
              title: box.title,
              description: box.text
            })) || [],
            supportFiles: supportFiles
          };
        }
      }
    }

    // Buscar resumo geral
    const summaryRes = await fetch(DATASUS_SUMMARY_DATA, {
      cache: "no-cache",
    });
    
    if (summaryRes.ok) {
      summary = await summaryRes.json();
    }

    // Buscar dados por cidade e ano
    const citiesByYearRes = await fetch(DATASUS_CITIES_BY_YEAR_DATA, {
      cache: "no-cache",
    });
    
    if (citiesByYearRes.ok) {
      citiesByYear = await citiesByYearRes.json();
    }

  } catch (error) {
    console.error("Erro ao buscar dados:", error);
  }

  return { summary, citiesByYear, pageData };
};

export default function SinistrosFataisPage() {
  const { summary, citiesByYear, pageData } = useLoaderData<typeof loader>();
  
  return (
    <>
      <Banner
        title={pageData.title}
        image={pageData.coverImage}
      />
      <Breadcrumb
        label="Observatório de Sinistros Fatais"
        slug="/sinistros-fatais"
        routes={["/", "/sinistros-fatais"]}
      />
      <SinistrosFataisClientSide
        summaryData={summary} 
        citiesByYearData={citiesByYear}
        pageData={pageData}
      />
    </>
  );
}