import { formatNumber } from "~/lib/format";

type BarListProps = {
  rows: { label: string; n: number }[];
  // Denominator for the percentages: the people who answered.
  answered: number;
};

// Horizontal bars with the share of answers; the biggest bar is drawn full width.
export function BarList({ rows, answered }: BarListProps) {
  const max = Math.max(...rows.map((r) => r.n), 1);
  return (
    <ul className="space-y-2">
      {rows.map((r) => {
        const pct = answered > 0 ? (r.n / answered) * 100 : 0;
        return (
          <li key={r.label} className="text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate" title={r.label}>
                {r.label}
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {pct.toFixed(1).replace(".", ",")}% · {formatNumber(r.n)}
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(r.n / max) * 100}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
