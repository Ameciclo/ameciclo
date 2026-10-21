import { useMemo, useState } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { diffDocuments } from "@ameciclo/db/document";
import { Badge } from "@ameciclo/ui/components/badge";
import { Button } from "@ameciclo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ameciclo/ui/components/dialog";
import { Textarea } from "@ameciclo/ui/components/textarea";
import { ChangeList } from "~/components/ChangeList";
import {
  contagemQueryKeys,
  revertContagem,
  revisionsQueryOptions,
} from "~/queries/contagens";

const KIND_LABEL = { import: "Importação", create: "Criação", edit: "Edição", revert: "Reversão" } as const;

const dateTime = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

export function HistoryPanel({ contagemId, currentVersion }: { contagemId: number; currentVersion: number }) {
  const queryClient = useQueryClient();
  const { data: revisions } = useSuspenseQuery(revisionsQueryOptions(contagemId));
  const [open, setOpen] = useState<number | null>(null);
  const [reverting, setReverting] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const diffs = useMemo(
    () =>
      new Map(
        revisions.map((rev, i) => {
          const previous = revisions[i + 1];
          return [rev.version, previous ? diffDocuments(previous.snapshot, rev.snapshot) : []] as const;
        }),
      ),
    [revisions],
  );

  const revert = useMutation({
    mutationFn: (toVersion: number) =>
      revertContagem({
        data: { id: contagemId, toVersion, expectedVersion: currentVersion, reason: reason.trim() || null },
      }),
    onSuccess: async (result) => {
      if (!result.ok) {
        setError(
          result.code === "conflict"
            ? `Esta contagem foi alterada por ${result.lastAuthor ?? "outra pessoa"}. Recarregue a página.`
            : result.problems.join(" "),
        );
        return;
      }
      await Promise.all(contagemQueryKeys(contagemId).map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      setReverting(null);
      setReason("");
      setError(null);
    },
  });

  const target = revisions.find((r) => r.version === reverting);

  return (
    <>
      <ul className="divide-y text-sm">
        {revisions.map((rev) => {
          const changes = diffs.get(rev.version) ?? [];
          const isOpen = open === rev.version;
          return (
            <li key={rev.id} className="py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">v{rev.version}</span>
                <Badge variant="outline">{KIND_LABEL[rev.kind]}</Badge>
                {rev.version === currentVersion && <Badge variant="secondary">atual</Badge>}
                <span className="text-muted-foreground">
                  {rev.author} · {dateTime.format(rev.createdAt)}
                </span>
                {rev.revertedFromVersion !== null && (
                  <span className="text-muted-foreground">volta à v{rev.revertedFromVersion}</span>
                )}
                <span className="ml-auto flex gap-2">
                  {changes.length > 0 && (
                    <Button size="sm" variant="ghost" onClick={() => setOpen(isOpen ? null : rev.version)}>
                      {isOpen ? "Ocultar" : `${changes.length} alterações`}
                    </Button>
                  )}
                  {rev.version !== currentVersion && (
                    <Button size="sm" variant="outline" onClick={() => setReverting(rev.version)}>
                      Reverter para esta
                    </Button>
                  )}
                </span>
              </div>
              {rev.reason && <p className="mt-1 text-muted-foreground">“{rev.reason}”</p>}
              {isOpen && (
                <div className="mt-3 rounded-md border bg-muted/30 p-3">
                  <ChangeList changes={changes} />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <Dialog open={reverting !== null} onOpenChange={(o) => !o && setReverting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reverter para a v{reverting}</DialogTitle>
            <DialogDescription>
              Isso cria uma nova versão com o conteúdo da v{reverting}. Nada é apagado do histórico.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motivo (opcional)"
            aria-label="Motivo"
          />
          {target && <p className="text-xs text-muted-foreground">Versão de {dateTime.format(target.createdAt)} por {target.author}.</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReverting(null)}>
              Cancelar
            </Button>
            <Button disabled={revert.isPending || reverting === null} onClick={() => reverting !== null && revert.mutate(reverting)}>
              {revert.isPending ? "Revertendo..." : "Reverter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
