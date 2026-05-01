import {
  TOPOLOGY_DIRECTIONS,
  type Movements,
  type Topology,
} from "./types";

type Props = {
  topology: Topology;
  approaches: string[];
  movements: Movements;
};

/**
 * Static topology illustration. Each movement (from→to) with a non-zero count
 * is drawn as a cubic bezier whose tangents follow the leg axes, so straights
 * are straight, right-turns curve gently, and left/U-turns swing wide. Stroke
 * width and label scale subtly with magnitude.
 */
export function TopologyDiagram({ topology, approaches, movements }: Props) {
  const dirs = TOPOLOGY_DIRECTIONS[topology];
  const count = dirs.length;
  const legs = LEG_GEOMETRY[topology];

  return (
    <div className="rounded-md border bg-muted/30 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        Diagrama do {topology === "point" ? "ponto" : topology === "t_junction" ? "T" : "cruzamento"}
      </p>
      <div className="flex justify-center">
        <svg
          viewBox="0 0 320 240"
          className="w-full max-w-md"
          aria-label="Diagrama da topologia da contagem com fluxo"
        >
          <defs>
            <marker
              id="flow-tip"
              viewBox="0 0 6 6"
              refX="5.5"
              refY="3"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 6 3 L 0 6 z" fill="var(--color-ameciclo)" opacity="0.85" />
            </marker>
          </defs>

          {/* roads */}
          <Roads topology={topology} />

          {/* movement curves (only non-zero) */}
          {Array.from({ length: count }).flatMap((_, i) =>
            Array.from({ length: count }).map((__, j) => {
              if (i === j) return null;
              const value = parseFlow(movements[`${i}-${j}`]);
              if (value === 0) return null;
              return (
                <FlowArrow
                  key={`${i}-${j}`}
                  from={legs[i]}
                  to={legs[j]}
                  count={value}
                />
              );
            }),
          )}

          {/* approach labels */}
          {dirs.map((_, idx) => {
            const leg = legs[idx];
            const label = approaches[idx]?.trim() || `Aproximação ${idx + 1}`;
            const placeholder = !approaches[idx]?.trim();
            return (
              <LegLabel
                key={idx}
                pos={leg.label}
                label={label}
                placeholder={placeholder}
              />
            );
          })}
        </svg>
      </div>
      <p className="mt-3 text-xs text-muted-foreground text-center">
        Cada seta vai <em>de</em> uma aproximação <em>para</em> outra. A
        espessura e o número refletem a contagem na matriz abaixo.
      </p>
    </div>
  );
}

/* ----- geometry -------------------------------------------------------- */

type Pos = { x: number; y: number };
type Vec = { x: number; y: number };

type LegPos = {
  /** Outer end where the label sits. */
  label: Pos & {
    align: "start" | "middle" | "end";
    side: "top" | "right" | "bottom" | "left";
  };
  /** Departure point (arrow leaves the leg here). */
  out: Pos;
  /** Arrival point (arrow arrives the leg here). */
  in: Pos;
  /** Unit vector pointing inward along the leg axis (from outer end to centre). */
  axis: Vec;
};

/** Right-hand convention: departure on the right side of the leg looking inward. */
const LEG_GEOMETRY: Record<Topology, LegPos[]> = {
  point: [
    {
      label: { x: 18, y: 120, align: "start", side: "left" },
      out: { x: 50, y: 132 },
      in: { x: 50, y: 108 },
      axis: { x: 1, y: 0 },
    },
    {
      label: { x: 302, y: 120, align: "end", side: "right" },
      out: { x: 270, y: 108 },
      in: { x: 270, y: 132 },
      axis: { x: -1, y: 0 },
    },
  ],
  t_junction: [
    // West
    {
      label: { x: 18, y: 100, align: "start", side: "left" },
      out: { x: 70, y: 112 },
      in: { x: 70, y: 88 },
      axis: { x: 1, y: 0 },
    },
    // East
    {
      label: { x: 302, y: 100, align: "end", side: "right" },
      out: { x: 250, y: 88 },
      in: { x: 250, y: 112 },
      axis: { x: -1, y: 0 },
    },
    // South
    {
      label: { x: 160, y: 215, align: "middle", side: "bottom" },
      out: { x: 148, y: 175 },
      in: { x: 172, y: 175 },
      axis: { x: 0, y: -1 },
    },
  ],
  crossroad: [
    // North
    {
      label: { x: 160, y: 18, align: "middle", side: "top" },
      out: { x: 172, y: 50 },
      in: { x: 148, y: 50 },
      axis: { x: 0, y: 1 },
    },
    // East
    {
      label: { x: 302, y: 120, align: "end", side: "right" },
      out: { x: 270, y: 108 },
      in: { x: 270, y: 132 },
      axis: { x: -1, y: 0 },
    },
    // South
    {
      label: { x: 160, y: 215, align: "middle", side: "bottom" },
      out: { x: 148, y: 190 },
      in: { x: 172, y: 190 },
      axis: { x: 0, y: -1 },
    },
    // West
    {
      label: { x: 18, y: 120, align: "start", side: "left" },
      out: { x: 50, y: 132 },
      in: { x: 50, y: 108 },
      axis: { x: 1, y: 0 },
    },
  ],
};

const TANGENT_LENGTH = 32;

function parseFlow(s: string | undefined): number {
  if (!s) return 0;
  const n = Number(s);
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
}

function Roads({ topology }: { topology: Topology }) {
  const stroke = "var(--color-foreground)";
  const opacity = 0.07;
  const w = 30;
  if (topology === "point") {
    return (
      <line x1={20} y1={120} x2={300} y2={120} stroke={stroke} strokeWidth={w} opacity={opacity} strokeLinecap="round" />
    );
  }
  if (topology === "t_junction") {
    return (
      <g stroke={stroke} strokeWidth={w} opacity={opacity} strokeLinecap="round">
        <line x1={20} y1={100} x2={300} y2={100} />
        <line x1={160} y1={100} x2={160} y2={215} />
      </g>
    );
  }
  return (
    <g stroke={stroke} strokeWidth={w} opacity={opacity} strokeLinecap="round">
      <line x1={20} y1={120} x2={300} y2={120} />
      <line x1={160} y1={20} x2={160} y2={215} />
    </g>
  );
}

function FlowArrow({
  from,
  to,
  count,
}: {
  from: LegPos;
  to: LegPos;
  count: number;
}) {
  const start = from.out;
  const end = to.in;

  // Cubic bezier: enter along source axis, exit along destination axis.
  // - Tangent at start = source axis (inward, toward intersection)
  // - Tangent at end = -dest axis (outward, away from intersection)
  const c1: Pos = {
    x: start.x + from.axis.x * TANGENT_LENGTH,
    y: start.y + from.axis.y * TANGENT_LENGTH,
  };
  const c2: Pos = {
    x: end.x + to.axis.x * TANGENT_LENGTH,
    y: end.y + to.axis.y * TANGENT_LENGTH,
  };

  // Subtle width scaling: 1.0–2.6 across counts 1..1000 (log-ish).
  const width = 1 + Math.min(1.6, Math.log10(count + 1) * 0.7);

  // Label at bezier midpoint t=0.5: 0.125 P0 + 0.375 C1 + 0.375 C2 + 0.125 P3
  const mid: Pos = {
    x: 0.125 * start.x + 0.375 * c1.x + 0.375 * c2.x + 0.125 * end.x,
    y: 0.125 * start.y + 0.375 * c1.y + 0.375 * c2.y + 0.125 * end.y,
  };

  return (
    <g>
      <path
        d={`M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`}
        fill="none"
        stroke="var(--color-ameciclo)"
        strokeOpacity={0.7}
        strokeWidth={width}
        strokeLinecap="round"
        markerEnd="url(#flow-tip)"
      />
      <text
        x={mid.x}
        y={mid.y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={9}
        fontWeight={600}
        fontVariantNumeric="tabular-nums"
        fill="var(--color-ameciclo)"
        paintOrder="stroke"
        stroke="var(--color-background)"
        strokeWidth={3}
      >
        {count.toLocaleString("pt-BR")}
      </text>
    </g>
  );
}

function LegLabel({
  pos,
  label,
  placeholder,
}: {
  pos: LegPos["label"];
  label: string;
  placeholder: boolean;
}) {
  const labelY = pos.side === "bottom" ? pos.y : pos.y - 4;
  return (
    <text
      x={pos.x}
      y={labelY}
      textAnchor={pos.align}
      fontSize={11}
      fontWeight={600}
      fontStyle={placeholder ? "italic" : "normal"}
      fill={placeholder ? "var(--color-muted-foreground)" : "var(--color-foreground)"}
    >
      {truncate(label, 24)}
    </text>
  );
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
