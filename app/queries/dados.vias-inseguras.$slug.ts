import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { unslugify } from "~/utils/slugify";
import { cmsFetch } from "~/services/cmsFetch";
import {
  VIAS_INSEGURAS_HISTORY_V2,
  VIAS_INSEGURAS_MAP,
  VIAS_INSEGURAS_SEARCH,
  VIAS_INSEGURAS_STREET_SUMMARY,
} from "~/servers";

const STREET_NAME_ALIASES: Record<string, string[]> = {
  "Rod Br Cento E Um": ["BR-101"],
};

const fetchViaName = (slug: string) => unslugify(slug);

const tryNames = (viaName: string): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  const add = (n: string) => { if (!seen.has(n)) { seen.add(n); result.push(n); } };
  add(viaName);
  add(viaName.toUpperCase());
  return result;
};

const fetchViaData = async (viaName: string) => {
  for (const name of tryNames(viaName)) {
    const url = `${VIAS_INSEGURAS_HISTORY_V2}?via=${encodeURIComponent(name)}&startYear=2020`;
    const data = await cmsFetch<any>(url, {
      ttl: 300,
      timeout: 10000,
      fallback: null,
    });
    if (data?.evolucao?.length > 0) return data;
  }
  return { evolucao: [], via: viaName };
};

const fetchGeometryFromGeojson = async (viaName: string) => {
  for (const name of tryNames(viaName)) {
    const geoData = await cmsFetch<any>(VIAS_INSEGURAS_MAP, {
      ttl: 300,
      timeout: 5000,
      fallback: null,
    });
    if (!geoData?.features) continue;

    const match = geoData.features.find((f: any) => {
      const sn = f.properties?.street_name || "";
      return sn.toUpperCase() === name.toUpperCase();
    });
    if (match?.geometry) return match.geometry;
  }
  return null;
};

const fetchViaMapData = async (viaName: string) => {
  for (const name of tryNames(viaName)) {
    const url = `${VIAS_INSEGURAS_STREET_SUMMARY}/${encodeURIComponent(name)}/summary`;
    const data = await cmsFetch<any>(url, {
      ttl: 300,
      timeout: 5000,
      fallback: null,
    });
    if (data?.total_victims > 0) {
      const geometria = data.geometria || (await fetchGeometryFromGeojson(viaName));
      return {
        ...data,
        vias: [{
          nome: data.street_name || viaName,
          sinistros: data.total_victims || 0,
          km: data.street_extension_km || 0,
          sinistros_por_km: data.street_extension_km ? data.total_victims / data.street_extension_km : 0,
          geometria,
        }],
      };
    }
  }
  return null;
};

const fetchViaSinistrosData = async (viaName: string) => {
  const names = tryNames(viaName);
  const aliases = STREET_NAME_ALIASES[viaName] || [];
  for (const name of [...names, ...aliases]) {
    const url = `${VIAS_INSEGURAS_SEARCH}?street=${encodeURIComponent(name)}&limit=9999&includeGeom=false`;
    const data = await cmsFetch<any>(url, {
      ttl: 300,
      timeout: 15000,
      fallback: null,
    });
    if (data?.sinistros?.length > 0) return data;
  }
  return null;
};

const fetchViasInsegurasSlug = createServerFn()
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const viaName = fetchViaName(data.slug);

    const [viaData, mapData, sinistrosData] = await Promise.all([
      fetchViaData(viaName),
      fetchViaMapData(viaName),
      fetchViaSinistrosData(viaName),
    ]);

    return { data: { ...viaData, via: viaName }, mapData, sinistrosData };
  });

export const viasInsegurasSlugQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["dados", "vias-inseguras", slug],
    queryFn: () => fetchViasInsegurasSlug({ data: { slug } }),
  });
