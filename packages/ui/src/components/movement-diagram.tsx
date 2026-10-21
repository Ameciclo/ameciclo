import { useId } from "react";

type Topology = "point" | "t_junction" | "crossroad";

type Props = {
  topology: Topology;
  approaches: string[];
  // "fromIdx-toIdx" -> cyclists
  flows: Record<string, number>;
};

type Pos = { x: number; y: number };

type Leg = {
  label: Pos & { align: "start" | "middle" | "end" };
  out: Pos;
  in: Pos;
  axis: Pos;
};

// Legs run clockwise from the top. Positions are illustrative, not compass-true.
const LEGS: Record<Topology, Leg[]> = {
  point: [
    { label: { x: 18, y: 82, align: "start" }, out: { x: 50, y: 132 }, in: { x: 50, y: 108 }, axis: { x: 1, y: 0 } },
    { label: { x: 302, y: 82, align: "end" }, out: { x: 270, y: 108 }, in: { x: 270, y: 132 }, axis: { x: -1, y: 0 } },
  ],
  t_junction: [
    { label: { x: 18, y: 66, align: "start" }, out: { x: 70, y: 112 }, in: { x: 70, y: 88 }, axis: { x: 1, y: 0 } },
    { label: { x: 302, y: 66, align: "end" }, out: { x: 250, y: 88 }, in: { x: 250, y: 112 }, axis: { x: -1, y: 0 } },
    { label: { x: 160, y: 208, align: "middle" }, out: { x: 148, y: 175 }, in: { x: 172, y: 175 }, axis: { x: 0, y: -1 } },
  ],
  crossroad: [
    { label: { x: 160, y: 12, align: "middle" }, out: { x: 172, y: 50 }, in: { x: 148, y: 50 }, axis: { x: 0, y: 1 } },
    { label: { x: 302, y: 82, align: "end" }, out: { x: 270, y: 108 }, in: { x: 270, y: 132 }, axis: { x: -1, y: 0 } },
    { label: { x: 160, y: 208, align: "middle" }, out: { x: 148, y: 190 }, in: { x: 172, y: 190 }, axis: { x: 0, y: -1 } },
    { label: { x: 18, y: 82, align: "start" }, out: { x: 50, y: 132 }, in: { x: 50, y: 108 }, axis: { x: 1, y: 0 } },
  ],
};

const TANGENT = 32;

const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

function Roads({ topology }: { topology: Topology }) {
  return (
    <g stroke="var(--color-foreground)" strokeWidth={30} opacity={0.07} strokeLinecap="round">
      {topology === "point" && <line x1={20} y1={120} x2={300} y2={120} />}
      {topology === "t_junction" && (
        <>
          <line x1={20} y1={100} x2={300} y2={100} />
          <line x1={160} y1={100} x2={160} y2={215} />
        </>
      )}
      {topology === "crossroad" && (
        <>
          <line x1={20} y1={120} x2={300} y2={120} />
          <line x1={160} y1={20} x2={160} y2={215} />
        </>
      )}
    </g>
  );
}

export function MovementDiagram({ topology, approaches, flows }: Props) {
  const id = useId();
  const legs = LEGS[topology];
  const count = legs.length;
  const values = Object.values(flows);
  const max = Math.max(1, ...values);

  const outgoing = (from: number) =>
    Array.from({ length: count }, (_, to) => (to === from ? 0 : (flows[`${from}-${to}`] ?? 0))).reduce(
      (s, v) => s + v,
      0,
    );

  const curves = Array.from({ length: count }, (_, from) =>
    Array.from({ length: count }, (_, to) => ({ from, to })).filter((m) => m.from !== m.to),
  )
    .flat()
    .map((m) => ({ ...m, value: flows[`${m.from}-${m.to}`] ?? 0 }))
    .sort((a, b) => a.value - b.value);

  return (
    <svg viewBox="0 0 320 240" className="w-full max-w-md" role="img" aria-label="Diagrama dos movimentos">
      <defs>
        <marker id={`${id}-tip`} viewBox="0 0 6 6" refX="4.5" refY="3" markerWidth="7" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill="var(--color-ameciclo)" />
        </marker>
      </defs>

      <Roads topology={topology} />

      {curves.map(({ from, to, value }) => {
        const a = legs[from];
        const b = legs[to];
        const start = a.out;
        const end = b.in;
        const c1 = { x: start.x + a.axis.x * TANGENT, y: start.y + a.axis.y * TANGENT };
        const c2 = { x: end.x + b.axis.x * TANGENT, y: end.y + b.axis.y * TANGENT };
        const mid = {
          x: 0.125 * start.x + 0.375 * c1.x + 0.375 * c2.x + 0.125 * end.x,
          y: 0.125 * start.y + 0.375 * c1.y + 0.375 * c2.y + 0.125 * end.y,
        };
        const d = `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;
        const active = value > 0;
        return (
          <g key={`${from}-${to}`}>
            <title>{`${approaches[from] ?? from + 1} → ${approaches[to] ?? to + 1}: ${value.toLocaleString("pt-BR")}`}</title>
            <path
              d={d}
              fill="none"
              stroke="var(--color-ameciclo)"
              strokeOpacity={active ? 0.6 : 0.1}
              strokeWidth={active ? 1 + 4.5 * Math.sqrt(value / max) : 1}
              strokeLinecap="round"
              markerEnd={active ? `url(#${id}-tip)` : undefined}
            />
            {value >= max * 0.06 && (
              <text
                x={mid.x}
                y={mid.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={9}
                fontWeight={600}
                fill="var(--color-ameciclo)"
                stroke="var(--color-background)"
                strokeWidth={3}
                paintOrder="stroke"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {value.toLocaleString("pt-BR")}
              </text>
            )}
          </g>
        );
      })}

      {legs.map((leg, i) => (
        <g key={i}>
          <text x={leg.label.x} y={leg.label.y} textAnchor={leg.label.align} fontSize={11} fontWeight={600} fill="var(--color-foreground)">
            {truncate(approaches[i]?.trim() || `Aproximação ${i + 1}`, 24)}
          </text>
          <text x={leg.label.x} y={leg.label.y + 12} textAnchor={leg.label.align} fontSize={9} fill="var(--color-muted-foreground)">
            saem {outgoing(i).toLocaleString("pt-BR")}
          </text>
        </g>
      ))}
    </svg>
  );
}
