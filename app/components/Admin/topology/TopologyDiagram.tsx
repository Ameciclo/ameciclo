import {
  TOPOLOGY_DIRECTIONS,
  type Movements,
  type Topology,
  approachVolume,
} from "./types";

type Props = {
  topology: Topology;
  approaches: string[];
  movements: Movements;
};

/**
 * Static topology illustration. Legs are drawn at fixed canonical positions;
 * each leg shows its label (user-supplied) and the approach volume —
 * total ciclistas saindo dessa perna em direção às outras.
 */
export function TopologyDiagram({ topology, approaches, movements }: Props) {
  const dirs = TOPOLOGY_DIRECTIONS[topology];
  const count = dirs.length;

  return (
    <div className="rounded-md border bg-muted/30 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        Diagrama do {topology === "point" ? "ponto" : topology === "t_junction" ? "T" : "cruzamento"}
      </p>
      <div className="flex justify-center">
        <svg
          viewBox="0 0 320 220"
          className="w-full max-w-md text-foreground"
          aria-label="Diagrama da topologia da contagem"
        >
          {/* roads */}
          <Roads topology={topology} />
          {/* approach legs with labels + volumes */}
          {dirs.map((dir, idx) => {
            const pos = LEG_POSITIONS[topology][idx];
            const label = approaches[idx]?.trim() || `Aproximação ${idx + 1}`;
            const volume = approachVolume(idx, count, movements);
            const placeholder = !approaches[idx]?.trim();
            return (
              <LegOverlay
                key={idx}
                pos={pos}
                label={label}
                volume={volume}
                placeholder={placeholder}
              />
            );
          })}
          {/* center marker */}
          <circle
            cx={CENTER[topology].x}
            cy={CENTER[topology].y}
            r={6}
            fill="currentColor"
            opacity={0.25}
          />
        </svg>
      </div>
      <p className="mt-3 text-xs text-muted-foreground text-center">
        O número em cada perna mostra quantos ciclistas <em>saem</em> dessa aproximação
        em direção às demais (soma da linha correspondente na matriz).
      </p>
    </div>
  );
}

type Pos = {
  x: number; // label x
  y: number; // label y
  align: "start" | "middle" | "end";
  side: "top" | "right" | "bottom" | "left";
};

const CENTER: Record<Topology, { x: number; y: number }> = {
  point: { x: 160, y: 110 },
  t_junction: { x: 160, y: 90 },
  crossroad: { x: 160, y: 110 },
};

/** Leg label positions for each topology, indexed in canonical order. */
const LEG_POSITIONS: Record<Topology, Pos[]> = {
  point: [
    { x: 18, y: 110, align: "start", side: "left" },
    { x: 302, y: 110, align: "end", side: "right" },
  ],
  t_junction: [
    { x: 18, y: 90, align: "start", side: "left" },
    { x: 302, y: 90, align: "end", side: "right" },
    { x: 160, y: 200, align: "middle", side: "bottom" },
  ],
  crossroad: [
    { x: 160, y: 18, align: "middle", side: "top" },
    { x: 302, y: 110, align: "end", side: "right" },
    { x: 160, y: 200, align: "middle", side: "bottom" },
    { x: 18, y: 110, align: "start", side: "left" },
  ],
};

function Roads({ topology }: { topology: Topology }) {
  const stroke = "currentColor";
  const opacity = 0.18;
  if (topology === "point") {
    return (
      <line x1={20} y1={110} x2={300} y2={110} stroke={stroke} strokeWidth={20} opacity={opacity} strokeLinecap="round" />
    );
  }
  if (topology === "t_junction") {
    return (
      <g stroke={stroke} strokeWidth={20} opacity={opacity} strokeLinecap="round">
        <line x1={20} y1={90} x2={300} y2={90} />
        <line x1={160} y1={90} x2={160} y2={200} />
      </g>
    );
  }
  return (
    <g stroke={stroke} strokeWidth={20} opacity={opacity} strokeLinecap="round">
      <line x1={20} y1={110} x2={300} y2={110} />
      <line x1={160} y1={20} x2={160} y2={200} />
    </g>
  );
}

function LegOverlay({
  pos,
  label,
  volume,
  placeholder,
}: {
  pos: Pos;
  label: string;
  volume: number;
  placeholder: boolean;
}) {
  // Stack label and volume vertically near the leg end.
  const labelY = pos.side === "bottom" ? pos.y + 4 : pos.y - 12;
  const volumeY = pos.side === "bottom" ? pos.y + 18 : pos.y + 4;
  return (
    <g>
      <text
        x={pos.x}
        y={labelY}
        textAnchor={pos.align}
        className={placeholder ? "fill-muted-foreground" : "fill-foreground"}
        fontSize={11}
        fontWeight={600}
        fontStyle={placeholder ? "italic" : "normal"}
      >
        {truncate(label, 26)}
      </text>
      <text
        x={pos.x}
        y={volumeY}
        textAnchor={pos.align}
        className="fill-muted-foreground"
        fontSize={11}
        fontVariantNumeric="tabular-nums"
      >
        ↑ {volume.toLocaleString("pt-BR")}
      </text>
    </g>
  );
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
