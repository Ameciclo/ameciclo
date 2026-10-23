import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

// Same basemap as apps/web.
const STYLE = "https://tiles.openfreemap.org/styles/positron";

export type MapPoint = { id: number; name: string; latitude: number; longitude: number; n: number };

// Interview points as circles sized by how many interviews each held.
// maplibre-gl needs the browser (window, WebGL), so it is imported inside the
// effect and the server render only emits the empty container.
export function PointsMap({ points, className }: { points: MapPoint[]; className?: string }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = container.current;
    if (!el || points.length === 0) return;

    let cancelled = false;
    let map: import("maplibre-gl").Map | undefined;
    // The canvas is sized when the map starts; keep it in step with the container
    // (layout can still be settling then).
    const observer = new ResizeObserver(() => map?.resize());
    observer.observe(el);

    void import("maplibre-gl").then(({ Map: MapLibreMap, NavigationControl, Popup, LngLatBounds }) => {
      if (cancelled) return;

      const max = Math.max(...points.map((p) => p.n), 1);
      const bounds = new LngLatBounds();
      for (const p of points) bounds.extend([p.longitude, p.latitude]);

      map = new MapLibreMap({ container: el, style: STYLE, bounds, fitBoundsOptions: { padding: 56, maxZoom: 14 } });
      map.addControl(new NavigationControl({ showCompass: false }), "top-right");

      map.on("load", () => {
        if (!map) return;
        map.addSource("points", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: points.map((p) => ({
              type: "Feature",
              geometry: { type: "Point", coordinates: [p.longitude, p.latitude] },
              properties: { name: p.name, n: p.n, radius: 6 + 16 * Math.sqrt(p.n / max) },
            })),
          },
        });
        map.addLayer({
          id: "points",
          type: "circle",
          source: "points",
          paint: {
            "circle-radius": ["get", "radius"],
            "circle-color": "#ea580c",
            "circle-opacity": 0.75,
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 1.5,
          },
        });
      });

      map.on("click", "points", (e) => {
        const feature = e.features?.[0];
        if (!feature || !map || feature.geometry.type !== "Point") return;
        // Built with DOM nodes, not HTML, because the name comes from a spreadsheet.
        const box = document.createElement("div");
        const title = document.createElement("strong");
        title.textContent = String(feature.properties.name);
        const count = document.createElement("div");
        count.textContent = `${Number(feature.properties.n).toLocaleString("pt-BR")} entrevistas`;
        box.append(title, count);
        const [lng, lat] = feature.geometry.coordinates as [number, number];
        new Popup({ offset: 12 }).setLngLat([lng, lat]).setDOMContent(box).addTo(map);
      });
      map.on("mouseenter", "points", () => {
        if (map) map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "points", () => {
        if (map) map.getCanvas().style.cursor = "";
      });
    });

    return () => {
      cancelled = true;
      observer.disconnect();
      map?.remove();
    };
  }, [points]);

  return <div ref={container} className={className} />;
}
