import { useEffect, useRef, useState } from "react";
import {
  TOPOLOGY_DIRECTIONS,
  type Movements,
  type Topology,
} from "./types";

type Props = {
  topology: Topology;
  approaches: string[];
  movements: Movements;
  onApproachChange: (idx: number, value: string) => void;
  onMovementChange: (key: string, value: string) => void;
};

type EditTarget =
  | { kind: "approach"; idx: number }
  | { kind: "movement"; key: string };

/**
 * Interactive topology diagram. Click any approach label to rename it; click
 * any movement curve to enter its count. Tab cycles through the labels and
 * the live (or hover-discoverable) movements; Enter activates editing; Enter
 * or blur commits; Escape cancels. The same `movements` and `approaches`
 * state powers the read-only matrix view below.
 */
export function TopologyDiagram({
  topology,
  approaches,
  movements,
  onApproachChange,
  onMovementChange,
}: Props) {
  const dirs = TOPOLOGY_DIRECTIONS[topology];
  const count = dirs.length;
  const legs = LEG_GEOMETRY[topology];
  const [editing, setEditing] = useState<EditTarget | null>(null);

  // Reset editing state when topology shifts (indices/keys change).
  useEffect(() => setEditing(null), [topology]);

  function startEdit(target: EditTarget) {
    setEditing(target);
  }
  function stopEdit() {
    setEditing(null);
  }

  return (
    <div className="rounded-md border bg-muted/30 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        Diagrama do {topology === "point" ? "ponto" : topology === "t_junction" ? "T" : "cruzamento"}
      </p>
      <div className="flex justify-center">
        <svg
          viewBox="0 0 320 240"
          className="w-full max-w-lg"
          aria-label="Diagrama interativo de fluxo"
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
            <marker
              id="flow-tip-dim"
              viewBox="0 0 6 6"
              refX="5.5"
              refY="3"
              markerWidth="4"
              markerHeight="4"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 6 3 L 0 6 z" fill="var(--color-ameciclo)" opacity="0.35" />
            </marker>
          </defs>

          <Roads topology={topology} />

          {/* movement curves — render placeholders for zero-count too, dimmed */}
          {Array.from({ length: count }).flatMap((_, i) =>
            Array.from({ length: count }).map((__, j) => {
              if (i === j) return null;
              const key = `${i}-${j}`;
              const value = parseFlow(movements[key]);
              const isEditing = editing?.kind === "movement" && editing.key === key;
              return (
                <FlowItem
                  key={key}
                  movementKey={key}
                  from={legs[i]}
                  to={legs[j]}
                  count={value}
                  editing={isEditing}
                  rawValue={movements[key] ?? ""}
                  onActivate={() => startEdit({ kind: "movement", key })}
                  onCommit={(v) => {
                    onMovementChange(key, v);
                    stopEdit();
                  }}
                  onCancel={stopEdit}
                />
              );
            }),
          )}

          {/* approach labels (clickable / editable) */}
          {dirs.map((_, idx) => {
            const leg = legs[idx];
            const value = approaches[idx] ?? "";
            const isEditing = editing?.kind === "approach" && editing.idx === idx;
            return (
              <ApproachItem
                key={idx}
                idx={idx}
                pos={leg.label}
                value={value}
                editing={isEditing}
                onActivate={() => startEdit({ kind: "approach", idx })}
                onCommit={(v) => {
                  onApproachChange(idx, v);
                  stopEdit();
                }}
                onCancel={stopEdit}
              />
            );
          })}
        </svg>
      </div>
      <p className="mt-3 text-xs text-muted-foreground text-center">
        Clique em um rótulo para renomear ou em uma seta para informar a contagem.
        <span className="hidden sm:inline"> Use <kbd className="rounded border px-1 py-px text-[10px]">Tab</kbd> para navegar.</span>
      </p>
    </div>
  );
}

/* ----- approach label (click to edit) ---------------------------------- */

function ApproachItem({
  idx,
  pos,
  value,
  editing,
  onActivate,
  onCommit,
  onCancel,
}: {
  idx: number;
  pos: LegPos["label"];
  value: string;
  editing: boolean;
  onActivate: () => void;
  onCommit: (v: string) => void;
  onCancel: () => void;
}) {
  const labelY = pos.side === "bottom" ? pos.y : pos.y - 4;
  const placeholder = !value.trim();
  const display = value.trim() || `Aproximação ${idx + 1}`;

  if (editing) {
    return (
      <ForeignInput
        x={pos.x - 80 + (pos.align === "end" ? 80 : pos.align === "middle" ? 40 : 0)}
        y={labelY - 18}
        width={160}
        height={26}
        initial={value}
        type="text"
        ariaLabel={`Renomear aproximação ${idx + 1}`}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );
  }

  return (
    <g
      tabIndex={0}
      role="button"
      aria-label={`Editar nome da aproximação ${idx + 1}: ${display}`}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate();
        }
      }}
      style={{ cursor: "pointer", outline: "none" }}
      className="group focus-visible:[&_text]:underline"
    >
      <text
        x={pos.x}
        y={labelY}
        textAnchor={pos.align}
        fontSize={11}
        fontWeight={600}
        fontStyle={placeholder ? "italic" : "normal"}
        fill={placeholder ? "var(--color-muted-foreground)" : "var(--color-foreground)"}
        className="group-hover:fill-[var(--color-ameciclo)]"
      >
        {truncate(display, 24)}
      </text>
    </g>
  );
}

/* ----- movement arrow (click to edit) ---------------------------------- */

function FlowItem({
  movementKey,
  from,
  to,
  count,
  editing,
  rawValue,
  onActivate,
  onCommit,
  onCancel,
}: {
  movementKey: string;
  from: LegPos;
  to: LegPos;
  count: number;
  editing: boolean;
  rawValue: string;
  onActivate: () => void;
  onCommit: (v: string) => void;
  onCancel: () => void;
}) {
  const start = from.out;
  const end = to.in;
  const c1: Pos = {
    x: start.x + from.axis.x * TANGENT_LENGTH,
    y: start.y + from.axis.y * TANGENT_LENGTH,
  };
  const c2: Pos = {
    x: end.x + to.axis.x * TANGENT_LENGTH,
    y: end.y + to.axis.y * TANGENT_LENGTH,
  };
  const mid: Pos = {
    x: 0.125 * start.x + 0.375 * c1.x + 0.375 * c2.x + 0.125 * end.x,
    y: 0.125 * start.y + 0.375 * c1.y + 0.375 * c2.y + 0.125 * end.y,
  };

  const hasValue = count > 0;
  const width = hasValue
    ? 1 + Math.min(1.6, Math.log10(count + 1) * 0.7)
    : 1;
  const opacity = hasValue ? 0.7 : 0.18;
  const dPath = `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;

  if (editing) {
    return (
      <>
        <path d={dPath} fill="none" stroke="var(--color-ameciclo)" strokeOpacity={0.85} strokeWidth={width + 0.5} strokeLinecap="round" markerEnd="url(#flow-tip)" />
        <ForeignInput
          x={mid.x - 28}
          y={mid.y - 12}
          width={56}
          height={24}
          initial={rawValue}
          type="number"
          ariaLabel={`Contagem do movimento ${movementKey}`}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      </>
    );
  }

  return (
    <g
      tabIndex={0}
      role="button"
      aria-label={`Editar contagem do movimento ${movementKey} (${count})`}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate();
        }
      }}
      style={{ cursor: "pointer", outline: "none" }}
      className="group"
    >
      {/* invisible fat hit-area for easier clicking */}
      <path d={dPath} fill="none" stroke="transparent" strokeWidth={14} strokeLinecap="round" />
      <path
        d={dPath}
        fill="none"
        stroke="var(--color-ameciclo)"
        strokeOpacity={opacity}
        strokeWidth={width}
        strokeLinecap="round"
        markerEnd={hasValue ? "url(#flow-tip)" : "url(#flow-tip-dim)"}
        className="group-hover:[stroke-opacity:1] group-focus-visible:[stroke-opacity:1]"
      />
      <text
        x={mid.x}
        y={mid.y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={hasValue ? 9 : 8}
        fontWeight={600}
        fontVariantNumeric="tabular-nums"
        fill="var(--color-ameciclo)"
        opacity={hasValue ? 1 : 0.45}
        paintOrder="stroke"
        stroke="var(--color-background)"
        strokeWidth={3}
        style={{ pointerEvents: "none" }}
        className="group-hover:opacity-100"
      >
        {hasValue ? count.toLocaleString("pt-BR") : "+"}
      </text>
    </g>
  );
}

/* ----- inline editing input via <foreignObject> ------------------------ */

function ForeignInput({
  x,
  y,
  width,
  height,
  initial,
  type,
  ariaLabel,
  onCommit,
  onCancel,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  initial: string;
  type: "text" | "number";
  ariaLabel: string;
  onCommit: (v: string) => void;
  onCancel: () => void;
}) {
  const [val, setVal] = useState(initial);
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  return (
    <foreignObject x={x} y={y} width={width} height={height}>
      <input
        ref={ref}
        aria-label={ariaLabel}
        type={type}
        inputMode={type === "number" ? "numeric" : undefined}
        min={type === "number" ? 0 : undefined}
        step={type === "number" ? 1 : undefined}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => onCommit(val)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.currentTarget as HTMLInputElement).blur();
          } else if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }}
        style={{
          width: "100%",
          height: "100%",
          padding: type === "number" ? "0 4px" : "0 6px",
          margin: 0,
          border: "1.5px solid var(--color-ameciclo)",
          borderRadius: 4,
          background: "var(--color-background)",
          color: "var(--color-foreground)",
          fontSize: type === "number" ? 12 : 11,
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
          textAlign: type === "number" ? "center" : "left",
          outline: "none",
          boxShadow: "0 0 0 3px color-mix(in srgb, var(--color-ameciclo) 18%, transparent)",
          fontFamily: "inherit",
        }}
      />
    </foreignObject>
  );
}

/* ----- geometry -------------------------------------------------------- */

type Pos = { x: number; y: number };
type Vec = { x: number; y: number };

type LegPos = {
  label: Pos & {
    align: "start" | "middle" | "end";
    side: "top" | "right" | "bottom" | "left";
  };
  out: Pos;
  in: Pos;
  axis: Vec;
};

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
    {
      label: { x: 18, y: 100, align: "start", side: "left" },
      out: { x: 70, y: 112 },
      in: { x: 70, y: 88 },
      axis: { x: 1, y: 0 },
    },
    {
      label: { x: 302, y: 100, align: "end", side: "right" },
      out: { x: 250, y: 88 },
      in: { x: 250, y: 112 },
      axis: { x: -1, y: 0 },
    },
    {
      label: { x: 160, y: 215, align: "middle", side: "bottom" },
      out: { x: 148, y: 175 },
      in: { x: 172, y: 175 },
      axis: { x: 0, y: -1 },
    },
  ],
  crossroad: [
    {
      label: { x: 160, y: 18, align: "middle", side: "top" },
      out: { x: 172, y: 50 },
      in: { x: 148, y: 50 },
      axis: { x: 0, y: 1 },
    },
    {
      label: { x: 302, y: 120, align: "end", side: "right" },
      out: { x: 270, y: 108 },
      in: { x: 270, y: 132 },
      axis: { x: -1, y: 0 },
    },
    {
      label: { x: 160, y: 215, align: "middle", side: "bottom" },
      out: { x: 148, y: 190 },
      in: { x: 172, y: 190 },
      axis: { x: 0, y: -1 },
    },
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
    return <line x1={20} y1={120} x2={300} y2={120} stroke={stroke} strokeWidth={w} opacity={opacity} strokeLinecap="round" />;
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

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
