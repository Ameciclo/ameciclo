import { defer, LoaderFunctionArgs } from "@remix-run/node";
import { unslugify } from "~/utils/slugify";
import { VIAS_INSEGURAS_HISTORY, VIAS_INSEGURAS_BASE_URL, VIAS_INSEGURAS_SEARCH, VIAS_INSEGURAS_LIST } from "~/servers";



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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const res = await fetch(url, { 
      cache: "no-cache",
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
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
  const url = `${VIAS_INSEGURAS_SEARCH}?street=${encodeURIComponent(viaName)}&limit=100&includeGeom=false`; // Limitando para 100 registros
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout para esta API mais lenta
    
    const res = await fetch(url, { 
      cache: "no-cache",
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
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
  return { cover: { url: "/pages_covers/vias-inseguras.png" }, archives: [] };
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const viaNamePromise = fetchViaName(params.slug as string);
  
  const dataPromise = viaNamePromise.then(viaName => 
    viaName ? fetchViaData(viaName) : null
  );
  const mapDataPromise = viaNamePromise.then(viaName => 
    viaName ? fetchViaMapData(viaName) : null
  );
  const sinistrosDataPromise = viaNamePromise.then(viaName => 
    viaName ? fetchViaSinistrosData(viaName) : null
  );
  const pageDataPromise = Promise.resolve(fetchPageData());

  return defer({ dataPromise, mapDataPromise, sinistrosDataPromise, pageDataPromise });
};