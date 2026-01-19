import { useEffect, useRef } from 'react';

interface Street {
  id: string;
  name: string;
  distance: number;
}

interface StreetSelectionModalProps {
  isOpen: boolean;
  streets: Street[];
  onSelectStreet: (street: Street) => void;
  onClose: () => void;
  clickPosition: { x: number; y: number };
}

export function StreetSelectionModal({ 
  isOpen, 
  streets, 
  onSelectStreet, 
  onClose, 
  clickPosition 
}: StreetSelectionModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && firstButtonRef.current) {
      firstButtonRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement as HTMLElement;

        if (e.shiftKey) {
          if (activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="street-modal-title"
      className="fixed bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50 min-w-48"
      style={{
        left: clickPosition.x,
        top: clickPosition.y,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <div className="mb-2">
        <h3 id="street-modal-title" className="text-sm font-medium text-gray-800">Selecione uma via:</h3>
      </div>
      <div className="space-y-1" role="list">
        {streets.map((street, index) => (
          <button
            key={street.id}
            ref={index === 0 ? firstButtonRef : null}
            onClick={() => onSelectStreet(street)}
            className="w-full text-left px-2 py-1 text-xs hover:bg-blue-50 rounded transition-colors"
            aria-label={`Selecionar via ${street.name}, distância ${street.distance} metros`}
          >
            <div className="font-medium">{street.name}</div>
            <div className="text-gray-500">{street.distance}m</div>
          </button>
        ))}
      </div>
      <button
        onClick={onClose}
        className="mt-2 w-full px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
        aria-label="Cancelar seleção de via"
      >
        Cancelar
      </button>
    </div>
  );
}