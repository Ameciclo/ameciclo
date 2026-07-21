import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { COUNTINGS_ATLAS_LOCATIONS, PERFIL_SURVEY_LOCATIONS, VIAS_INSEGURAS_MAP } from "~/servers";

function getSinistroTotal(properties: Record<string, any>): number {
  const cats = properties.accidents_by_category || {};
  const keys = Object.values(cats);
  if (keys.length > 0) {
    return keys.reduce((sum: number, v: any) => sum + (v || 0), 0);
  }
  return properties.accidents_count || 0;
}

function deriveSeverity(count: number): string {
  if (count >= 150) return 'high';
  if (count >= 50) return 'medium';
  return 'low';
}

const fetchCicloDados = createServerFn().handler(async () => {
  try {
    const [amecicloResponse, perfilResponse, sinistrosResponse] = await Promise.all([
      fetch(COUNTINGS_ATLAS_LOCATIONS),
      fetch(PERFIL_SURVEY_LOCATIONS),
      fetch(VIAS_INSEGURAS_MAP),
    ]);

    const amecicloData = amecicloResponse.ok
      ? await amecicloResponse.json()
      : [];
    const perfilData = perfilResponse.ok ? await perfilResponse.json() : null;

    let sinistrosData: any = null;
    if (sinistrosResponse.ok) {
      const geojson = await sinistrosResponse.json();
      if (geojson.type === 'FeatureCollection' && geojson.features) {
        sinistrosData = {
          ...geojson,
          features: geojson.features.map((feature: any) => ({
            ...feature,
            properties: {
              ...feature.properties,
              severity: deriveSeverity(getSinistroTotal(feature.properties)),
            },
          })),
        };
      } else {
        sinistrosData = geojson;
      }
    } else {
      console.error('[server] sinistros response not ok:', sinistrosResponse.status, sinistrosResponse.statusText);
    }

    return {
      contagemData: { ameciclo: amecicloData, prefeitura: [] as any[] },
      execucaoCicloviaria: null as any,
      perfilCiclistas: perfilData,
      sinistrosData,
    };
  } catch (error) {
    console.error("Error loading ciclodados:", error);
    return {
      contagemData: { ameciclo: [] as any[], prefeitura: [] as any[] },
      execucaoCicloviaria: null as any,
      perfilCiclistas: null as any,
      sinistrosData: null,
    };
  }
});

export const ciclodadosQueryOptions = () =>
  queryOptions({
    queryKey: ["dados", "ciclodados"],
    queryFn: () => fetchCicloDados(),
  });
