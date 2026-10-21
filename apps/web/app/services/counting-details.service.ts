import { METRICS, type PublicCount, type PublicLocation } from "@ameciclo/db/shared";
import { IntlPercentil, IntlNumber, IntlDateStr } from "~/services/utils";

export type MapPoint = {
  key: string;
  latitude: number;
  longitude: number;
  popup?: {
    name: string;
    total: number;
    date: string;
    url: string;
    obs: string;
    note?: string | null;
  };
  size?: number;
  color?: string;
};

// "Estimada": only some hours were observed and the rest projected.
// "Parcial": only some hours were counted at all.
export function countNote(count: Pick<PublicCount, "estimated" | "partial">): "Estimada" | "Parcial" | null {
  if (count.estimated) return "Estimada";
  if (count.partial) return "Parcial";
  return null;
}

export function getCountingCards(count: PublicCount) {
  const total = count.total_cyclists || 1;
  return METRICS.filter((m) => m.card).map((m) => ({
    label: m.label,
    icon: m.icon,
    data: IntlPercentil(count.characteristics[m.key] / total),
  }));
}

export function getPointsData(location: PublicLocation, count: PublicCount): MapPoint[] {
  if (location.latitude === null || location.longitude === null) return [];
  return [
    {
      key: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      popup: {
        name: location.name,
        total: count.total_cyclists,
        date: IntlDateStr(count.date),
        url: `/dados/contagens/${location.id}`,
        obs: "",
        note: countNote(count),
      },
      size: 20,
      color: "#008888",
    },
  ];
}

export function getCountingStatistics(count: PublicCount) {
  return [
    { title: "Total de ciclistas", value: IntlNumber(count.total_cyclists) },
    { title: "Pico em 1h", value: IntlNumber(count.max_hour_cyclists) },
    { title: "Data da Contagem", value: IntlDateStr(count.date) },
  ];
}

export function transformOtherCountsForComparison(locations: PublicLocation[], currentLocationId: number) {
  return locations
    .filter((loc) => loc.id !== currentLocationId)
    .flatMap((loc) =>
      loc.counts.map((count) => ({
        id: loc.id,
        name: loc.name,
        date: count.date,
        total_cyclists: count.total_cyclists,
        note: countNote(count),
      })),
    );
}

// Year, plus the variant when a place has several counts in the same year.
export function countLabel(count: PublicCount): string {
  const year = count.date.slice(0, 4);
  return count.variant ? `${year} · ${count.variant}` : year;
}
