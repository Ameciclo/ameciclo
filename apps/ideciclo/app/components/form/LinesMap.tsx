import { useEffect, useRef } from "react";
import type { GeoJSONSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { boundsOf, lineCoordinates } from "~/lib/ideciclo/geometry";
import type { LineGeometry } from "~/lib/ideciclo/segment-technical";

// Same basemap as the other Ameciclo apps; no token needed.
const STYLE = "https://tiles.openfreemap.org/styles/positron";

export type MapLine = {
  id: string;
  geometry: LineGeometry;
  color: string;
  // Drawn thinner and fainter, e.g. a segment still waiting for its evaluation.
  muted?: boolean;
};

type Props = {
  lines: MapLine[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  // The map re-fits its view when this changes (not on every selection).
  fitKey: string;
  className?: string;
};

// Lines coloured per feature. maplibre-gl needs the browser, so it is imported
// in the effect and the server render only emits the container. The map lives
// in a ref: one effect creates it, one keeps its data in step with the props.
export function LinesMap({ lines, selectedId = null, onSelect, fitKey, className }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);
  const latest = useRef({ lines, selectedId, fitKey, onSelect });
  latest.current = { lines, selectedId, fitKey, onSelect };
  const fittedKey = useRef<string | null>(null);

  const features = () =>
    latest.current.lines.map((line) => ({
      type: "Feature" as const,
      geometry: line.geometry,
      properties: {
        id: line.id,
        color: line.color,
        width: line.muted ? 3 : 4,
        opacity: line.muted ? 0.5 : 0.9,
        selected: line.id === latest.current.selectedId,
      },
    }));

  const sync = (map: import("maplibre-gl").Map) => {
    map.getSource<GeoJSONSource>("lines")?.setData({ type: "FeatureCollection", features: features() });

    if (fittedKey.current !== latest.current.fitKey) {
      fittedKey.current = latest.current.fitKey;
      const bounds = boundsOf(latest.current.lines.flatMap((line) => lineCoordinates(line.geometry)));
      if (bounds) map.fitBounds(bounds, { padding: 48, maxZoom: 16, duration: 0 });
    }
  };

  useEffect(() => {
    const el = container.current;
    if (!el) return;

    let cancelled = false;
    const observer = new ResizeObserver(() => mapRef.current?.resize());
    observer.observe(el);

    void import("maplibre-gl").then(({ Map: MapLibreMap, NavigationControl }) => {
      if (cancelled) return;
      const map = new MapLibreMap({ container: el, style: STYLE, center: [-34.88, -8.05], zoom: 11 });
      mapRef.current = map;
      map.addControl(new NavigationControl({ showCompass: false }), "top-right");

      map.on("load", () => {
        map.addSource("lines", { type: "geojson", data: { type: "FeatureCollection", features: features() } });
        map.addLayer({
          id: "lines-selected",
          type: "line",
          source: "lines",
          filter: ["==", ["get", "selected"], true],
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#0f172a", "line-width": 8 },
        });
        map.addLayer({
          id: "lines",
          type: "line",
          source: "lines",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": ["get", "color"], "line-width": ["get", "width"], "line-opacity": ["get", "opacity"] },
        });
        map.on("click", "lines", (event) => {
          const id = event.features?.[0]?.properties?.id;
          if (typeof id === "string") latest.current.onSelect?.(id);
        });
        map.on("mouseenter", "lines", () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", "lines", () => (map.getCanvas().style.cursor = ""));
        sync(map);
      });
    });

    return () => {
      cancelled = true;
      observer.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      fittedKey.current = null;
    };
    // The map is created once; `sync` below keeps it current.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (map?.isStyleLoaded()) sync(map);
  });

  return <div ref={container} className={className ?? "h-80 w-full rounded-md border"} />;
}
