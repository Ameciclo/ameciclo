import { useState, useEffect } from 'react';

interface Image {
  id?: string | number;
  url: string;
  caption?: string;
}

interface ImageGalleryWithZoomProps {
  images: Image[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export default function ImageGalleryWithZoom({ 
  images, 
  isOpen, 
  onClose, 
  initialIndex = 0 
}: ImageGalleryWithZoomProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
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
          resetZoom();
          break;
        case 'ArrowRight':
          setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
          resetZoom();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, onClose]);

  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const zoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  };

  const zoomOut = () => {
    setZoom(prev => {
      const newZoom = Math.max(prev / 1.2, 0.5);
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  };

  if (!isOpen) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-95">
      <div className="relative w-full h-full">
        {/* Botão fechar discreto */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 z-30 text-white hover:text-gray-300 text-2xl bg-black bg-opacity-40 hover:bg-opacity-60 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200"
          title="Fechar (ESC)"
        >
          ×
        </button>

        {/* Clique fora para fechar */}
        <div 
          className="absolute inset-0 z-10" 
          onClick={onClose}
        />

        {/* Controles de zoom */}
        <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              zoomIn();
            }}
            className="text-white hover:text-gray-300 text-2xl font-bold bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            title="Zoom In (+)"
          >
            +
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              zoomOut();
            }}
            className="text-white hover:text-gray-300 text-2xl font-bold bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            title="Zoom Out (-)"
          >
            −
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              resetZoom();
            }}
            className="text-white hover:text-gray-300 text-xs font-bold bg-black bg-opacity-50 rounded px-2 py-1"
            title="Reset Zoom"
          >
            1:1
          </button>
        </div>

        {/* Área da imagem */}
        <div 
          className="flex items-center justify-center w-full h-full overflow-hidden z-20 relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={currentImage.url}
            alt={currentImage.caption || `Imagem ${currentIndex + 1}`}
            className="max-w-none select-none"
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              maxHeight: zoom === 1 ? '90vh' : 'none',
              maxWidth: zoom === 1 ? '90vw' : 'none'
            }}
            draggable={false}
          />
        </div>

        {/* Navegação */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
                resetZoom();
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 text-white hover:text-gray-300 text-5xl font-bold bg-black bg-opacity-50 rounded-full w-14 h-14 flex items-center justify-center"
            >
              ‹
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
                resetZoom();
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 text-white hover:text-gray-300 text-5xl font-bold bg-black bg-opacity-50 rounded-full w-14 h-14 flex items-center justify-center"
            >
              ›
            </button>
          </>
        )}

        {/* Caption */}
        {currentImage.caption && (
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-40 text-white text-center bg-black bg-opacity-70 px-6 py-3 rounded-lg max-w-2xl">
            {currentImage.caption}
          </div>
        )}

        {/* Contador e zoom info */}
        <div className="absolute bottom-4 right-4 z-40 text-white text-sm bg-black bg-opacity-70 px-3 py-2 rounded-lg">
          <div>{currentIndex + 1} / {images.length}</div>
          <div className="text-xs opacity-75">Zoom: {Math.round(zoom * 100)}%</div>
        </div>

        {/* Instruções */}
        <div className="absolute bottom-4 left-4 z-40 text-white text-xs bg-black bg-opacity-70 px-3 py-2 rounded-lg max-w-xs">
          <div>← → Navegar</div>
          <div>+ − Zoom</div>
          <div>Scroll: Zoom</div>
          <div>Arrastar: Mover</div>
          <div>ESC: Fechar</div>
        </div>
      </div>
    </div>
  );
}