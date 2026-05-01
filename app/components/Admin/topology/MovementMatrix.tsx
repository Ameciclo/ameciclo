import { Input } from "~/components/ui/input";
import { type Movements } from "./types";

type Props = {
  approaches: string[];
  movements: Movements;
  onChange: (key: string, value: string) => void;
};

/**
 * Square grid of from→to flow inputs. Diagonal is greyed-out (no U-turns
 * captured here). Headers reflect the user's approach labels.
 */
export function MovementMatrix({ approaches, movements, onChange }: Props) {
  const n = approaches.length;
  const headers = approaches.map((a, i) => a.trim() || `Aprox. ${i + 1}`);

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/40">
            <th className="text-left font-medium text-muted-foreground px-3 py-2 text-xs uppercase tracking-wide">
              De ↓ &nbsp;/&nbsp; Para →
            </th>
            {headers.map((h, j) => (
              <th
                key={j}
                className="font-medium text-foreground px-3 py-2 text-left whitespace-nowrap"
                title={h}
              >
                {truncate(h, 20)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {headers.map((h, i) => (
            <tr key={i} className="border-t">
              <th
                scope="row"
                className="text-left font-medium px-3 py-2 align-middle whitespace-nowrap text-foreground"
                title={h}
              >
                {truncate(h, 20)}
              </th>
              {Array.from({ length: n }).map((_, j) => {
                if (i === j) {
                  return (
                    <td key={j} className="px-3 py-2 text-center text-muted-foreground/50">
                      —
                    </td>
                  );
                }
                const key = `${i}-${j}`;
                return (
                  <td key={j} className="px-2 py-1.5">
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      placeholder="0"
                      value={movements[key] ?? ""}
                      onChange={(e) => onChange(key, e.target.value)}
                      className="h-8 w-24 text-right tabular-nums"
                      aria-label={`De ${h} para ${headers[j]}`}
                    />
                  </td>
                );
              })}
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
