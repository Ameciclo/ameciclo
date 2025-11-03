import { chartData } from './utils/chartData';

interface RightSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  viewMode: 'map' | 'mural';
}

export function RightSidebar({ isOpen, onToggle, viewMode }: RightSidebarProps) {
  if (viewMode !== 'map') return null;

  return (
    <aside className={`bg-white border-l flex flex-col transition-all duration-300 flex-shrink-0 overflow-hidden ${
      isOpen ? 'w-80' : 'w-12'
    }`} style={{height: '100%'}}>
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className={`bg-blue-500 flex items-center justify-between ${
          isOpen ? 'p-3 mb-4' : 'p-2 m-2 flex-col gap-2'
        }`}>
          {isOpen && <h2 className="font-semibold text-white">Dados em gráficos</h2>}
          <button 
            onClick={onToggle}
            className={`hover:bg-white hover:bg-opacity-20 rounded text-white transition-colors ${
              isOpen ? 'p-1' : 'p-2 w-8 h-8 flex items-center justify-center'
            }`}
            title={isOpen ? 'Minimizar' : 'Expandir'}
          >
            <svg className={`w-4 h-4 transition-transform ${
              isOpen ? '' : 'rotate-180'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {isOpen && (
          <div className="px-3 pb-3">
            <div className="space-y-4">
              {chartData.map((item) => (
                <div key={item.id} className="border rounded-lg p-3 shadow-sm bg-gray-50">
                  <h3 className="font-medium text-gray-800 mb-1">{item.title}</h3>
                  <p className="text-2xl font-bold text-black mb-2">{item.value}</p>
                  {item.chart}
                  {item.description && <p className="text-xs text-gray-500 mt-2">{item.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}