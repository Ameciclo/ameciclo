import { TOPOLOGY_LABELS, type Topology } from "./types";
import { cn } from "~/lib/utils";

type Props = {
  value: Topology;
  onChange: (t: Topology) => void;
};

export function TopologyPicker({ value, onChange }: Props) {
  const options: Topology[] = ["point", "t_junction", "crossroad"];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {options.map((t) => {
        const active = value === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={cn(
              "group flex flex-col items-center gap-2 rounded-md border bg-background p-3 text-sm transition-colors",
              "hover:border-foreground/40 hover:bg-accent/40",
              active && "border-foreground ring-2 ring-foreground/10 bg-accent/30",
            )}
            aria-pressed={active}
          >
            <Thumb topology={t} />
            <span className={cn("font-medium", active ? "text-foreground" : "text-muted-foreground")}>
              {TOPOLOGY_LABELS[t]}
            </span>
            <span className="text-xs text-muted-foreground">
              {t === "point" ? "2 sentidos" : t === "t_junction" ? "3 aproximações" : "4 aproximações"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Thumb({ topology }: { topology: Topology }) {
  const stroke = "currentColor";
  const w = 64;
  const h = 64;
  return (
    <svg width={w} height={h} viewBox="0 0 64 64" className="text-muted-foreground group-hover:text-foreground" aria-hidden>
      {topology === "point" && (
        <line x1={6} y1={32} x2={58} y2={32} stroke={stroke} strokeWidth={4} strokeLinecap="round" />
      )}
      {topology === "t_junction" && (
        <>
          <line x1={6} y1={28} x2={58} y2={28} stroke={stroke} strokeWidth={4} strokeLinecap="round" />
          <line x1={32} y1={28} x2={32} y2={58} stroke={stroke} strokeWidth={4} strokeLinecap="round" />
        </>
      )}
      {topology === "crossroad" && (
        <>
          <line x1={6} y1={32} x2={58} y2={32} stroke={stroke} strokeWidth={4} strokeLinecap="round" />
          <line x1={32} y1={6} x2={32} y2={58} stroke={stroke} strokeWidth={4} strokeLinecap="round" />
        </>
      )}
      <circle cx={32} cy={topology === "t_junction" ? 28 : 32} r={3.5} fill="currentColor" />
    </svg>
  );
}
