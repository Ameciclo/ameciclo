// Um número grande com o que ele conta e, se couber, uma nota.
export function StatCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-ameciclo">{value}</p>
      {note && <p className="mt-1 text-sm leading-snug text-gray-600">{note}</p>}
    </div>
  );
}
