import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

// Same basemap as the rest of the Ameciclo sites.
const STYLE = "https://tiles.openfreemap.org/styles/positron";

// A segment's lines over the map. `geometry` is the GeoJSON text of its
// MultiLineString. maplibre-gl needs the browser, so it is imported inside the
// effect and the server render only emits the container.
export function SegmentPreviewMap({ geometry, color = "#2563eb", className }: { geometry: string; color?: string; className?: string }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = container.current;
    if (!el) return;

    let cancelled = false;
    let map: import("maplibre-gl").Map | undefined;
    const observer = new ResizeObserver(() => map?.resize());
    observer.observe(el);

    void import("maplibre-gl").then(({ Map: MapLibreMap, NavigationControl, LngLatBounds }) => {
      if (cancelled) return;
      const shape: { coordinates: number[][][] } = JSON.parse(geometry);

      const bounds = new LngLatBounds();
      for (const line of shape.coordinates) {
        for (const [lon, lat] of line) if (lon !== undefined && lat !== undefined) bounds.extend([lon, lat]);
      }

      map = new MapLibreMap({ container: el, style: STYLE, bounds, fitBoundsOptions: { padding: 40, maxZoom: 17 } });
      map.addControl(new NavigationControl({ showCompass: false }), "top-right");
      map.on("load", () => {
        if (!map) return;
        map.addSource("segment", { type: "geojson", data: { type: "Feature", properties: {}, geometry: JSON.parse(geometry) } });
        map.addLayer({
          id: "segment",
          type: "line",
          source: "segment",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": color, "line-width": 5 },
        });
      });
    });

    return () => {
      cancelled = true;
      observer.disconnect();
      map?.remove();
    };
  }, [geometry, color]);

  return <div ref={container} className={className ?? "h-72 w-full rounded-md border"} />;
}
