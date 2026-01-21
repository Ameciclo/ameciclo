import { useMemo } from "react";
import { pointData, PcrCounting } from "typings";
import { IntlDateStr } from "~/services/utils";

const calculateMarkerSize = (totalCyclists: number) => {
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

export function useCountsMapData(amecicloData: any[], pcrCounts: PcrCounting[]) {
  const hasAmecicloData = amecicloData && amecicloData.length > 0;
  const hasPcrData = pcrCounts && pcrCounts.length > 0;

  const controlPanel = useMemo(
    () => [
      { type: "ameciclo", color: "#008888", loading: !hasAmecicloData },
      { type: "prefeitura", color: "#ef4444", loading: !hasPcrData },
    ],
    [hasAmecicloData, hasPcrData]
  );

  const atlasAmecicloPoints: pointData[] = useMemo(() => {
    if (!hasAmecicloData) return [];

    return (amecicloData || [])
      .map((ponto: any) => {
        const lat = parseFloat(ponto.latitude);
        const lng = parseFloat(ponto.longitude);
        const latestCount = ponto.counts?.[0];
        const totalCyclists = latestCount?.total_cyclists || 0;

        return {
          key: `atlas_ameciclo_${ponto.id}`,
          type: "ameciclo",
          latitude: lat,
          longitude: lng,
          popup: {
            name: ponto.name || "Contagem Ameciclo",
            total: totalCyclists,
            date: latestCount?.date ? IntlDateStr(latestCount.date) : "Sem data",
            url: `/dados/contagens/${ponto.id}`,
            obs: "As nossas contagens são registradas manualmente através da observação das pessoas voluntárias, registrando a direção do deslocamento e fatores qualitativos.",
          },
          size: calculateMarkerSize(totalCyclists),
          color: "#008888",
        };
      })
      .filter(isValidCoordinate);
  }, [amecicloData, hasAmecicloData]);

  const pcrPointsData: pointData[] = useMemo(() => {
    return pcrCounts
      .map((d: PcrCounting, index: number) => ({
        key: "pcr_" + index,
        type: "prefeitura",
        latitude: d.location.coordinates[0],
        longitude: d.location.coordinates[1],
        popup: {
          name: d.name || "Contagem PCR",
          total: d.summary?.total || 0,
          date: IntlDateStr(d.date),
          url: "",
          obs: "Contagem realizadas pela ocasião do Diagnóstico do Plano de Mobilidade (ICPS/PCR).",
        },
        size: calculateMarkerSize(d.summary?.total || 0),
        color: "#ef4444",
      }))
      .filter(isValidCoordinate);
  }, [pcrCounts]);

  const pointsData = useMemo(
    () => [...pcrPointsData, ...atlasAmecicloPoints],
    [pcrPointsData, atlasAmecicloPoints]
  );

  return { pointsData, controlPanel };
}
