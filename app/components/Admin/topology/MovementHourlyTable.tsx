import { Input } from "~/components/ui/input";
import { TOPOLOGY_DIRECTIONS, type Topology } from "./types";
import { readCell, sumStringArray } from "~/admin/contagens/schema/nova-form";

type Props = {
  topology: Topology;
  approaches: string[];
  movements: Record<string, string[]>;
  bucketCount: number;
  bucketMinutes: number;
  /** Wall-clock label for column header at bucket index. */
  bucketLabel: (idx: number) => string;
  onBucketChange: (key: string, bucketIdx: number, value: string) => void;
};

/**
 * Per-bucket grid: one row per from→to movement, one column per bucket. Used
 * inside Resultados → "Ver matriz por hora" disclosure for fidelity-preserving
 * entry that mirrors the xlsx hourly columns.
 */
export function MovementHourlyTable({
  topology,
  approaches,
  movements,
  bucketCount,
  bucketLabel,
  onBucketChange,
}: Props) {
  const dirs = TOPOLOGY_DIRECTIONS[topology];
  const n = dirs.length;
  const labels = approaches.map((a, i) => a.trim() || `Aprox. ${i + 1}`);

  type Row = { key: string; fromIdx: number; toIdx: number };
  const rows: Row[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      rows.push({ key: `${i}-${j}`, fromIdx: i, toIdx: j });
    }
  }

  if (bucketCount <= 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Defina o início, o término e a granularidade da sessão para habilitar a
        matriz por hora.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="text-sm">
        <thead>
          <tr className="border-b">
            <th
              scope="col"
              className="text-left font-medium text-muted-foreground px-3 py-2 text-xs uppercase tracking-wide whitespace-nowrap sticky left-0 z-20 bg-muted"
            >
              De → Para
            </th>
            {Array.from({ length: bucketCount }).map((_, b) => (
              <th
                key={b}
                scope="col"
                className="font-medium text-foreground px-2 py-2 text-xs whitespace-nowrap bg-muted"
              >
                {bucketLabel(b)}
              </th>
            ))}
            <th
              scope="col"
              className="font-medium text-muted-foreground px-3 py-2 text-xs uppercase tracking-wide whitespace-nowrap bg-muted"
            >
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ key, fromIdx, toIdx }) => (
            <tr key={key} className="border-t">
              <th
                scope="row"
                className="text-left font-medium px-3 py-1.5 align-middle whitespace-nowrap text-foreground sticky left-0 z-10 bg-background"
              >
                <span title={`${labels[fromIdx]} → ${labels[toIdx]}`}>
                  {truncate(labels[fromIdx], 18)} → {truncate(labels[toIdx], 18)}
                </span>
              </th>
              {Array.from({ length: bucketCount }).map((_, b) => (
                <td key={b} className="px-1.5 py-1">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    placeholder="0"
                    value={readCell(movements[key], b)}
                    onChange={(e) => onBucketChange(key, b, e.target.value)}
                    className="h-8 w-16 text-right tabular-nums"
                    aria-label={`${labels[fromIdx]} para ${labels[toIdx]}, hora ${b + 1}`}
                  />
                </td>
              ))}
              <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">
                {sumStringArray(movements[key]).toLocaleString("pt-BR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
