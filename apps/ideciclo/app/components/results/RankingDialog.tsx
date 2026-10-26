import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@ameciclo/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@ameciclo/ui/components/dialog";
import type { RankingReadiness } from "~/lib/ideciclo/results-view";

// Asked before a city is released to the public ranking: what is mandatory and what is only recommended.
export function RankingDialog({
  open,
  onOpenChange,
  readiness,
  saving,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readiness: RankingReadiness;
  saving: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Liberar cidade no ranking</DialogTitle>
          <DialogDescription className="leading-6">
            Antes de publicar, confira o que já está pronto e o que ainda pode ser ajustado. A cidade só entra no ranking público quando existir pelo menos um formulário salvo no
            banco.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">Pendências obrigatórias para aparecer</p>
            <div className="mt-3 space-y-2">
              {readiness.mandatory.map((item) => (
                <div key={item.label} className="flex gap-3 text-sm text-amber-900">
                  <CheckCircle2 className={`mt-0.5 size-4 flex-none ${item.ok ? "text-emerald-600" : "text-amber-600"}`} />
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-amber-800">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Pendências não obrigatórias, mas recomendadas</p>
            <div className="mt-3 space-y-3">
              {readiness.optional.map((item) => (
                <div key={item.label} className="flex gap-3 text-sm text-slate-800">
                  <AlertTriangle className="mt-0.5 size-4 flex-none text-amber-600" />
                  <div>
                    <div className="font-medium">
                      {item.label}: {item.count}
                    </div>
                    <div className="text-slate-600">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              readiness.readyToAppear ? "border border-emerald-200 bg-emerald-50 text-emerald-900" : "border border-rose-200 bg-rose-50 text-rose-900"
            }`}
          >
            {readiness.readyToAppear
              ? "A cidade já tem o mínimo para aparecer no ranking. As pendências acima são recomendações para publicar com mais segurança."
              : "Sem pelo menos um formulário salvo no banco, a cidade não vai aparecer no ranking mesmo após a liberação."}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={onConfirm} disabled={saving}>
            {saving ? "Salvando..." : "Confirmar liberação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
