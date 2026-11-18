"use client";
// As vias com mais chamados do SAMU no Recife. Passar o mouse mostra os números; clicar escolhe a via no explorador.
import "~/lib/maplibre-worker";
import { useMemo, useState } from "react";
import ReactMapGL, { Layer, NavigationControl, Popup, Source, type LayerProps, type MapLayerMouseEvent } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { UnsafeStreet } from "@ameciclo/db";
import { viaSlug } from "~/queries/dados.vias-inseguras";
import { MAP_STYLE } from "../Observatorio/map";
import { km, n, perKm } from "./labels";

const HOT = "#bd0026";
const WARM = "#f03b20";
const MILD = "#fd8d3c";

type Geometry = { type: "MultiLineString"; coordinates: number[][][] };
type Hover = { key: string; longitude: number; latitude: number };

interface Props {
  streets: UnsafeStreet[];
  geometries: Record<string, Geometry>;
  selectedKey: string | undefined;
  onSelect: (slug: string) => void;
  // Uma via só: sem popup e sem clique.
  single?: boolean;
}

export function ViasMap({ streets, geometries, selectedKey, onSelect, single = false }: Props) {
  const [hover, setHover] = useState<Hover | null>(null);
  const byKey = useMemo(() => new Map(streets.map((s) => [s.key, s])), [streets]);

  const geoJson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: streets.flatMap((s) => {
        const geometry = geometries[s.key];
        return geometry ? [{ type: "Feature" as const, geometry, properties: { key: s.key, rank: s.rank, calls: s.calls } }] : [];
      }),
    }),
    [streets, geometries],
  );

  const bounds = useMemo((): [[number, number], [number, number]] | undefined => {
    const lons: number[] = [];
    const lats: number[] = [];
    for (const f of geoJson.features) for (const line of f.geometry.coordinates) for (const [lon, lat] of line) { lons.push(lon); lats.push(lat); }
    if (lons.length === 0) return undefined;
    return [[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]];
  }, [geoJson]);

  if (!bounds) return <div className="h-[420px] rounded-xl border border-gray-200 bg-gray-50 md:h-[520px]" />;

  const lines: LayerProps = {
    id: "vias-lines",
    type: "line",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": single ? HOT : ["step", ["get", "rank"], HOT, 11, WARM, 26, MILD],
      "line-width": single ? 4 : ["step", ["get", "rank"], 5, 11, 4, 26, 3],
      "line-opacity": 0.9,
    },
  };
  const selected: LayerProps = {
    id: "vias-selected",
    type: "line",
    filter: ["==", ["get", "key"], selectedKey ?? ""],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": "#111827", "line-width": 7, "line-opacity": 0.45 },
  };

  const hovered = hover ? byKey.get(hover.key) : undefined;
  const keyOf = (e: MapLayerMouseEvent) => {
    const key = e.features?.[0]?.properties?.key;
    return typeof key === "string" && byKey.has(key) ? key : undefined;
  };

  return (
    <div>
      <div className={`${single ? "h-[320px]" : "h-[420px] md:h-[520px]"} overflow-hidden rounded-xl border border-gray-200`}>
        <ReactMapGL
          initialViewState={{ longitude: -34.9, latitude: -8.05, zoom: 11 }}
          onLoad={(e) => {
            e.target.resize();
            e.target.fitBounds(bounds, { padding: 32, duration: 0 });
          }}
          mapStyle={MAP_STYLE}
          interactiveLayerIds={single ? [] : ["vias-lines"]}
          onMouseMove={(e) => {
            const key = single ? undefined : keyOf(e);
            setHover(key ? { key, longitude: e.lngLat.lng, latitude: e.lngLat.lat } : null);
          }}
          onMouseLeave={() => setHover(null)}
          onClick={(e) => {
            const key = single ? undefined : keyOf(e);
            const street = key ? byKey.get(key) : undefined;
            if (street) onSelect(viaSlug(street.name));
          }}
          cursor={hovered ? "pointer" : undefined}
          style={{ width: "100%", height: "100%" }}
        >
          <NavigationControl position="top-right" showCompass={false} />
          <Source id="vias-data" type="geojson" data={geoJson}>
            <Layer {...selected} />
            <Layer {...lines} />
          </Source>
          {hover && hovered && (
            <Popup longitude={hover.longitude} latitude={hover.latitude} closeButton={false} closeOnClick={false} offset={12}>
              <div className="text-sm">
                <div className="font-medium">{hovered.name}</div>
                <div className="tabular-nums text-gray-600">{n(hovered.calls)} chamados</div>
                <div className="text-xs text-gray-500">
                  {hovered.rank}º no ranking{hovered.lengthKm !== null && ` · ${km(hovered.lengthKm)} km · ${perKm(hovered.callsPerKm)} por km`}
                </div>
              </div>
            </Popup>
          )}
        </ReactMapGL>
      </div>
      {!single && (
        <ul className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-600">
          {[[HOT, "1ª a 10ª"], [WARM, "11ª a 25ª"], [MILD, "26ª em diante"]].map(([color, label]) => (
            <li key={label} className="flex items-center gap-1.5">
              <span className="h-1.5 w-5 rounded-full" style={{ backgroundColor: color }} />
              {label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
