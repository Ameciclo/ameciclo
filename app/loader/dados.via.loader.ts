import { unslugify } from "~/utils/slugify";
import { VIAS_INSEGURAS_HISTORY, VIAS_INSEGURAS_BASE_URL, VIAS_INSEGURAS_SEARCH, VIAS_INSEGURAS_LIST } from "~/servers";

const VIAS_INSEGURAS_PAGE_DATA = "https://cms.ameciclo.org/vias-inseguras";

export const fetchViaName = async (slug: string) => {
  const url = `${VIAS_INSEGURAS_LIST}?slug=${slug}`;
  
  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) {
      console.error(`List API Error: ${res.status} ${res.statusText}`);
      return unslugify(slug);
    }
    const data = await res.json();
    return data?.via || unslugify(slug);
  } catch (error) {
    console.error("Error fetching via name:", error);
    return unslugify(slug);
  }
};

export const fetchViaData = async (viaName: string) => {
  const url = `${VIAS_INSEGURAS_HISTORY}?via=${encodeURIComponent(viaName)}`;
  
  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) {
      console.error(`API Error: ${res.status} ${res.statusText}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching via data:", error);
    return null;
  }
};

export const fetchViaMapData = async (viaName: string) => {
  const url = `${VIAS_INSEGURAS_BASE_URL}/samu-calls/streets/map?via=${encodeURIComponent(viaName)}&includeGeom=true`;
  
  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) {
      console.error(`Map API Error: ${res.status} ${res.statusText}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching via map data:", error);
    return null;
  }
};

export const fetchViaSinistrosData = async (viaName: string) => {
  const url = `${VIAS_INSEGURAS_SEARCH}?street=${encodeURIComponent(viaName)}&limit=all&includeGeom=false`;
  
  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) {
      console.error(`Sinistros API Error: ${res.status} ${res.statusText}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching via sinistros data:", error);
    return null;
  }
};

export const fetchPageData = async () => {
  try {
    const res = await fetch(VIAS_INSEGURAS_PAGE_DATA, { cache: "no-cache" });
    if (!res.ok) {
      return { cover: { url: "/pages_covers/vias-inseguras.png" }, archives: [] };
    }
    return await res.json();
  } catch (error) {
    return { cover: { url: "/pages_covers/vias-inseguras.png" }, archives: [] };
  }
};