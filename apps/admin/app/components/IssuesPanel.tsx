import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { contagemQueryKeys, setIssueStatus } from "~/queries/contagens";

type Issue = {
  id: number;
  severity: "info" | "warning" | "error";
  code: string;
  message: string;
  origin: "import" | "validation";
  status: "open" | "resolved" | "ignored";
  resolvedBy: string | null;
  resolvedAt: Date | null;
  resolutionNote: string | null;
};

const STATUS_LABEL = { open: "aberto", resolved: "resolvido", ignored: "ignorado" } as const;
const dateTime = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
const SEVERITY_RANK = { error: 0, warning: 1, info: 2 } as const;

export function IssuesPanel({ contagemId, issues }: { contagemId: number; issues: Issue[] }) {
  const queryClient = useQueryClient();
  const [target, setTarget] = useState<{ issue: Issue; status: "resolved" | "ignored" } | null>(null);
  const [note, setNote] = useState("");

  const update = useMutation({
    mutationFn: (vars: { issueId: number; status: "open" | "resolved" | "ignored"; note: string | null }) =>
      setIssueStatus({ data: vars }),
    onSuccess: async () => {
      await Promise.all(contagemQueryKeys(contagemId).map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      setTarget(null);
      setNote("");
    },
  });

  const sorted = [...issues].sort(
    (a, b) =>
      Number(a.status !== "open") - Number(b.status !== "open") || SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity],
  );

  return (
    <>
      <ul className="divide-y text-sm">
        {sorted.map((issue) => (
          <li key={issue.id} className={`flex flex-wrap items-start gap-3 py-3 ${issue.status === "open" ? "" : "opacity-60"}`}>
            <Badge variant={issue.severity === "info" ? "outline" : "secondary"}>{issue.severity}</Badge>
            <div className="min-w-0 flex-1">
              <p>
                <span className="font-mono text-xs text-muted-foreground">{issue.code}</span> {issue.message}
              </p>
              {issue.status !== "open" && (
                <p className="text-xs text-muted-foreground">
                  {STATUS_LABEL[issue.status]} por {issue.resolvedBy}
                  {issue.resolvedAt ? ` · ${dateTime.format(issue.resolvedAt)}` : ""}
                  {issue.resolutionNote ? ` · “${issue.resolutionNote}”` : ""}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {issue.status === "open" ? (
                <>
                  <Button size="sm" variant="outline" onClick={() => setTarget({ issue, status: "resolved" })}>
                    Resolver
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setTarget({ issue, status: "ignored" })}>
                    Ignorar
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={update.isPending}
                  onClick={() => update.mutate({ issueId: issue.id, status: "open", note: null })}
                >
                  Reabrir
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={target !== null} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{target?.status === "resolved" ? "Marcar como resolvido" : "Ignorar pendência"}</DialogTitle>
            <DialogDescription>{target?.issue.message}</DialogDescription>
          </DialogHeader>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nota (opcional)"
            aria-label="Nota"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)}>
              Cancelar
            </Button>
            <Button
              disabled={update.isPending}
              onClick={() => target && update.mutate({ issueId: target.issue.id, status: target.status, note: note.trim() || null })}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
