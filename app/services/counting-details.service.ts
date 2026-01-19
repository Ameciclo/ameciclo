import { IntlPercentil, IntlNumber, IntlDateStr } from "~/services/utils";

type pointData = {
  key: string;
  latitude: number;
  longitude: number;
  popup?: any;
  size?: number;
  color?: string;
};

export function getCountingCards(count: any) {
  const chars = count.characteristics || {};
  const total = count.total_cyclists || 1;

  return [
    { label: "Mulheres", icon: "women", data: IntlPercentil((chars.women || 0) / total) },
    { label: "Crianças e Adolescentes", icon: "children", data: IntlPercentil((chars.juveniles || 0) / total) },
    { label: "Carona", icon: "ride", data: IntlPercentil((chars.ride || 0) / total) },
    { label: "Capacete", icon: "helmet", data: IntlPercentil((chars.helmet || 0) / total) },
    { label: "Serviço", icon: "service", data: IntlPercentil((chars.service || 0) / total) },
    { label: "Cargueira", icon: "cargo", data: IntlPercentil((chars.cargo || 0) / total) },
    { label: "Compartilhada", icon: "shared_bike", data: IntlPercentil((chars.shared_bike || 0) / total) },
    { label: "Calçada", icon: "sidewalk", data: IntlPercentil((chars.sidewalk || 0) / total) },
    { label: "Contramão", icon: "wrong_way", data: IntlPercentil((chars.wrong_way || 0) / total) },
  ];
}

export function getPointsData(location: any, count: any): pointData[] {
  const lat = parseFloat(location.latitude);
  const lng = parseFloat(location.longitude);

  if (isNaN(lat) || isNaN(lng)) {
    console.warn("Invalid coordinates for location:", location.name);
    return [];
  }

  return [
    {
      key: location.name,
      latitude: lat,
      longitude: lng,
      popup: {
        name: location.name,
        total: count.total_cyclists,
        date: IntlDateStr(count.date),
        url: `/dados/contagens/${location.id}`,
        obs: "",
      },
      size: 20,
      color: "#008888",
    },
  ];
}

export function getCountingStatistics(location: any, count: any) {
  return [
    { title: "Total de ciclistas", value: IntlNumber(count.total_cyclists) },
    { title: "Pico em 1h", value: IntlNumber(count.max_hour_cyclists || 0) },
    { title: "Data da Contagem", value: IntlDateStr(count.date) },
    {
      type: "LinksBox",
      title: "Dados",
      value: [{ label: "JSON", url: `https://cyclist-counts.atlas.ameciclo.org/v1/locations/${location.id}` }],
    },
  ];
}

export function transformOtherCountsForComparison(otherCounts: any[], currentLocationId: number) {
  return (otherCounts || [])
    .filter((loc: any) => loc.id !== currentLocationId)
    .flatMap((loc: any) =>
      (loc.counts || []).map((count: any) => ({
        id: loc.id,
        name: loc.name,
        slug: loc.id.toString(),
        date: count.date,
        total_cyclists: count.total_cyclists,
      }))
    );
}
