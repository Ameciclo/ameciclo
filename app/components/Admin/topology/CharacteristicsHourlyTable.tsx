import { Input } from "~/components/ui/input";
import { CHARACTERISTICS } from "~/admin/contagens/schema/contagem-data";
import { readCell, sumStringArray } from "~/admin/contagens/schema/nova-form";

type Props = {
  /** Canonical characteristic keys to render rows for, in display order. */
  keys: string[];
  characteristics: Record<string, string[]>;
  bucketCount: number;
  bucketLabel: (idx: number) => string;
  onBucketChange: (key: string, bucketIdx: number, value: string) => void;
};

export function CharacteristicsHourlyTable({
  keys,
  characteristics,
  bucketCount,
  bucketLabel,
  onBucketChange,
}: Props) {
  if (bucketCount <= 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Defina a sessão (início, término e granularidade) para entrar em modo por hora.
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
              Característica
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
          {keys.map((k) => {
            const meta = CHARACTERISTICS[k as keyof typeof CHARACTERISTICS];
            const label = meta?.label ?? k;
            return (
              <tr key={k} className="border-t">
                <th
                  scope="row"
                  className="text-left font-medium px-3 py-1.5 align-middle whitespace-nowrap text-foreground sticky left-0 z-10 bg-background"
                  title={label}
                >
                  {label}
                </th>
                {Array.from({ length: bucketCount }).map((_, b) => (
                  <td key={b} className="px-1.5 py-1">
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      placeholder="0"
                      value={readCell(characteristics[k], b)}
                      onChange={(e) => onBucketChange(k, b, e.target.value)}
                      className="h-8 w-16 text-right tabular-nums"
                      aria-label={`${label}, hora ${b + 1}`}
                    />
                  </td>
                ))}
                <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">
                  {sumStringArray(characteristics[k]).toLocaleString("pt-BR")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
