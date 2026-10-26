import { Button } from "@ameciclo/ui/components/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ameciclo/ui/components/table";
import { formatKm } from "~/lib/segment-styles";
import type { SegmentItem } from "~/queries/assessment";

// Segments removed in this city; nothing is lost until someone deletes the city.
export function TrashPanel({ deleted, busy, onRestore }: { deleted: SegmentItem[]; busy: boolean; onRestore: (ids: string[]) => void }) {
  return (
    <div className="rounded-md border bg-muted/20 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase text-muted-foreground">Lixeira de segmentos</h3>
        {deleted.length > 0 && (
          <Button variant="outline" size="sm" disabled={busy} onClick={() => onRestore(deleted.map((s) => s.id))}>
            Restaurar todos
          </Button>
        )}
      </div>
      {deleted.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum segmento removido nesta cidade.</p>
      ) : (
        <div className="max-h-56 overflow-auto rounded-md border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Segmento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">km</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deleted.map((segment) => (
                <TableRow key={segment.id}>
                  <TableCell>{segment.name}</TableCell>
                  <TableCell>{segment.type}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatKm(segment.km)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" disabled={busy} onClick={() => onRestore([segment.id])}>
                      Restaurar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
