import { METRICS, type PublicCount } from "@ameciclo/db/shared";
import { Link } from "@tanstack/react-router";
import { contagemSlug } from "@ameciclo/db/slug";
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
export function MetricsTable({ places }: { places: Place[] }) {
  return (
    <div className="mb-8 overflow-x-auto rounded-lg bg-white shadow-lg">
      <table className="min-w-full text-sm">
        <caption className="px-4 pt-4 text-left text-xs text-gray-500">
          Variação em relação à primeira contagem ({compareLabel({ ...places[0].location, ...places[0].selected })}). Em verde, o maior valor de cada linha; em vermelho, o menor.
        </caption>
        <thead>
          <tr className="border-b border-gray-200">
            <th scope="col" className="sticky left-0 bg-white px-4 py-3 text-left font-medium text-gray-600">
              Métrica
            </th>
            {places.map(({ location, selected, canonical }, index) => (
              <th key={canonical} scope="col" className="min-w-40 px-4 py-3 text-left align-top">
                <span className="flex items-start gap-2">
                  <span aria-hidden className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: colorAt(index).hex }} />
                  <span>
                    <Link
                      to="/dados/contagens/$slug"
                      params={{ slug: contagemSlug(location.slug, selected) }}
                      className="font-semibold text-gray-800 hover:underline"
                    >
                      {location.name}
                      {selected.variant && <span className="block font-medium">{selected.variant}</span>}
                    </Link>
                    <span className="block text-xs font-normal text-gray-500">{IntlDateStr(selected.date)}</span>
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
              <tr key={row.key} className="border-b border-gray-100 last:border-0">
                <th scope="row" className="sticky left-0 bg-white px-4 py-3 text-left font-medium text-gray-700">
                  {row.label}
                </th>
                {places.map(({ selected, canonical }, index) => {
                  const value = values[index];
                  const delta = index === 0 ? null : deltaAgainst(value, values[0]);
                  const tone = !spread ? "" : value === max ? "bg-green-50 font-semibold text-green-800" : value === min ? "bg-red-50 text-red-800" : "";
                  return (
                    <td key={canonical} className={`px-4 py-3 ${tone}`}>
                      <span className="block text-base">{IntlNumber(value)}</span>
                      <span className="block text-xs text-gray-500">
                        {row.key === "total" || row.key === "peak" ? "" : `${shareFormat.format(selected.total_cyclists > 0 ? value / selected.total_cyclists : 0)} do total`}
                        {delta !== null && (
                          <span className={`ml-1 ${delta > 0 ? "text-green-700" : delta < 0 ? "text-red-600" : ""}`}>{`${percentFormat.format(delta)} vs. 1ª`}</span>
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
