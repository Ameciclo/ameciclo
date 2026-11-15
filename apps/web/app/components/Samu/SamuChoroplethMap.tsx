"use client";
// Chamados do SAMU por município. Passar o mouse mostra os números; clicar escolhe o município no explorador.
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import ReactMapGL, {
  Layer,
  NavigationControl,
  Popup,
  Source,
  type LayerProps,
  type MapLayerMouseEvent,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { SamuCityRow } from "@ameciclo/db";

const MAPSTYLE = "https://tiles.openfreemap.org/styles/positron";

// Pale yellow to dark red (ColorBrewer YlOrRd, as the old page): more calls, hotter.
const RAMP = ["#ffffb2", "#fecc5c", "#fd8d3c", "#f03b20", "#bd0026"];
const NO_CALLS = "#f3f4f6";

type Municipalities = {
  features: { type: "Feature"; properties: { id: string; name: string }; geometry: GeoJSON.Geometry }[];
};

const municipalitiesQuery = {
  queryKey: ["geojson", "pernambuco-municipios"],
  queryFn: async (): Promise<Municipalities> => (await fetch("/data/pernambuco-municipios.geojson")).json(),
  staleTime: Infinity,
};

// Fernando de Noronha is 360 km out at sea: fitting the map to it would push the mainland into a corner.
const FERNANDO_DE_NORONHA = 2605459;

const number = (n: number) => n.toLocaleString("pt-BR");

// Five classes with about the same number of municipalities each: one city (Recife) has
// more calls than the rest, so equal-width classes would paint almost everything pale.
function breaks(totals: number[]): number[] {
  const sorted = totals.filter((n) => n > 0).sort((a, b) => a - b);
  if (sorted.length === 0) return [];
  const at = (q: number) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
  return [...new Set([0.2, 0.4, 0.6, 0.8].map(at))];
}

function legendLabels(cuts: number[]): string[] {
  return [
    `até ${number(cuts[0] - 1)}`,
    ...cuts.slice(0, -1).map((c, i) => `${number(c)} a ${number(cuts[i + 1] - 1)}`),
    `${number(cuts[cuts.length - 1])} ou mais`,
  ];
}

type Hover = { ibge: number; longitude: number; latitude: number };

interface SamuChoroplethMapProps {
  cities: SamuCityRow[];
  selectedIbge: number;
  onSelect: (ibge: number) => void;
}

export function SamuChoroplethMap({ cities, selectedIbge, onSelect }: SamuChoroplethMapProps) {
  const { data: municipalities } = useQuery(municipalitiesQuery);
  const [hover, setHover] = useState<Hover | null>(null);

  const cuts = useMemo(() => breaks(cities.map((c) => c.total)), [cities]);
  const total = useMemo(() => cities.reduce((sum, c) => sum + c.total, 0), [cities]);

  const geoJson = useMemo(() => {
    if (!municipalities) return null;
    const byIbge = new Map(cities.map((c, i) => [c.ibge, { ...c, rank: i + 1 }]));
    return {
      type: "FeatureCollection" as const,
      features: municipalities.features.map((f) => {
        const ibge = Number(f.properties.id);
        return { ...f, properties: { ibge, name: f.properties.name, calls: byIbge.get(ibge)?.total ?? 0 } };
      }),
    };
  }, [municipalities, cities]);

  const bounds = useMemo((): [[number, number], [number, number]] | undefined => {
    if (!geoJson) return undefined;
    const withCalls = geoJson.features.filter((f) => f.properties.calls > 0 && f.properties.ibge !== FERNANDO_DE_NORONHA);
    const coords: number[][] = [];
    const walk = (c: unknown): void => {
      if (Array.isArray(c) && typeof c[0] === "number") coords.push(c as number[]);
      else if (Array.isArray(c)) c.forEach(walk);
    };
    for (const f of withCalls) if ("coordinates" in f.geometry) walk(f.geometry.coordinates);
    if (coords.length === 0) return undefined;
    return [
      [Math.min(...coords.map((c) => c[0])), Math.min(...coords.map((c) => c[1]))],
      [Math.max(...coords.map((c) => c[0])), Math.max(...coords.map((c) => c[1]))],
    ];
  }, [geoJson]);

  if (!geoJson || !bounds) {
    return <div className="h-[420px] md:h-[520px] rounded-xl border border-gray-200 bg-gray-50" />;
  }

  const fill: LayerProps = {
    id: "samu-fill",
    type: "fill",
    paint: {
      "fill-color": [
        "case",
        ["==", ["get", "calls"], 0],
        NO_CALLS,
        ["step", ["get", "calls"], RAMP[0], ...cuts.flatMap((c, i) => [c, RAMP[i + 1]])],
      ],
      "fill-opacity": 0.9,
    },
  };
  const borders: LayerProps = {
    id: "samu-borders",
    type: "line",
    paint: { "line-color": "#ffffff", "line-width": 0.8 },
  };
  const selected: LayerProps = {
    id: "samu-selected",
    type: "line",
    filter: ["==", ["get", "ibge"], selectedIbge],
    paint: { "line-color": "#111827", "line-width": 2.5 },
  };
  // The biggest municipalities win when names collide; the rest show up as you zoom in.
  const names: LayerProps = {
    id: "samu-names",
    type: "symbol",
    filter: [">", ["get", "calls"], 0],
    layout: {
      "text-field": ["get", "name"],
      "text-size": 11,
      "symbol-sort-key": ["-", 0, ["get", "calls"]],
    },
    paint: { "text-color": "#111827", "text-halo-color": "#ffffff", "text-halo-width": 1.5 },
  };

  const hovered = hover ? cities.findIndex((c) => c.ibge === hover.ibge) : -1;
  const hoveredCity = hovered >= 0 ? cities[hovered] : null;

  const onMove = (e: MapLayerMouseEvent) => {
    const ibge = e.features?.[0]?.properties?.ibge;
    if (typeof ibge === "number" && cities.some((c) => c.ibge === ibge)) {
      setHover({ ibge, longitude: e.lngLat.lng, latitude: e.lngLat.lat });
    } else {
      setHover(null);
    }
  };

  const onClick = (e: MapLayerMouseEvent) => {
    const ibge = e.features?.[0]?.properties?.ibge;
    if (typeof ibge === "number" && cities.some((c) => c.ibge === ibge)) onSelect(ibge);
  };

  return (
    <div>
      <div className="h-[420px] md:h-[520px] overflow-hidden rounded-xl border border-gray-200">
        <ReactMapGL
          initialViewState={{ longitude: -35.9, latitude: -8.1, zoom: 7 }}
          // Fit once the map knows the size of its box; fitting before that frames the wrong area.
          onLoad={(e) => {
            e.target.resize();
            e.target.fitBounds(bounds, { padding: 24, duration: 0 });
          }}
          mapStyle={MAPSTYLE}
          interactiveLayerIds={["samu-fill"]}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
          onClick={onClick}
          cursor={hoveredCity ? "pointer" : undefined}
          style={{ width: "100%", height: "100%" }}
        >
          <NavigationControl position="top-right" showCompass={false} />
          <Source id="samu-data" type="geojson" data={geoJson}>
            <Layer {...fill} />
            <Layer {...borders} />
            <Layer {...selected} />
            <Layer {...names} />
          </Source>
          {hover && hoveredCity && (
            <Popup
              longitude={hover.longitude}
              latitude={hover.latitude}
              closeButton={false}
              closeOnClick={false}
              offset={12}
            >
              <div className="text-sm">
                <div className="font-medium">{hoveredCity.name}</div>
                <div className="tabular-nums text-gray-600">{number(hoveredCity.total)} chamados</div>
                <div className="text-xs text-gray-500">
                  {hovered + 1}º de {cities.length} · {((hoveredCity.total / total) * 100).toFixed(1).replace(".", ",")}% do total
                </div>
              </div>
            </Popup>
          )}
        </ReactMapGL>
      </div>

      {cuts.length === RAMP.length - 1 && (
        <ul className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-600">
          {legendLabels(cuts).map((label, i) => (
            <li key={label} className="flex items-center gap-1.5">
              <span className="h-3 w-5 rounded-sm" style={{ backgroundColor: RAMP[i] }} />
              {label}
            </li>
          ))}
          <li className="flex items-center gap-1.5">
            <span className="h-3 w-5 rounded-sm border border-gray-200" style={{ backgroundColor: NO_CALLS }} />
            sem chamados
          </li>
        </ul>
      )}
    </div>
  );
}
