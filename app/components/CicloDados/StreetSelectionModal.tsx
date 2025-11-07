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
  if (!isOpen) return null;

  return (
    <div 
      className="fixed bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50 min-w-48"
      style={{
        left: clickPosition.x,
        top: clickPosition.y,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <div className="mb-2">
        <h3 className="text-sm font-medium text-gray-800">Selecione uma via:</h3>
      </div>
      <div className="space-y-1">
        {streets.map((street) => (
          <button
            key={street.id}
            onClick={() => onSelectStreet(street)}
            className="w-full text-left px-2 py-1 text-xs hover:bg-blue-50 rounded transition-colors"
          >
            <div className="font-medium">{street.name}</div>
            <div className="text-gray-500">{street.distance}m</div>
          </button>
        ))}
      </div>
      <button
        onClick={onClose}
        className="mt-2 w-full px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
      >
        Cancelar
      </button>
    </div>
  );
}