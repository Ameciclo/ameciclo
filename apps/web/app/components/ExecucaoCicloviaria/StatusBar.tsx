import { km, percent, SEGMENTS, type SegmentKm } from "./status";

/**
 * What became of the length the PDC planned: built as planned, built with another
 * typology, not built yet. The bar is proportional, and each part is written out under it.
 */
export function StatusBar(values: SegmentKm) {
  const total = SEGMENTS.reduce((sum, s) => sum + values[s.key], 0);
  const summary = SEGMENTS.map((s) => `${s.label}: ${km(values[s.key])}`).join("; ");

  return (
    <div>
      <div role="img" aria-label={`Do PDC. ${summary}`} className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
        {total > 0 &&
          SEGMENTS.map((s) =>
            values[s.key] > 0 ? (
              <div
                key={s.key}
                style={{ width: `${(values[s.key] / total) * 100}%`, backgroundColor: s.color }}
                className="h-full transition-[width] duration-700 ease-out starting:w-0 motion-reduce:transition-none"
              />
            ) : null,
          )}
      </div>
      <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-3">
        {SEGMENTS.map((s) => (
          <div key={s.key} className="flex items-start gap-2">
            <span className="mt-1 size-3 shrink-0 rounded-sm" style={{ backgroundColor: s.color }} aria-hidden="true" />
            <div>
              <dt className="text-sm leading-snug text-gray-600">{s.label}</dt>
              <dd className="font-semibold tabular-nums text-gray-900">
                {km(values[s.key])}
                <span className="font-normal text-gray-500"> ({total > 0 ? percent((values[s.key] / total) * 100) : "—"})</span>
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}
