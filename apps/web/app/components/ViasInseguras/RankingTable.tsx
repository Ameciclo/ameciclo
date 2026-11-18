// O ranking das vias: a tabela compartilhada dos observatórios (shadcn Table + TanStack Table v9), com busca pelo nome da via.
import { useMemo } from "react";
import type { UnsafeStreet } from "@ameciclo/db";
import { MIN_RATE_CALLS, MIN_RATE_KM, viaSlug } from "~/queries/dados.vias-inseguras";
import { DataTable, type DataColumn } from "../Observatorio/DataTable";
import { km, n, pct, perKm } from "./labels";

const FIRST_ROWS = 20;

interface Props {
  streets: UnsafeStreet[];
  identified: number;
  selectedKey: string | undefined;
  onSelect: (slug: string) => void;
}

export function RankingTable({ streets, identified, selectedKey, onSelect }: Props) {
  const columns = useMemo<DataColumn<UnsafeStreet>[]>(
    () => [
      // A posição é a do ranking por chamados: não muda ao ordenar, para ver como a ordem se move.
      { accessorKey: "rank", header: "#", meta: { align: "right" }, cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{row.original.rank}</span> },
      {
        accessorKey: "name",
        header: "Via",
        sortingFn: "alphanumeric",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => onSelect(viaSlug(row.original.name))}
            className={`text-left underline-offset-2 hover:underline ${row.original.key === selectedKey ? "font-semibold text-ameciclo" : "text-ameciclo"}`}
          >
            {row.original.name}
          </button>
        ),
      },
      { accessorKey: "calls", header: "Chamados", meta: { align: "right" }, cell: ({ row }) => <span className="font-semibold tabular-nums">{n(row.original.calls)}</span> },
      { id: "share", header: "% do total", meta: { align: "right", hideBelowMd: true }, accessorFn: (s) => s.calls, enableSorting: false, cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{pct(row.original.calls, identified)}</span> },
      // Sem extensão (ou, no "por km", via curta demais): vazio, e sempre no fim, qualquer que seja o sentido.
      { id: "length", header: "Extensão (km)", meta: { align: "right", hideBelowMd: true }, accessorFn: (s) => s.lengthKm ?? undefined, sortUndefined: "last", cell: ({ row }) => <span className="tabular-nums">{km(row.original.lengthKm)}</span> },
      { id: "perKm", header: "Por km", meta: { align: "right" }, accessorFn: (s) => s.callsPerKm ?? undefined, sortUndefined: "last", cell: ({ row }) => <span className="tabular-nums">{perKm(row.original.callsPerKm)}</span> },
    ],
    [identified, selectedKey, onSelect],
  );

  return (
    <div className="space-y-3">
      <DataTable
        data={streets}
        columns={columns}
        initialSort={{ id: "calls", desc: true }}
        search={{ placeholder: "Buscar via", text: (s) => s.name }}
        isSelected={(s) => s.key === selectedKey}
        emptyText="Nenhuma via encontrada."
        collapsedRows={FIRST_ROWS}
      />
      <p className="text-xs text-muted-foreground">
        O “#” é a posição no ranking por chamados e não muda ao ordenar. “Por km” só aparece para vias de {km(MIN_RATE_KM)} km ou mais e com {MIN_RATE_CALLS} chamados ou mais: numa via curta, poucos chamados dão um número enorme. Essas vias, e as sem extensão na malha, ficam no fim quando a ordem é por extensão ou por km.
      </p>
    </div>
  );
}
