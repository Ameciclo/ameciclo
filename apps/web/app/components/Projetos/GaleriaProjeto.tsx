import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@ameciclo/ui/components/dialog';

// A galeria de imagens de um projeto: abre numa janela (Dialog do shadcn), troca de imagem pelos botões ou pelas setas do
// teclado e amplia com o botão de zoom (a imagem ampliada rola dentro da janela). Quem a usa a recria (`key`) a cada
// imagem aberta, então o índice inicial não precisa ser sincronizado depois.

type GalleryImage = { id?: string | number; url: string; caption?: string };

interface GaleriaProjetoProps {
  images: GalleryImage[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export function GaleriaProjeto({ images, isOpen, onClose, initialIndex = 0 }: GaleriaProjetoProps) {
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);

  if (images.length === 0) return null;
  const image = images[index] ?? images[0];

  const go = (to: number) => {
    setIndex((to + images.length) % images.length);
    setZoomed(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="h-[90vh] max-w-5xl gap-2 p-3"
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') go(index - 1);
          if (event.key === 'ArrowRight') go(index + 1);
        }}
      >
        <DialogTitle className="sr-only">Galeria de imagens do projeto</DialogTitle>
        <DialogDescription className="sr-only">
          Imagem {index + 1} de {images.length}. Use as setas para trocar de imagem.
        </DialogDescription>

        <div className="min-h-0 flex-1 overflow-auto rounded-md bg-gray-100">
          <img
            src={image.url}
            alt={image.caption ?? `Imagem ${index + 1} do projeto`}
            className={zoomed ? 'max-w-none' : 'mx-auto h-full w-full object-contain'}
            style={zoomed ? { width: '200%' } : undefined}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 flex-1 truncate text-sm text-gray-600">{image.caption}</p>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => go(index - 1)} className="rounded-md p-2 hover:bg-gray-100" aria-label="Imagem anterior">
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <span className="min-w-12 text-center text-sm tabular-nums text-gray-600">
              {index + 1} / {images.length}
            </span>
            <button type="button" onClick={() => go(index + 1)} className="rounded-md p-2 hover:bg-gray-100" aria-label="Próxima imagem">
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setZoomed(!zoomed)}
              className="ml-2 rounded-md p-2 hover:bg-gray-100"
              aria-label={zoomed ? 'Reduzir a imagem' : 'Ampliar a imagem'}
              aria-pressed={zoomed}
            >
              {zoomed ? <ZoomOut className="size-5" aria-hidden="true" /> : <ZoomIn className="size-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
