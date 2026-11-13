import { useMemo } from "react";
import { contagemSlug } from "@ameciclo/db/slug";
import type { PublicLocation } from "@ameciclo/db/shared";
import type { pointData } from "typings";
import { countNote } from "~/services/counting-details.service";
import { IntlDateStr } from "~/services/utils";

export const calculateMarkerSize = (totalCyclists: number) => {
  if (totalCyclists === 0) return 8;
  const baseSize = 10;
  const maxSize = 40;
  const maxCyclists = 9000;
  const scaleFactor = (maxSize - baseSize) / maxCyclists;
  return Math.min(baseSize + totalCyclists * scaleFactor, maxSize);
};

const isValidCoordinate = (point: pointData) =>
  point.latitude >= -90 &&
  point.latitude <= 90 &&
  point.longitude >= -180 &&
  point.longitude <= 180;

export function useCountsMapData(amecicloData: PublicLocation[] | null) {
  const hasAmecicloData = amecicloData && amecicloData.length > 0;

  const controlPanel = useMemo(
    () => [{ type: "ameciclo", color: "#008888", loading: !hasAmecicloData }],
    [hasAmecicloData]
  );

  const atlasAmecicloPoints: pointData[] = useMemo(() => {
    if (!hasAmecicloData) return [];

    return (amecicloData ?? [])
      .flatMap((place): pointData[] => {
        const latestCount = place.counts[0];
        if (place.latitude === null || place.longitude === null || !latestCount) return [];
        return [
          {
            key: `atlas_ameciclo_${place.id}`,
            type: "ameciclo",
            latitude: place.latitude,
            longitude: place.longitude,
            popup: {
              name: place.name,
              total: latestCount.total_cyclists,
              date: IntlDateStr(latestCount.date),
              year: latestCount.date.slice(0, 4),
              url: `/dados/contagens/${contagemSlug(place.slug, latestCount)}`,
              note: countNote(latestCount),
              obs: "As nossas contagens são registradas manualmente através da observação das pessoas voluntárias, registrando a direção do deslocamento e fatores qualitativos.",
            },
            size: calculateMarkerSize(latestCount.total_cyclists),
            color: "#008888",
          },
        ];
      })
      .filter(isValidCoordinate);
  }, [amecicloData, hasAmecicloData]);

  return { pointsData: atlasAmecicloPoints, controlPanel };
}
