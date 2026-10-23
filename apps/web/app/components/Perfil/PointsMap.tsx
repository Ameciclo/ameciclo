// Where the interviews were held: one circle per street corner.
import { useState } from "react";
import Map, { Layer, NavigationControl, Popup, Source, type LayerProps, type MapLayerMouseEvent } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { PerfilPoint } from "@ameciclo/db/shared";

const MAPSTYLE = "https://tiles.openfreemap.org/styles/positron";

const circles: LayerProps = {
  id: "perfil-points",
  type: "circle",
  paint: {
    "circle-radius": ["interpolate", ["linear"], ["get", "n"], 10, 6, 60, 20],
    "circle-color": ["interpolate", ["linear"], ["get", "share"], 0.05, "#fde2f0", 0.35, "#be185d"],
    "circle-opacity": 0.85,
    "circle-stroke-width": 1,
    "circle-stroke-color": "#ffffff",
  },
};

type Hover = { name: string; n: number; share: number; longitude: number; latitude: number };

export default function PointsMap({ points }: { points: PerfilPoint[] }) {
  const [hover, setHover] = useState<Hover | null>(null);

  const lngs = points.map((p) => p.longitude);
  const lats = points.map((p) => p.latitude);
  const bounds: [[number, number], [number, number]] = [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
  const data: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: points.map((p) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [p.longitude, p.latitude] },
      properties: { name: p.name, n: p.n, share: p.women / p.n },
    })),
  };

  const onMove = (e: MapLayerMouseEvent) => {
    const f = e.features?.[0];
    if (!f || f.geometry.type !== "Point") return setHover(null);
    const [longitude, latitude] = f.geometry.coordinates;
    setHover({ name: String(f.properties.name), n: Number(f.properties.n), share: Number(f.properties.share), longitude, latitude });
  };

  return (
    <Map
      initialViewState={{ bounds, fitBoundsOptions: { padding: 48 } }}
      mapStyle={MAPSTYLE}
      interactiveLayerIds={["perfil-points"]}
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
      cursor={hover ? "pointer" : undefined}
      style={{ width: "100%", height: "100%" }}
    >
      <NavigationControl position="top-right" showCompass={false} />
      <Source id="perfil-points" type="geojson" data={data}>
        <Layer {...circles} />
      </Source>
      {hover && (
        <Popup longitude={hover.longitude} latitude={hover.latitude} closeButton={false} offset={14}>
          <div className="text-sm">
            <div className="font-medium">{hover.name}</div>
            <div className="tabular-nums text-gray-600">
              {hover.n} entrevistas · {Math.round(hover.share * 100)}% mulheres
            </div>
          </div>
        </Popup>
      )}
    </Map>
  );
}
