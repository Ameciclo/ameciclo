import { json, LoaderFunctionArgs } from "@remix-run/node";

const IDECICLO_FORMS_DATA = "https://api.ideciclo.ameciclo.org/forms";
const IDECICLO_PAGE_DATA = "https://cms.ameciclo.org/ideciclo";
const IDECICLO_STRUCTURES_DATA = "https://api.ideciclo.ameciclo.org/structures";

async function getStructureMap(structure: any, request: Request) {
  const geoJsonMap = {
    type: "FeatureCollection",
    name: structure.street,
    crs: {
      type: "name",
      properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" },
    },
    features: [],
  };

  try {
    const url = new URL(request.url);
    const mapUrl = new URL('/dbs/malhacicloviariapermanente_mar2021.json', url.origin);
    const response = await fetch(mapUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch map data');
    }
    const map = await response.json();

    structure.reviews[structure.reviews.length - 1].segments.forEach((seg: any) => {
      const feature = map.features.find((m: any) => String(m.properties.idunido) == String(seg.geo_id));
      if (feature) {
        geoJsonMap.features.push(feature);
      }
    });

    if (geoJsonMap.features.length === 0) {
      geoJsonMap.features = map.features.slice(0, 100); // Fallback to show some data
    }
  } catch (error) {
    console.error('Error loading map data:', error);
    // On error, we might want to return an empty map or a default one
  }

  return geoJsonMap;
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const id = params.id;
  if (!id) throw new Error("ID is required");

  const structureRes = await fetch(IDECICLO_STRUCTURES_DATA + "/" + id);
  const structure = await structureRes.json();

  const new_review_form_id = structure.reviews[structure.reviews.length - 1].segments[0].form_id;
  const formRes = await fetch(IDECICLO_FORMS_DATA + "/" + new_review_form_id);
  const forms = await formRes.json();

  const pageDataRes = await fetch(IDECICLO_PAGE_DATA);
  const pageData = await pageDataRes.json();

  const mapData = await getStructureMap(structure, request);

  return json({ structure, forms, pageData, mapData });
}