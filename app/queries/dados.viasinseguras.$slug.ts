import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { unslugify } from "~/utils/slugify";
import { cmsFetch } from "~/services/cmsFetch";
import {
  VIAS_INSEGURAS_HISTORY,
  VIAS_INSEGURAS_BASE_URL,
  VIAS_INSEGURAS_SEARCH,
  VIAS_INSEGURAS_LIST,
} from "~/servers";

const fetchViaName = async (slug: string) => {
  const url = `${VIAS_INSEGURAS_LIST}?slug=${slug}`;
  const data = await cmsFetch<any>(url, {
    ttl: 300,
    timeout: 5000,
    fallback: null,
  });
  return data?.via || unslugify(slug);
};

const fetchViaData = async (viaName: string) => {
  const url = `${VIAS_INSEGURAS_HISTORY}?via=${encodeURIComponent(viaName)}`;
  return cmsFetch<any>(url, {
    ttl: 300,
    timeout: 10000,
    fallback: null,
  });
};

const fetchViaMapData = async (viaName: string) => {
  const url = `${VIAS_INSEGURAS_BASE_URL}/samu-calls/streets/map?via=${encodeURIComponent(viaName)}&includeGeom=true`;
  return cmsFetch<any>(url, {
    ttl: 300,
    timeout: 5000,
    fallback: null,
  });
};

const fetchViaSinistrosData = async (viaName: string) => {
  const url = `${VIAS_INSEGURAS_SEARCH}?street=${encodeURIComponent(viaName)}&limit=100&includeGeom=false`;
  return cmsFetch<any>(url, {
    ttl: 300,
    timeout: 15000,
    fallback: null,
  });
};

const fetchPageData = async () => {
  return { cover: { url: "/pages_covers/vias-inseguras.png" }, archives: [] };
};

const fetchViasInsegurasSlug = createServerFn()
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const viaName = await fetchViaName(data.slug);

    const [viaData, mapData, sinistrosData, pageData] = await Promise.all([
      viaName ? fetchViaData(viaName) : null,
      viaName ? fetchViaMapData(viaName) : null,
      viaName ? fetchViaSinistrosData(viaName) : null,
      fetchPageData(),
    ]);

    return { data: viaData, mapData, sinistrosData, pageData };
  });

export const viasInsegurasSlugQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["dados", "vias-inseguras", slug],
    queryFn: () => fetchViasInsegurasSlug({ data: { slug } }),
  });
