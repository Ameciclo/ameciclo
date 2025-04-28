import { json, LoaderFunction } from "@remix-run/node";
import { IntlPercentil } from "~/utils/utils";

export const loader: LoaderFunction = async () => {
  // Busca o cover
  const res = await fetch("https://cms.ameciclo.org/contagens", {
    cache: "no-cache",
  });

  if (!res.ok) {
    throw new Response("Erro ao buscar os dados", { status: res.status });
  }

  const data = await res.json();
  const cover = data.cover;
  const description = data.description;
  const objective = data.objective;
  const archives = data.archives;

  // Busca os dados adicionais (summary + page)
  const summaryDataRes = await fetch("http://api.garfo.ameciclo.org/cyclist-counts", {
    cache: "no-cache",
  });
  const summaryDataJson = await summaryDataRes.json();
  const summaryData = summaryDataJson.summary;
  const countsData = summaryDataJson.counts;

  const pageDataRes = await fetch("https://cms.ameciclo.org/contagens", { cache: "no-cache" });
  const pageData = await pageDataRes.json();

  const CardsData = (summaryData: any) => {
    const {
      total_cyclists,
      total_cargo,
      total_helmet,
      total_juveniles,
      total_motor,
      total_ride,
      total_service,
      total_shared_bike,
      total_sidewalk,
      total_women,
      total_wrong_way,
    } = { ...summaryData };

    return [
      {
        label: "Mulheres",
        icon: "women",
        data: IntlPercentil(total_women / total_cyclists),
      },
      {
        label: "Crianças e Adolescentes",
        icon: "children",
        data: IntlPercentil(total_juveniles / total_cyclists),
      },
      {
        label: "Carona",
        icon: "ride",
        data: IntlPercentil(total_ride / total_cyclists),
      },
      {
        label: "Capacete",
        icon: "helmet",
        data: IntlPercentil(total_helmet / total_cyclists),
      },
      {
        label: "Serviço",
        icon: "service",
        data: IntlPercentil(total_service / total_cyclists),
      },
      {
        label: "Cargueira",
        icon: "cargo",
        data: IntlPercentil(total_cargo / total_cyclists),
      },
      {
        label: "Compartilhada",
        icon: "shared_bike",
        data: IntlPercentil(total_shared_bike / total_cyclists),
      },
      {
        label: "Calçada",
        icon: "sidewalk", //CRIAR!
        data: IntlPercentil(total_sidewalk / total_cyclists),
      },
      {
        label: "Contramão",
        icon: "wrong_way",
        data: IntlPercentil(total_wrong_way / total_cyclists),
      },
    ];
  };
  const cards = CardsData(summaryData);
  // Retorna tudo junto
  return json({
    cover,
    summaryData,
    countsData,
    pageData,
    description,
    objective,
    archives,
    cards,
  });
};
