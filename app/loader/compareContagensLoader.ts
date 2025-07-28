import { json, LoaderFunctionArgs } from "@remix-run/node";

const COUNTINGS_DATA = "http://api.garfo.ameciclo.org/cyclist-counts/edition";

interface CountEditionSummary {
  max_hour: number;
  total_cyclists: number;
  total_cargo: number;
  total_helmet: number;
  total_juveniles: number;
  total_motor: number;
  total_ride: number;
  total_service: number;
  total_shared_bike: number;
  total_sidewalk: number;
  total_women: number;
  total_wrong_way: number;
}

interface CountEdition {
  id: number;
  slug: string;
  name: string;
  date: string;
  summary: CountEditionSummary;
}

function getBoxesForCountingComparision(data: CountEdition[]) {
  const boxes = data.map((d) => {
    const { name, date, summary } = d;
    const totalCyclists = summary.total_cyclists; // Capture total_cyclists here
    const parameters = [
      { titulo: "Total", media: totalCyclists, mediaType: "number", total: totalCyclists },
      { titulo: "Cargueira", media: summary.total_cargo, mediaType: "number", total: totalCyclists },
      { titulo: "Capacete", media: summary.total_helmet, mediaType: "number", total: totalCyclists },
      { titulo: "Juvenis", media: summary.total_juveniles, mediaType: "number", total: totalCyclists },
      { titulo: "Motor", media: summary.total_motor, mediaType: "number", total: totalCyclists },
      { titulo: "Carona", media: summary.total_ride, mediaType: "number", total: totalCyclists },
      { titulo: "Serviço", media: summary.total_service, mediaType: "number", total: totalCyclists },
      { titulo: "Bike Compartilhada", media: summary.total_shared_bike, mediaType: "number", total: totalCyclists },
      { titulo: "Calçada", media: summary.total_sidewalk, mediaType: "number", total: totalCyclists },
      { titulo: "Mulheres", media: summary.total_women, mediaType: "number", total: totalCyclists },
      { titulo: "Contramão", media: summary.total_wrong_way, mediaType: "number", total: totalCyclists },
    ];
    return {
      titulo: name,
      value: totalCyclists,
      date: date,
      parametros: parameters,
    };
  });
  return boxes;
}

const fetchUniqueData = async (slug: string) => {
  const id = slug.split("-")[0];
  const URL = COUNTINGS_DATA + "/" + id;
  const res = await fetch(URL, { cache: "no-cache" });
  const responseJson = await res.json();
  return responseJson;
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const slugParam = params.slug || "";
  const compareSlugParam = params.compareSlug || "";
  const toCompare = [slugParam].concat(compareSlugParam.split("_COMPARE_")).filter(Boolean);

  const data = await Promise.all(
    toCompare.map(async (d) => {
      const result = await fetchUniqueData(d);
      return result;
    })
  );

  const boxes = getBoxesForCountingComparision(data);

  return json({ boxes });
};