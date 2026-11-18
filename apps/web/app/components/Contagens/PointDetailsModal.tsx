import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@ameciclo/ui/components/dialog";
import type { pointData } from "typings";
import { IntlNumber } from "~/services/utils";

interface PointDetailsModalProps {
  point: pointData | null;
  onClose: () => void;
}

export function PointDetailsModal({ point, onClose }: PointDetailsModalProps) {
  if (!point) return null;
  const isCity = point.type === "prefeitura";

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0">
        <div className={`px-6 py-4 pr-12 text-white ${isCity ? "bg-linear-to-r from-red-500 to-red-600" : "bg-linear-to-r from-teal-500 to-teal-600"}`}>
          <DialogTitle className="text-lg font-semibold">{point.popup?.name}</DialogTitle>
          <DialogDescription className="sr-only">Detalhes da contagem de ciclistas neste ponto</DialogDescription>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${isCity ? "bg-red-500" : "bg-teal-500"}`}></div>
              <span className="text-2xl font-bold text-gray-900">{IntlNumber(point.popup?.total ?? 0)} ciclistas</span>
              {point.popup?.note && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">{point.popup.note}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{point.popup?.year ? "Última contagem" : "Data"}</div>
                <div className="font-medium text-gray-900">{point.popup?.date}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Fonte</div>
                <div className="font-medium text-gray-900">{point.type === 'prefeitura' ? 'PCR' : 'Ameciclo'}</div>
              </div>
            </div>
            
            {point.popup?.obs && (
              <div className="border-t pt-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Observações</div>
                <div className="text-sm text-gray-700">{point.popup.obs}</div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
