import { formatKm, STATUS, STATUS_ORDER, type WayStatus } from "~/lib/infra";

// Share of each execution status in a length, as a stacked bar.
export function StatusBar({ km }: { km: Record<WayStatus, number> }) {
  const sum = STATUS_ORDER.reduce((total, status) => total + km[status], 0);
  if (sum === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex h-2.5 w-40 overflow-hidden rounded-full bg-muted">
      {STATUS_ORDER.map((status) => (
        <div
          key={status}
          title={`${STATUS[status].label}: ${formatKm(km[status])} km`}
          style={{ width: `${(km[status] / sum) * 100}%`, backgroundColor: STATUS[status].color }}
        />
      ))}
    </div>
  );
}
