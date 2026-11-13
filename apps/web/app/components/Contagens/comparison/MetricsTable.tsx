import { METRICS, type PublicCount } from "@ameciclo/db/shared";
import { Link } from "@tanstack/react-router";
import { contagemSlug } from "@ameciclo/db/slug";
import { cn } from "@ameciclo/ui/lib/utils";
import type { Place } from "~/components/Contagens/CountsComparison";
import { IntlDateStr, IntlNumber } from "~/services/utils";
import { colorAt } from "./constants";
import { compareLabel, deltaAgainst } from "./selection";

type Row = { key: string; label: string; value: (count: PublicCount) => number };

const ROWS: Row[] = [
  { key: "total", label: "Total de ciclistas", value: (c) => c.total_cyclists },
  ...METRICS.filter((m) => m.key !== "motor").map((m) => ({ key: m.key, label: m.label, value: (c: PublicCount) => c.characteristics[m.key] })),
  { key: "peak", label: "Pico em 1h", value: (c) => c.max_hour_cyclists },
];

const percentFormat = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 0, signDisplay: "exceptZero" });
const shareFormat = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 });

// Rows are metrics, columns are counts (in the colors used everywhere else). Each value
// shows its change against the first count; the highest and lowest of a row are marked.
// On narrow screens the table scrolls sideways under a sticky metric column.
export function MetricsTable({ places }: { places: Place[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <table className="w-full min-w-max text-sm">
        <caption className="px-4 pt-4 text-left text-xs text-muted-foreground">
          Variação em relação à primeira contagem ({compareLabel({ ...places[0].location, ...places[0].selected })}). Em verde, o maior valor de cada linha; em vermelho, o menor.
        </caption>
        <thead>
          <tr className="border-b bg-accent/60">
            <th scope="col" className="sticky left-0 z-10 w-40 min-w-40 bg-accent px-4 py-3 text-left text-xs font-bold tracking-wider text-accent-foreground uppercase">
              Métrica
            </th>
            {places.map(({ location, selected, canonical }, index) => (
              <th key={canonical} scope="col" className="min-w-44 px-4 py-3 text-left align-top">
                <span className="flex items-start gap-2">
                  <span aria-hidden className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: colorAt(index).hex }} />
                  <span>
                    <Link
                      to="/dados/contagens/$slug"
                      params={{ slug: contagemSlug(location.slug, selected) }}
                      className="font-semibold text-foreground hover:underline"
                    >
                      {location.name}
                      {selected.variant && <span className="block font-medium text-muted-foreground">{selected.variant}</span>}
                    </Link>
                    <span className="block text-xs font-normal text-muted-foreground">{IntlDateStr(selected.date)}</span>
                  </span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => {
            const values = places.map((p) => row.value(p.selected));
            const max = Math.max(...values);
            const min = Math.min(...values);
            const spread = max !== min;
            return (
              <tr key={row.key} className="border-b last:border-0">
                <th scope="row" className={cn("sticky left-0 z-10 bg-card px-4 py-3 text-left font-medium", (row.key === "total" || row.key === "peak") && "font-bold")}>
                  {row.label}
                </th>
                {places.map(({ selected, canonical }, index) => {
                  const value = values[index];
                  const delta = index === 0 ? null : deltaAgainst(value, values[0]);
                  const tone = !spread ? "" : value === max ? "bg-green-50 font-semibold text-green-900" : value === min ? "bg-red-50 text-red-900" : "";
                  return (
                    <td key={canonical} className={cn("px-4 py-3", tone)}>
                      <span className="block text-base tabular-nums">{IntlNumber(value)}</span>
                      <span className="block text-xs text-muted-foreground">
                        {row.key === "total" || row.key === "peak" ? "" : `${shareFormat.format(selected.total_cyclists > 0 ? value / selected.total_cyclists : 0)} do total`}
                        {delta !== null && (
                          <span className={cn("ml-1 font-medium", delta > 0 && "text-green-700", delta < 0 && "text-red-700")}>{`${percentFormat.format(delta)} vs. 1ª`}</span>
                        )}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
