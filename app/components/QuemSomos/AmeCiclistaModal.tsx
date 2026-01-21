import { useFocusTrap } from '~/hooks/useFocusTrap';
import { useEffect } from 'react';

type AmeCiclistaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  ameciclista: {
    name: string;
    bio?: string;
    media?: { url: string };
  } | null;
};

export default function AmeCiclistaModal({
  isOpen,
  onClose,
  ameciclista,
}: AmeCiclistaModalProps) {
  const modalRef = useFocusTrap(isOpen);
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);
  
  if (!isOpen || !ameciclista) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-labelledby="ameciclista-modal-title"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative outline-none"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-ameciclo focus-visible:ring-offset-2"
          onClick={onClose}
          aria-label="Fechar modal"
        >
          &times;
        </button>
        <div className="flex flex-col items-center">
          {ameciclista.media?.url && (
            <img
              src={ameciclista.media.url}
              alt={ameciclista.name}
              className="w-64 h-64 object-cover rounded-full mb-4"
            />
          )}
          <h2 className="text-2xl font-bold text-gray-900 mb-2" id="ameciclista-modal-title">
            {ameciclista.name}
          </h2>
          {ameciclista.bio && (
            <p className="text-gray-700 text-center text-sm leading-relaxed">
              {ameciclista.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
