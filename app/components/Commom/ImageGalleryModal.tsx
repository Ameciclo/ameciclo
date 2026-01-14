import { useState, useEffect } from 'react';
import { useFocusTrap } from '~/hooks/useFocusTrap';

interface Image {
  id?: string | number;
  url: string;
  caption?: string;
}

interface ImageGalleryModalProps {
  images: Image[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export default function ImageGalleryModal({ 
  images, 
  isOpen, 
  onClose, 
  initialIndex = 0 
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const modalRef = useFocusTrap(isOpen);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
          break;
        case 'ArrowRight':
          setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, onClose]);

  if (!isOpen) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div ref={modalRef} className="relative max-w-7xl max-h-full p-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 text-3xl"
          aria-label="Fechar galeria"
        >
          ×
        </button>

        <div className="flex items-center justify-center h-full">
          <img
            src={currentImage.url}
            alt={currentImage.caption || `Imagem ${currentIndex + 1}`}
            className="max-w-full max-h-[90vh] object-contain"
          />
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 text-4xl"
              aria-label="Imagem anterior"
            >
              ‹
            </button>
            <button
              onClick={() => setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 text-4xl"
              aria-label="Próxima imagem"
            >
              ›
            </button>
          </>
        )}

        {currentImage.caption && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center bg-black bg-opacity-50 px-4 py-2 rounded">
            {currentImage.caption}
          </div>
        )}

        <div className="absolute bottom-4 right-4 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}