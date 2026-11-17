"use client";
// The RMR map of the observatory. Two readings of the same data: every way painted by what became of
// it ("Trechos") and each municipality painted by how much of its PDC was built ("Cobertura"). Hovering a
// municipality shows its numbers; clicking selects it in the explorer.
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
import type { CyclingCityStats } from "@ameciclo/db/cycling-read";
import { km, percent } from "./status";

const MAPSTYLE = "https://tiles.openfreemap.org/styles/positron";

type Municipalities = {
  features: { type: "Feature"; properties: { id: string; name: string }; geometry: GeoJSON.Geometry }[];
};

// The 14 municipalities of the RMR, simplified in PostGIS (about 50 kB).
const municipalitiesQuery = {
  queryKey: ["geojson", "rmr-municipios"],
  queryFn: async (): Promise<Municipalities> => (await fetch("/data/rmr-municipios.geojson")).json(),
  staleTime: Infinity,
};

// Share of the PDC built, in classes people can say out loud. Municipalities with nothing built stay grey.
const RAMP = ["#cfe9e6", "#8fd0c8", "#3fa79c", "#00695f"];
const NOTHING_BUILT = "#eceff1";
const COVERAGE_LEGEND = ["até 10%", "10 a 20%", "20 a 30%", "30% ou mais"];

// How each way is drawn, by status. Executed lines are teal, as on the old page; outside the PDC is amber
// (the old yellow disappears on the light base map).
const WAY_LAYERS = [
  { status: "pdc_nao_realizado", label: "Não implantado no PDC", color: "#e02f31", width: 1.6, opacity: 0.5 },
  { status: "pdc_realizado_nao_designado", label: "Implantado no PDC, outra tipologia", color: "#2aa89b", width: 3, opacity: 1 },
  { status: "pdc_realizado_designado", label: "Implantado no PDC, como previsto", color: "#00695f", width: 3, opacity: 1 },
  { status: "realizado_fora_pdc", label: "Fora do PDC", color: "#d99a00", width: 1.8, opacity: 0.9 },
] as const;

const MODES = [
  { id: "trechos", label: "Trechos" },
  { id: "cobertura", label: "Cobertura por município" },
] as const;
type Mode = (typeof MODES)[number]["id"];

type Hover = { ibge: number; longitude: number; latitude: number };

interface ExecucaoMapProps {
  cities: CyclingCityStats[];
  ways: GeoJSON.FeatureCollection<GeoJSON.Geometry> | undefined;
  selectedIbge: number;
  onSelect: (ibge: number) => void;
}

export function ExecucaoMap({ cities, ways, selectedIbge, onSelect }: ExecucaoMapProps) {
  const { data: municipalities } = useQuery(municipalitiesQuery);
  const [mode, setMode] = useState<Mode>("trechos");
  const [hidden, setHidden] = useState<string[]>([]);
  const [hover, setHover] = useState<Hover | null>(null);

  const geoJson = useMemo(() => {
    if (!municipalities) return null;
    const byIbge = new Map(cities.map((c) => [c.ibge, c]));
    return {
      type: "FeatureCollection" as const,
      features: municipalities.features.flatMap((f) => {
        const ibge = Number(f.properties.id);
        const city = byIbge.get(ibge);
        if (!city) return [];
        return [
          {
            ...f,
            properties: {
              ibge,
              name: city.name,
              percent: city.percent,
              executedKm: city.executedInPdcKm,
              plannedKm: city.plannedKm,
            },
          },
        ];
      }),
    };
  }, [municipalities, cities]);

  if (!geoJson) {
    return <div className="h-[460px] rounded-xl border border-gray-200 bg-gray-50 lg:h-[640px]" />;
  }

  const coverage = mode === "cobertura";

  const fill: LayerProps = {
    id: "exec-fill",
    type: "fill",
    paint: coverage
      ? {
          "fill-color": [
            "case",
            ["<", ["get", "executedKm"], 0.05],
            NOTHING_BUILT,
            ["step", ["get", "percent"], RAMP[0], 10, RAMP[1], 20, RAMP[2], 30, RAMP[3]],
          ],
          "fill-opacity": 0.9,
        }
      : // Invisible, but still there to be hovered and clicked.
        { "fill-color": "#000000", "fill-opacity": 0.01 },
  };
  const borders: LayerProps = {
    id: "exec-borders",
    type: "line",
    paint: { "line-color": coverage ? "#ffffff" : "#9aa5ab", "line-width": coverage ? 1 : 0.8 },
  };
  const selected: LayerProps = {
    id: "exec-selected",
    type: "line",
    filter: ["==", ["get", "ibge"], selectedIbge],
    paint: { "line-color": "#111827", "line-width": 2.4 },
  };
  const names: LayerProps = {
    id: "exec-names",
    type: "symbol",
    // The base map's own font: without it MapLibre asks for one the server does not have (404).
    layout: { "text-field": ["get", "name"], "text-font": ["Noto Sans Regular"], "text-size": 11, "symbol-sort-key": ["-", 0, ["get", "plannedKm"]] },
    paint: { "text-color": "#111827", "text-halo-color": "#ffffff", "text-halo-width": 1.5 },
  };

  const hoveredCity = hover ? cities.find((c) => c.ibge === hover.ibge) : undefined;
  const ibgeOf = (e: MapLayerMouseEvent) => {
    const ibge = e.features?.[0]?.properties?.ibge;
    return typeof ibge === "number" && cities.some((c) => c.ibge === ibge) ? ibge : undefined;
  };

  const ranked = [...cities].sort((a, b) => b.percent - a.percent);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="h-[460px] overflow-hidden rounded-xl border border-gray-200 lg:h-[640px]">
        <ReactMapGL
          initialViewState={{ longitude: -35.04, latitude: -8.15, zoom: 8.6 }}
          // Fit once the map knows the size of its box; fitting before that frames the wrong area.
          onLoad={(e) => {
            e.target.resize();
            e.target.fitBounds(
              [
                [-35.27, -8.62],
                [-34.81, -7.68],
              ],
              { padding: 12, duration: 0 },
            );
          }}
          mapStyle={MAPSTYLE}
          // The wheel scrolls the page; zooming the map takes Ctrl and the wheel (or two fingers on a phone).
          cooperativeGestures
          interactiveLayerIds={["exec-fill"]}
          onMouseMove={(e) => {
            const ibge = ibgeOf(e);
            setHover(ibge === undefined ? null : { ibge, longitude: e.lngLat.lng, latitude: e.lngLat.lat });
          }}
          onMouseLeave={() => setHover(null)}
          onClick={(e) => {
            const ibge = ibgeOf(e);
            if (ibge !== undefined) onSelect(ibge);
          }}
          cursor={hoveredCity ? "pointer" : undefined}
          style={{ width: "100%", height: "100%" }}
        >
          <NavigationControl position="top-right" showCompass={false} />
          <Source id="exec-municipalities" type="geojson" data={geoJson}>
            <Layer {...fill} />
            <Layer {...borders} />
          </Source>
          {!coverage && ways && (
            <Source id="exec-ways" type="geojson" data={ways}>
              {WAY_LAYERS.map((w) => (
                <Layer
                  key={w.status}
                  id={`exec-way-${w.status}`}
                  type="line"
                  filter={["==", ["get", "status_type"], w.status]}
                  layout={{ visibility: hidden.includes(w.status) ? "none" : "visible", "line-cap": "round", "line-join": "round" }}
                  paint={{ "line-color": w.color, "line-width": w.width, "line-opacity": w.opacity }}
                />
              ))}
            </Source>
          )}
          <Source id="exec-labels" type="geojson" data={geoJson}>
            <Layer {...selected} />
            <Layer {...names} />
          </Source>
          {hover && hoveredCity && (
            <Popup longitude={hover.longitude} latitude={hover.latitude} closeButton={false} closeOnClick={false} offset={12}>
              <div className="text-sm">
                <div className="font-medium">{hoveredCity.name}</div>
                <div className="tabular-nums text-gray-700">{percent(hoveredCity.percent)} do PDC implantado</div>
                <div className="text-xs tabular-nums text-gray-500">
                  {km(hoveredCity.executedInPdcKm)} de {km(hoveredCity.plannedKm)}
                </div>
                <div className="text-xs tabular-nums text-gray-500">{km(hoveredCity.existingKm)} de estrutura existente</div>
              </div>
            </Popup>
          )}
        </ReactMapGL>
      </div>

      <aside className="flex min-w-0 flex-col gap-5">
        <div>
          <div role="group" aria-label="O que o mapa mostra" className="flex flex-wrap gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={mode === m.id}
                onClick={() => setMode(m.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  mode === m.id ? "bg-ameciclo text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {coverage ? (
            <ul className="mt-3 space-y-1.5 text-xs text-gray-600">
              <li className="flex items-center gap-2">
                <span className="h-3 w-5 rounded-sm border border-gray-200" style={{ backgroundColor: NOTHING_BUILT }} />
                nada do PDC implantado
              </li>
              {COVERAGE_LEGEND.map((label, i) => (
                <li key={label} className="flex items-center gap-2">
                  <span className="h-3 w-5 rounded-sm" style={{ backgroundColor: RAMP[i] }} />
                  {label}
                </li>
              ))}
            </ul>
          ) : (
            <ul className="mt-3 space-y-1.5 text-xs text-gray-700">
              {WAY_LAYERS.map((w) => (
                <li key={w.status}>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!hidden.includes(w.status)}
                      onChange={() =>
                        setHidden((prev) => (prev.includes(w.status) ? prev.filter((s) => s !== w.status) : [...prev, w.status]))
                      }
                      className="accent-ameciclo"
                    />
                    <span className="w-5 shrink-0 rounded-full" style={{ backgroundColor: w.color, opacity: w.opacity, height: Math.max(2, w.width) }} />
                    {w.label}
                  </label>
                </li>
              ))}
              {!ways && <li className="text-gray-500">Carregando os trechos…</li>}
            </ul>
          )}
        </div>

        <div className="min-h-0">
          <h3 className="text-xs uppercase tracking-wide text-gray-500">Do PDC implantado, por município</h3>
          <ol className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white text-sm">
            {ranked.map((c) => (
              <li key={c.ibge}>
                <button
                  type="button"
                  onClick={() => onSelect(c.ibge)}
                  aria-current={c.ibge === selectedIbge ? "true" : undefined}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left transition-colors hover:bg-gray-50 ${
                    c.ibge === selectedIbge ? "font-semibold text-ameciclo" : "text-gray-800"
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  <span className="shrink-0 tabular-nums">{percent(c.percent)}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}
