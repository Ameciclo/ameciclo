import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@ameciclo/ui/components/dialog';
import type { Ameciclista } from '~/queries/quemsomos';

type AmeCiclistaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  ameciclista: Ameciclista | null;
};

export default function AmeCiclistaModal({ isOpen, onClose, ameciclista }: AmeCiclistaModalProps) {
  if (!ameciclista) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-6">
        <div className="flex flex-col items-center">
          {ameciclista.media?.url ? (
            <img src={ameciclista.media.url} alt={ameciclista.name ?? ""} className="mb-4 h-64 w-64 rounded-full object-cover" />
          ) : null}
          <DialogTitle className="mb-2 text-2xl font-bold text-gray-900">{ameciclista.name}</DialogTitle>
          {ameciclista.bio ? (
            <DialogDescription className="text-center text-sm leading-relaxed text-gray-700">{ameciclista.bio}</DialogDescription>
          ) : (
            <DialogDescription className="sr-only">Perfil de {ameciclista.name}</DialogDescription>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
