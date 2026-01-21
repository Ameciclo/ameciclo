import { pointData } from "typings";

interface PointDetailsModalProps {
  point: pointData | null;
  onClose: () => void;
}

export function PointDetailsModal({ point, onClose }: PointDetailsModalProps) {
  if (!point) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className={`px-6 py-4 text-white rounded-t-lg ${
          point.type === 'prefeitura' ? 'bg-gradient-to-r from-red-500 to-red-600' :
          'bg-gradient-to-r from-teal-500 to-teal-600'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{point.popup?.name}</h3>
            <button 
              onClick={onClose}
              className="text-white hover:bg-black hover:bg-opacity-20 rounded-full p-1 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
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
      </div>
    </div>
  );
}
