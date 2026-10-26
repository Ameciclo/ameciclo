import { useEffect, useMemo, useRef } from "react";
import type { ExpressionSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { boundsOf, linePositions, type LineGeometry } from "~/lib/public/geometry";

// Same basemap as apps/web.
const STYLE = "https://tiles.openfreemap.org/styles/positron";

export type MapSegment = { id: string; name: string; type: string; geometry: LineGeometry | null };

const TYPE_COLORS = ["match", ["get", "type"], "Ciclovia", "#3b82f6", "Ciclofaixa", "#8b5cf6", "Ciclorrota", "#10b981", "Compartilhada", "#ef4444", "#6b7280"] satisfies ExpressionSpecification;

// Cycling segments coloured by typology. maplibre-gl needs the browser, so it is
// imported inside the effect and the server render only emits the container.
// Pass a stable `segments` array (it rebuilds the map when it changes).
export function SegmentsMap({ segments, className, lineWidth = 3 }: { segments: MapSegment[]; className?: string; lineWidth?: number }) {
  const container = useRef<HTMLDivElement>(null);
  const drawable = useMemo(() => segments.filter((segment) => segment.geometry !== null), [segments]);

  useEffect(() => {
    const el = container.current;
    if (!el || drawable.length === 0) return;

    let cancelled = false;
    let map: import("maplibre-gl").Map | undefined;
    const observer = new ResizeObserver(() => map?.resize());
    observer.observe(el);

    void import("maplibre-gl").then(({ Map: MapLibreMap, NavigationControl, Popup }) => {
      if (cancelled) return;

      const bounds = boundsOf(
        drawable.flatMap((segment) => linePositions(segment.geometry)),
        0.003,
      );
      map = new MapLibreMap({
        container: el,
        style: STYLE,
        bounds: bounds ?? undefined,
        fitBoundsOptions: { padding: 42, maxZoom: 17 },
        scrollZoom: false,
      });
      map.addControl(new NavigationControl({ showCompass: false }), "top-right");

      map.on("load", () => {
        if (!map) return;
        map.addSource("segments", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: drawable.map((segment) => ({
              type: "Feature",
              geometry: segment.geometry ?? { type: "LineString", coordinates: [] },
              properties: { id: segment.id, name: segment.name, type: segment.type },
            })),
          },
        });
        map.addLayer({
          id: "segments",
          type: "line",
          source: "segments",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": TYPE_COLORS, "line-width": lineWidth },
        });

        const popup = new Popup({ closeButton: false, closeOnClick: false });
        map.on("mousemove", "segments", (event) => {
          const props = event.features?.[0]?.properties;
          if (!map || !props) return;
          map.getCanvas().style.cursor = "pointer";
          popup.setLngLat(event.lngLat).setText(`${props.name} · ${props.type}`).addTo(map);
        });
        map.on("mouseleave", "segments", () => {
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
  }, [drawable, lineWidth]);

  if (drawable.length === 0)
    return (
      <div className={`flex items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500 ${className ?? ""}`}>
        <div>
          <p className="text-base font-semibold">Geometria indisponível</p>
          <p className="mt-1 text-sm">Não há coordenadas válidas para exibir no mapa.</p>
        </div>
      </div>
    );

  return <div ref={container} className={className ?? "h-96 w-full"} />;
}
