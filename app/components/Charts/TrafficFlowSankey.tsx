import { useState, useMemo } from "react";

interface TrafficFlowSankeyProps {
  data: Record<string, number>;
}

const DIRECTION_LABELS: Record<string, string> = {
  north_south: "Norte → Sul",
  north_east: "Norte → Leste",
  north_west: "Norte → Oeste",
  south_north: "Sul → Norte",
  south_east: "Sul → Leste",
  south_west: "Sul → Oeste",
  east_north: "Leste → Norte",
  east_south: "Leste → Sul",
  east_west: "Leste → Oeste",
  west_north: "Oeste → Norte",
  west_south: "Oeste → Sul",
  west_east: "Oeste → Leste",
};

type Cardinal = "norte" | "sul" | "leste" | "oeste";

const CARDINAL_MAP: Record<string, Cardinal> = {
  north_south: "norte", north_east: "norte", north_west: "norte",
  south_north: "sul", south_east: "sul", south_west: "sul",
  east_north: "leste", east_south: "leste", east_west: "leste",
  west_north: "oeste", west_south: "oeste", west_east: "oeste",
};

const DEST_MAP: Record<string, Cardinal> = {
  north_south: "sul", south_north: "norte",
  north_east: "leste", east_north: "norte",
  north_west: "oeste", west_north: "norte",
  south_east: "leste", east_south: "sul",
  south_west: "oeste", west_south: "sul",
  east_west: "oeste", west_east: "leste",
};

const COLORS: Record<Cardinal, string> = {
  norte: "#1e6b7d",
  sul: "#c2414d",
  leste: "#0d9488",
  oeste: "#d97706",
};

const V = 1000;
const CX = V / 2;
const CY = V / 2;
const ROAD_W = 120;
const ARM_LEN = 420;
const INNER = 85;
const CENTER_SIZE = 130;

type Point = { x: number; y: number };

function dirCenter(dir: Cardinal): Point {
  switch (dir) {
    case "norte": return { x: CX, y: CY - CENTER_SIZE / 2 };
    case "sul": return { x: CX, y: CY + CENTER_SIZE / 2 };
    case "leste": return { x: CX + CENTER_SIZE / 2, y: CY };
    case "oeste": return { x: CX - CENTER_SIZE / 2, y: CY };
  }
}

function dirOuter(dir: Cardinal): Point {
  switch (dir) {
    case "norte": return { x: CX, y: CY - ARM_LEN };
    case "sul": return { x: CX, y: CY + ARM_LEN };
    case "leste": return { x: CX + ARM_LEN, y: CY };
    case "oeste": return { x: CX - ARM_LEN, y: CY };
  }
}

function dirPerp(dir: Cardinal): Point {
  switch (dir) {
    case "norte": return { x: 1, y: 0 };
    case "sul": return { x: -1, y: 0 };
    case "leste": return { x: 0, y: 1 };
    case "oeste": return { x: 0, y: -1 };
  }
}

function add(p: Point, d: Point, scale: number): Point {
  return { x: p.x + d.x * scale, y: p.y + d.y * scale };
}

function lerp(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

interface BandData {
  key: string;
  origin: Cardinal;
  dest: Cardinal;
  value: number;
  width: number;
  lane: number;
  color: string;
  label: string;
}

function bandLane(origin: Cardinal, dest: Cardinal): number {
  const m: Record<Cardinal, Record<Cardinal, number>> = {
    norte: { sul: 0, leste: 1.3, oeste: -1.3, norte: 0 },
    sul: { norte: 0, leste: -1.3, oeste: 1.3, sul: 0 },
    leste: { oeste: 0, norte: -1.3, sul: 1.3, leste: 0 },
    oeste: { leste: 0, norte: 1.3, sul: -1.3, oeste: 0 },
  };
  return m[origin][dest];
}

const STEP = 0.05;

function cubicBezier(p0: Point, c1: Point, c2: Point, p3: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p3.y,
  };
}

function perpVec(a: Point, b: Point): { x: number; y: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: -dy / len, y: dx / len };
}

export function TrafficFlowSankey({ data }: TrafficFlowSankeyProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [clicked, setClicked] = useState<Cardinal | null>(null);
  const [animated, setAnimated] = useState(false);

  useState(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  });

  const maxFlow = useMemo(() => {
    return Math.max(1, ...Object.values(data).filter((v) => v > 0));
  }, [data]);

  const totalFlow = useMemo(() => {
    return Object.values(data).reduce((s: number, v: number) => s + v, 0) || 1;
  }, [data]);

  const bands: BandData[] = useMemo(() => {
    return Object.entries(data)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => {
        const origin = CARDINAL_MAP[key];
        const dest = DEST_MAP[key];
        const width = 6 + (value / maxFlow) * 50;
        return {
          key,
          origin: origin!,
          dest: dest!,
          value,
          width,
          lane: bandLane(origin!, dest!),
          color: COLORS[origin!],
          label: DIRECTION_LABELS[key] || key,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [data, maxFlow]);

  function buildBandPath(band: BandData): { d: string; center: Point } {
    const { origin, dest, lane, width } = band;
    const halfW = width / 2;
    const perpO = dirPerp(origin);
    const perpD = dirPerp(dest);
    const scale = lane * 32;

    const pOut = add(dirOuter(origin), perpO, scale);
    const pIn = add(dirCenter(origin), perpO, scale * 0.6);
    const qIn = add(dirCenter(dest), perpD, 0);
    const qOut = add(dirOuter(dest), perpD, 0);

    const mid = lerp(pIn, qIn, 0.5);
    const dm = Math.sqrt((qIn.x - pIn.x) ** 2 + (qIn.y - pIn.y) ** 2) * 0.4;

    const cp1 = { x: pIn.x + (qIn.x - pIn.x) * 0.3, y: pIn.y + (qIn.y - pIn.y) * 0.3 };
    const cp2 = { x: qIn.x - (qIn.x - pIn.x) * 0.3, y: qIn.y - (qIn.y - pIn.y) * 0.3 };

    const left: Point[] = [];
    const right: Point[] = [];

    for (let t = 0; t <= 1; t += STEP) {
      const pt = cubicBezier(pIn, cp1, cp2, qIn, t);
      const prev = t > 0 ? cubicBezier(pIn, cp1, cp2, qIn, t - STEP) : pIn;
      const perp = perpVec(prev, pt);
      left.push(add(pt, perp, -halfW));
      right.push(add(pt, perp, halfW));
    }

    const s0 = add(pOut, perpO, -halfW);
    const s1 = add(pOut, perpO, halfW);
    const e0 = add(qOut, perpD, -halfW);
    const e1 = add(qOut, perpD, halfW);

    const all = [s0, ...left, e0, ...right.reverse(), s1];

    return {
      d: `M ${all[0].x} ${all[0].y} ` + all.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ") + " Z",
      center: lerp(pOut, qOut, 0.5),
    };
  }

  function cardinalOriginTotal(dir: Cardinal): number {
    return bands.filter((b) => b.origin === dir).reduce((s, b) => s + b.value, 0);
  }

  function cardinalDestTotal(dir: Cardinal): number {
    return bands.filter((b) => b.dest === dir).reduce((s, b) => s + b.value, 0);
  }

  const allFlows = Object.entries(data).filter(([, v]) => v > 0);

  return (
    <div className="w-full flex flex-col items-center">
      <h3 className="text-center text-2xl font-bold text-gray-700 mb-1">
        Diagrama de Fluxo da Interseção
      </h3>
      <p className="text-center text-sm text-gray-500 mb-4">
        {bands.length} fluxos direcionais · {totalFlow} ciclistas no total
      </p>
      <svg viewBox={`0 0 ${V} ${V}`} className="w-full" style={{ maxWidth: 900 }}>
        {/* Road surface */}
        <rect x={CX - ROAD_W / 2} y={0} width={ROAD_W} height={V} fill="#f3f4f6" rx={0} />
        <rect x={0} y={CY - ROAD_W / 2} width={V} height={ROAD_W} fill="#f3f4f6" rx={0} />

        {/* Road edge lines */}
        <line x1={CX - ROAD_W / 2} y1={0} x2={CX - ROAD_W / 2} y2={V} stroke="#d1d5db" strokeWidth={1} />
        <line x1={CX + ROAD_W / 2} y1={0} x2={CX + ROAD_W / 2} y2={V} stroke="#d1d5db" strokeWidth={1} />
        <line x1={0} y1={CY - ROAD_W / 2} x2={V} y2={CY - ROAD_W / 2} stroke="#d1d5db" strokeWidth={1} />
        <line x1={0} y1={CY + ROAD_W / 2} x2={V} y2={CY + ROAD_W / 2} stroke="#d1d5db" strokeWidth={1} />

        {/* Road center dashes */}
        <line x1={CX} y1={0} x2={CX} y2={CY - CENTER_SIZE / 2} stroke="#9ca3af" strokeWidth={2} strokeDasharray="20 15" />
        <line x1={CX} y1={CY + CENTER_SIZE / 2} x2={CX} y2={V} stroke="#9ca3af" strokeWidth={2} strokeDasharray="20 15" />
        <line x1={0} y1={CY} x2={CX - CENTER_SIZE / 2} y2={CY} stroke="#9ca3af" strokeWidth={2} strokeDasharray="20 15" />
        <line x1={CX + CENTER_SIZE / 2} y1={CY} x2={V} y2={CY} stroke="#9ca3af" strokeWidth={2} strokeDasharray="20 15" />

        {/* Center intersection rounding */}
        <rect
          x={CX - CENTER_SIZE / 2} y={CY - CENTER_SIZE / 2}
          width={CENTER_SIZE} height={CENTER_SIZE}
          rx={16} fill="#e5e7eb" stroke="#d1d5db" strokeWidth={1}
        />

        {/* Flow bands */}
        {bands.map((band, idx) => {
          const { d, center } = buildBandPath(band);
          const pathId = `${band.origin}_${band.dest}`;
          const isActive = hovered === pathId;
          const isDimmed = (hovered || clicked) && hovered !== pathId && clicked !== band.origin;

          return (
            <g key={band.key}>
              {/* Invisible wider hit area */}
              <path
                d={d}
                fill="transparent"
                stroke="transparent"
                strokeWidth={8}
                className="cursor-pointer"
                onMouseEnter={() => setHovered(pathId)}
                onMouseLeave={() => setHovered(null)}
              />
              {/* Visible filled band */}
              <path
                d={d}
                fill={band.color}
                opacity={isDimmed ? 0.15 : isActive ? 0.95 : 0.75}
                style={{
                  transition: "opacity 0.3s ease, fill 0.3s ease",
                  animation: animated ? `bandAppear 0.6s ease-out ${idx * 0.05}s both` : "none",
                }}
              />
            </g>
          );
        })}

        {/* Hover tooltip */}
        {hovered && (() => {
          const band = bands.find((b) => `${b.origin}_${b.dest}` === hovered);
          if (!band) return null;
          const pt = buildBandPath(band).center;
          const pct = Math.round((band.value / totalFlow) * 100);
          return (
            <g>
              <rect x={pt.x - 90} y={pt.y - 28} width={180} height={50} rx={8} fill="white" stroke="#e5e7eb" strokeWidth={1} filter="url(#sankeyShadow)" />
              <text x={pt.x} y={pt.y - 12} textAnchor="middle" fontSize={13} fontWeight={700} fill="#1f2937">
                {band.label}
              </text>
              <text x={pt.x} y={pt.y + 8} textAnchor="middle" fontSize={12} fill="#6b7280">
                {band.value} ciclistas ({pct}%)
              </text>
            </g>
          );
        })()}

        {/* Direction labels */}
        {(["norte", "sul", "leste", "oeste"] as Cardinal[]).map((dir) => {
          const isActive = clicked === dir;
          const out = dirOuter(dir);
          const labelX = dir === "oeste" ? out.x - 50 : dir === "leste" ? out.x + 50 : out.x;
          const labelY = dir === "norte" ? out.y - 50 : dir === "sul" ? out.y + 50 : out.y;

          return (
            <g
              key={dir}
              className="cursor-pointer"
              onClick={() => setClicked(isActive ? null : dir)}
              opacity={clicked && !isActive ? 0.4 : 1}
              style={{ transition: "opacity 0.3s ease" }}
            >
              <rect
                x={labelX - 55} y={labelY} width={110} height={36} rx={8}
                fill={isActive ? COLORS[dir] : "white"}
                stroke={COLORS[dir]} strokeWidth={2}
                filter="url(#sankeyShadow)"
              />
              <text
                x={labelX} y={labelY + 14}
                textAnchor="middle" fontSize={13} fontWeight={800}
                fill={isActive ? "white" : COLORS[dir]}
                style={{ letterSpacing: "0.05em" }}
              >
                {dir.toUpperCase()}
              </text>
              <text
                x={labelX} y={labelY + 29}
                textAnchor="middle" fontSize={10} fontWeight={500}
                fill={isActive ? "rgba(255,255,255,0.9)" : "#6b7280"}
              >
                saem {cardinalOriginTotal(dir)} · entram {cardinalDestTotal(dir)}
              </text>
            </g>
          );
        })}

        <defs>
          <filter id="sankeyShadow">
            <feDropShadow dx={0} dy={2} stdDeviation={4} floodOpacity={0.08} />
          </filter>
        </defs>

        <style>{`
          @keyframes bandAppear {
            from { opacity: 0; transform-origin: center; }
            to { opacity: 0.75; }
          }
        `}</style>
      </svg>
    </div>
  );
}
