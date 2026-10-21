import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { cmsFetch } from "~/services/cmsFetch";
import {
  IDECICLO_FORMS_DATA,
  IDECICLO_PAGE_DATA,
  IDECICLO_STRUCTURES_DATA,
} from "~/servers";

const MAP_DATA_URL = "https://ameciclo.org/dbs/malhacicloviariapermanente_mar2021.json";

async function getStructureMap(structure: any) {
  const geoJsonMap: any = {
    type: "FeatureCollection",
    name: structure.street,
    crs: {
      type: "name",
      properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" },
    },
    features: [],
  };

  try {
    const response = await fetch(MAP_DATA_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch map data");
    }
    const map = await response.json();

    structure.reviews[structure.reviews.length - 1].segments.forEach(
      (seg: any) => {
        const feature = map.features.find(
          (m: any) => String(m.properties.idunido) == String(seg.geo_id)
        );
        if (feature) {
          geoJsonMap.features.push(feature);
        }
      }
    );

    if (geoJsonMap.features.length === 0) {
      geoJsonMap.features = map.features.slice(0, 100);
    }
  } catch (error) {
    console.error("Error loading map data:", error);
  }

  return geoJsonMap;
}

const fetchIdecicloDetail = createServerFn()
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { id } = data;
    if (!id) throw new Error("ID is required");

    const structure = await cmsFetch<any>(
      `${IDECICLO_STRUCTURES_DATA}/${id}`,
      { ttl: 60, timeout: 10000 }
    );

    if (!structure) throw new Error("Error loading structure");

    const new_review_form_id =
      structure.reviews[structure.reviews.length - 1].segments[0].form_id;

    const forms = await cmsFetch<any>(
      `${IDECICLO_FORMS_DATA}/${new_review_form_id}`,
      { ttl: 300, timeout: 10000 }
    );

    const pageDataResponse = await cmsFetch<any>(IDECICLO_PAGE_DATA, {
      ttl: 600,
      timeout: 10000,
    });
    const pageData = pageDataResponse?.data || {
      description: "",
      objective: "",
      methodology: "",
      cover: null,
    };

    const mapData = await getStructureMap(structure);

    return { structure, forms, pageData, mapData };
  });

export const idecicloDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["dados", "ideciclo", id],
    queryFn: () => fetchIdecicloDetail({ data: { id } }),
  });
