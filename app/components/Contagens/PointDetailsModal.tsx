import { pointData } from "typings";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { X } from 'lucide-react';

interface PointDetailsModalProps {
  point: pointData | null;
  onClose: () => void;
}

export function PointDetailsModal({ point, onClose }: PointDetailsModalProps) {
  if (!point) return null;

  return (
    <Dialog open={!!point} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        onClose={onClose}
        className="max-w-md p-0 overflow-hidden"
      >
        <div className={`px-6 py-4 text-white ${
          point.type === 'prefeitura' ? 'bg-gradient-to-r from-red-500 to-red-600' :
          'bg-gradient-to-r from-teal-500 to-teal-600'
        }`}>
          <DialogHeader>
            <DialogTitle className="text-white">{point.popup?.name}</DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                point.type === 'prefeitura' ? 'bg-red-500' : 'bg-teal-500'
              }`}></div>
              <span className="text-2xl font-bold text-gray-900">{point.popup?.total} ciclistas</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Data</div>
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
