import { json } from "@remix-run/node";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";

export const loader = async () => {
  const server = "https://cms.ameciclo.org";

  try {
    const [ameciclistas, custom] = await Promise.all([
      fetchWithTimeout(`${server}/ameciclistas`, { cache: "no-cache" }, 15000, []),
      fetchWithTimeout(
        `${server}/quem-somos`,
        { cache: "no-cache" },
        15000,
        { definition: "Associação Metropolitana de Ciclistas do Recife", objective: "Promover a mobilidade ativa", links: [] }
      )
    ]);

    // Defensive check to ensure ameciclistas is an array before sorting
    let processedAmeciclistas = ameciclistas;
    if (Array.isArray(processedAmeciclistas)) {
      processedAmeciclistas.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      console.error("Data received for /ameciclistas is not an array:", processedAmeciclistas);
      // Return a safe value to prevent crashing
      processedAmeciclistas = [];
    }
    
    return json({
      pageData: { ameciclistas: processedAmeciclistas, custom }
    });
  } catch (error) {
    console.error("Error fetching or processing data for Quem Somos:", error);
    // Return a safe, default state to prevent the entire page from crashing
    return json({
      pageData: {
        ameciclistas: [],
        custom: {
          definition: "Associação Metropolitana de Ciclistas do Recife",
          objective: "Promover a mobilidade ativa",
          links: []
        }
      }
    });
  }
};