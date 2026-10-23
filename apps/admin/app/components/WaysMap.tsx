import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

import { isWayStatus, STATUS } from "~/lib/infra";
import type { MapWay } from "~/queries/infra";

// Same basemap as apps/web.
const STYLE = "https://tiles.openfreemap.org/styles/positron";
const NO_STATUS = "#6b7280";

// Ways coloured by execution status. maplibre-gl needs the browser, so it is
// imported inside the effect and the server render only emits the container.
export function WaysMap({ ways, className }: { ways: MapWay[]; className?: string }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = container.current;
    if (!el || ways.length === 0) return;

    let cancelled = false;
    let map: import("maplibre-gl").Map | undefined;
    const observer = new ResizeObserver(() => map?.resize());
    observer.observe(el);

    void import("maplibre-gl").then(({ Map: MapLibreMap, NavigationControl, Popup, LngLatBounds }) => {
      if (cancelled) return;

      const features = ways.map((w) => ({
        type: "Feature" as const,
        geometry: JSON.parse(w.geometry),
        properties: {
          name: w.name ?? "Sem nome",
          status: isWayStatus(w.status) ? STATUS[w.status].label : "Sem status",
          color: isWayStatus(w.status) ? STATUS[w.status].color : NO_STATUS,
        },
      }));

      const bounds = new LngLatBounds();
      const extend = (coords: unknown): void => {
        if (!Array.isArray(coords)) return;
        if (typeof coords[0] === "number" && typeof coords[1] === "number") bounds.extend([coords[0], coords[1]]);
        else coords.forEach(extend);
      };
      for (const f of features) extend(f.geometry.coordinates);

      map = new MapLibreMap({ container: el, style: STYLE, bounds, fitBoundsOptions: { padding: 48, maxZoom: 16 } });
      map.addControl(new NavigationControl({ showCompass: false }), "top-right");

      map.on("load", () => {
        if (!map) return;
        map.addSource("ways", { type: "geojson", data: { type: "FeatureCollection", features } });
        map.addLayer({
          id: "ways",
          type: "line",
          source: "ways",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": ["get", "color"], "line-width": 4 },
        });

        const popup = new Popup({ closeButton: false, closeOnClick: false });
        map.on("mousemove", "ways", (e) => {
          const props = e.features?.[0]?.properties;
          if (!map || !props) return;
          map.getCanvas().style.cursor = "pointer";
          popup.setLngLat(e.lngLat).setText(`${props.name} · ${props.status}`).addTo(map);
        });
        map.on("mouseleave", "ways", () => {
          if (map) map.getCanvas().style.cursor = "";
          popup.remove();
        });
      });
    });

    return () => {
      cancelled = true;
      observer.disconnect();
      map?.remove();
    };
  }, [ways]);

  return <div ref={container} className={className ?? "h-96 w-full rounded-md border"} />;
}

export function StatusLegend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {Object.values(STATUS).map((s) => (
        <li key={s.label} className="flex items-center gap-1.5" title={s.hint}>
          <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} />
          {s.label}
        </li>
      ))}
    </ul>
  );
}
