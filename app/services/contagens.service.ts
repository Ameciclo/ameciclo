import { IntlNumber, IntlPercentil, IntlDateStr } from "~/services/utils";

export interface ContagemData {
  id: string;
  name: string;
  slug: string;
  date: string;
  total_cyclists: number;
  coordinates: {
    latitude?: number;
    longitude?: number;
    x?: number;
    y?: number;
  };
  total_women?: number;
  total_juveniles?: number;
  total_ride?: number;
  total_helmet?: number;
  total_service?: number;
  total_cargo?: number;
  total_shared_bike?: number;
  total_sidewalk?: number;
  total_wrong_way?: number;
}

export interface SummaryData {
  total_cyclists: number;
  number_counts: number;
  different_counts_points: number;
  where_max_count: {
    total_cyclists: number;
  };
  total_women: number;
  total_juveniles: number;
  total_ride: number;
  total_helmet: number;
  total_service: number;
  total_cargo: number;
  total_shared_bike: number;
  total_sidewalk: number;
  total_wrong_way: number;
}

export interface PointData {
  key: string;
  type: 'ameciclo' | 'prefeitura';
  latitude: number;
  longitude: number;
  popup: {
    name: string;
    total: number;
    date: string;
    url: string;
    obs: string;
  };
  size: number;
  color: string;
}

export const allCountsStatistics = (summaryData: SummaryData) => {
  const { total_cyclists, number_counts, where_max_count, different_counts_points } = summaryData;
  
  return [
    {
      title: "Total de ciclistas",
      value: IntlNumber(total_cyclists),
    },
    {
      title: "Contagens Realizadas",
      value: IntlNumber(number_counts),
    },
    { 
      title: "Pontos Monitorados", 
      value: IntlNumber(different_counts_points) 
    },
    {
      title: "Máximo em um ponto",
      value: IntlNumber(where_max_count.total_cyclists),
    },
  ];
};

export const CardsData = (summaryData: SummaryData) => {
  const {
    total_cyclists,
    total_women,
    total_juveniles,
    total_ride,
    total_helmet,
    total_service,
    total_cargo,
    total_shared_bike,
    total_sidewalk,
    total_wrong_way,
  } = summaryData;

  return [
    {
      label: "Mulheres",
      icon: "/icons/contagens/women.svg",
      data: IntlPercentil(total_women / total_cyclists),
    },
    {
      label: "Crianças e Adolescentes",
      icon: "/icons/contagens/children.svg",
      data: IntlPercentil(total_juveniles / total_cyclists),
    },
    {
      label: "Carona",
      icon: "/icons/contagens/ride.svg",
      data: IntlPercentil(total_ride / total_cyclists),
    },
    {
      label: "Capacete",
      icon: "/icons/contagens/helmet.svg",
      data: IntlPercentil(total_helmet / total_cyclists),
    },
    {
      label: "Serviço",
      icon: "/icons/contagens/service.svg",
      data: IntlPercentil(total_service / total_cyclists),
    },
    {
      label: "Cargueira",
      icon: "/icons/contagens/cargo.svg",
      data: IntlPercentil(total_cargo / total_cyclists),
    },
    {
      label: "Compartilhada",
      icon: "/icons/contagens/shared_bike.svg",
      data: IntlPercentil(total_shared_bike / total_cyclists),
    },
    {
      label: "Calçada",
      icon: "/icons/contagens/sidewalk.svg",
      data: IntlPercentil(total_sidewalk / total_cyclists),
    },
    {
      label: "Contramão",
      icon: "/icons/contagens/wrong_way.svg",
      data: IntlPercentil(total_wrong_way / total_cyclists),
    },
  ];
};

export const processPointsData = (data: any[]): PointData[] => {
  return data.map((d) => ({
    key: d.id,
    type: 'ameciclo' as const,
    latitude: d.coordinates?.latitude || d.coordinates?.x || 0,
    longitude: d.coordinates?.longitude || d.coordinates?.y || 0,
    popup: {
      name: d.name,
      total: d.total_cyclists,
      date: IntlDateStr(d.date),
      url: `/contagens/${d.slug}`,
      obs: ""
    },
    size: Math.round(d.total_cyclists / 250) + 5,
    color: "#008888"
  }));
};