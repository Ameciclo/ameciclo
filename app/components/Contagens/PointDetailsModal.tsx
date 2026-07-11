import { Link } from "@tanstack/react-router";
import { pointData } from "typings";

interface PointDetailsModalProps {
  point: pointData | null;
  onClose: () => void;
}

export function PointDetailsModal({ point, onClose }: PointDetailsModalProps) {
  if (!point) return null;

  const counts = point.popup?.counts || [];
  const isAmeciclo = point.type !== 'prefeitura';
  const latestCount = counts[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className={`px-6 py-4 text-white rounded-t-lg sticky top-0 z-10 ${
          point.type === 'prefeitura' ? 'bg-linear-to-r from-red-500 to-red-600' :
          'bg-linear-to-r from-teal-500 to-teal-600'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{point.popup?.name}</h3>
            <button 
              onClick={onClose}
              className="text-white hover:bg-black/20 rounded-full p-1 transition-colors"
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

            {isAmeciclo && counts.length > 1 && (
              <div className="border-t pt-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Todas as contagens neste ponto</div>
                <div className="space-y-2">
                  {counts.map((count: any, i: number) => (
                    <Link
                      key={i}
                      to="/dados/contagens/$slug"
                      params={{ slug: count.slug }}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        i === 0 ? 'bg-teal-50 border border-teal-200' : 'bg-gray-50 hover:bg-gray-100 border border-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">{count.date}</span>
                        {i === 0 && (
                          <span className="text-xs bg-teal-500 text-white px-2 py-0.5 rounded-full">mais recente</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">{count.total_cyclists} ciclistas</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {isAmeciclo && counts.length > 1 && (
              <div className="text-center pt-1">
                <Link
                  to="/dados/contagens/compare/$slugs"
                  params={{ slugs: counts.map((c: any) => c.slug).join("&") }}
                  className="text-sm text-ameciclo hover:underline font-medium"
                >
                  Comparar todas as contagens deste ponto →
                </Link>
              </div>
            )}

            {isAmeciclo && counts.length <= 1 && point.popup?.slug && (
              <div className="text-center pt-1">
                <Link
                  to="/dados/contagens/$slug"
                  params={{ slug: point.popup.slug }}
                  className="text-sm text-ameciclo hover:underline font-medium"
                >
                  Ver página completa da contagem →
                </Link>
              </div>
            )}
            
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
