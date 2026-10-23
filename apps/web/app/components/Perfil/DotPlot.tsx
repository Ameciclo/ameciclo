// One row of the dot plot, shared by the explorer and the safety panel.
export type DotValue = { name: string; label: string; color: string; pct: number; n: number; hollow?: boolean };

export function GroupLegend({ groups }: { groups: { name: string; label: string; color: string; n?: number; hollow?: boolean }[] }) {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-gray-600">
      {groups.map((g) => (
        <span key={g.name} className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-full"
            style={g.hollow ? { border: `2px solid ${g.color}` } : { background: g.color }}
          />
          {g.label}
          {g.n !== undefined && <span className="text-gray-400">(n={g.n.toLocaleString("pt-BR")})</span>}
        </span>
      ))}
    </div>
  );
}

export function DotRow({
  label,
  sub,
  values,
  axisMax,
  badge,
}: {
  label: string;
  sub?: React.ReactNode;
  values: DotValue[];
  axisMax: number;
  badge?: string;
}) {
  const pcts = values.filter((v) => !v.hollow).map((v) => v.pct);
  const lo = Math.min(...pcts);
  const hi = Math.max(...pcts);
  return (
    <li className="py-3 grid grid-cols-1 sm:grid-cols-[minmax(0,2fr)_3fr] gap-x-6 gap-y-1 items-center">
      <div>
        <div className="text-sm text-gray-800">
          {label}
          {badge && <span className="ml-2 text-xs rounded bg-amber-100 text-amber-800 px-1.5 py-0.5">{badge}</span>}
        </div>
        {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
      </div>
      <div className="relative h-6">
        <div className="absolute top-1/2 inset-x-0 h-px bg-gray-200" />
        {pcts.length > 1 && (
          <div
            className="absolute top-1/2 h-1 -translate-y-1/2 rounded bg-gray-300"
            style={{ left: `${(lo / axisMax) * 100}%`, width: `${((hi - lo) / axisMax) * 100}%` }}
          />
        )}
        {values.map(({ name, label: groupLabel, color, pct, n, hollow }) => (
          <div
            key={name}
            className="group/dot absolute top-1/2 -translate-x-1/2 -translate-y-1/2 hover:z-10"
            style={{ left: `${(pct / axisMax) * 100}%` }}
          >
            <div
              className="w-3.5 h-3.5 rounded-full border-2 shadow transition-transform group-hover/dot:scale-150"
              style={hollow ? { borderColor: color, background: "white" } : { borderColor: "white", background: color }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/dot:block whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                {groupLabel}
              </div>
              <div className="tabular-nums">
                {pct.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% · {n.toLocaleString("pt-BR")} respostas
              </div>
            </div>
          </div>
        ))}
      </div>
    </li>
  );
}

export const roundedAxis = (max: number) => Math.max(10, Math.ceil(max / 10) * 10);
