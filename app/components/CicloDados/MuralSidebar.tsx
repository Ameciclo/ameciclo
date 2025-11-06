import { Eye, EyeOff, AlertTriangle, Gauge, Users, User, BarChart3, PieChart, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface CardToggle {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  visible: boolean;
}

interface MuralSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  cardVisibility: Record<string, boolean>;
  onCardToggle: (cardId: string) => void;
}

export function MuralSidebar({
  isOpen,
  onToggle,
  cardVisibility,
  onCardToggle
}: MuralSidebarProps) {
  const cardToggles: CardToggle[] = [
    {
      id: 'sinistros',
      label: 'Sinistros Totais',
      icon: <AlertTriangle size={16} />,
      color: 'text-red-600 bg-red-50 border-red-200',
      visible: cardVisibility.sinistros ?? true
    },
    {
      id: 'velocidade',
      label: 'Velocidade Média',
      icon: <Gauge size={16} />,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      visible: cardVisibility.velocidade ?? true
    },
    {
      id: 'fluxo',
      label: 'Fluxo de Ciclistas',
      icon: <Users size={16} />,
      color: 'text-green-600 bg-green-50 border-green-200',
      visible: cardVisibility.fluxo ?? true
    },
    {
      id: 'mulheres',
      label: 'Percentual de Mulheres',
      icon: <User size={16} />,
      color: 'text-pink-600 bg-pink-50 border-pink-200',
      visible: cardVisibility.mulheres ?? true
    },
    {
      id: 'dados_gerais',
      label: 'Dados Gerais',
      icon: <BarChart3 size={16} />,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
      visible: cardVisibility.dados_gerais ?? true
    },
    {
      id: 'perfil',
      label: 'Perfil de Ciclistas',
      icon: <TrendingUp size={16} />,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      visible: cardVisibility.perfil ?? true
    },
    {
      id: 'raca',
      label: 'Ciclistas por Raça/Cor',
      icon: <PieChart size={16} />,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      visible: cardVisibility.raca ?? true
    },
    {
      id: 'analise',
      label: 'Análise Completa',
      icon: <BarChart3 size={16} />,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      visible: cardVisibility.analise ?? true
    }
  ];

  const visibleCards = cardToggles.filter(card => card.visible).length;
  const totalCards = cardToggles.length;

  return (
    <aside className={`bg-white border-r border-gray-100 transition-all duration-300 flex-shrink-0 overflow-hidden flex flex-col ${
      isOpen ? 'w-72' : 'w-0'
    }`} style={{height: '100%'}}>
      
      {/* Header */}
      <div className={`items-center justify-between p-6 border-b border-gray-100 flex-shrink-0 ${
        isOpen ? 'flex' : 'hidden'
      }`}>
        <div>
          <h2 className="font-medium text-gray-900 text-base">Controles</h2>
          <p className="text-xs text-gray-500 mt-1">{visibleCards}/{totalCards} visíveis</p>
        </div>
        <button 
          onClick={onToggle}
          className="p-1.5 hover:bg-gray-50 rounded-md transition-colors"
          title="Minimizar"
        >
          <ChevronLeft className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      
      {/* Cards Toggle List */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {/* Quick Actions */}
            <div className="flex gap-1 mb-4">
              <button
                onClick={() => {
                  cardToggles.forEach(card => {
                    if (!card.visible) onCardToggle(card.id);
                  });
                }}
                className="flex-1 px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded transition-colors"
              >
                Todos
              </button>
              <button
                onClick={() => {
                  cardToggles.forEach(card => {
                    if (card.visible) onCardToggle(card.id);
                  });
                }}
                className="flex-1 px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded transition-colors"
              >
                Nenhum
              </button>
            </div>

            {/* Card Toggle Buttons */}
            <div className="space-y-1">
              {cardToggles.map((card) => (
                <button
                  key={card.id}
                  onClick={() => onCardToggle(card.id)}
                  className={`w-full p-3 rounded-lg transition-all duration-200 text-left group ${
                    card.visible 
                      ? 'bg-gray-50 hover:bg-gray-100' 
                      : 'hover:bg-gray-25'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full transition-colors ${
                      card.visible ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`transition-colors ${
                        card.visible ? 'text-gray-700' : 'text-gray-400'
                      }`}>
                        {card.icon}
                      </div>
                      <span className={`text-sm font-medium transition-colors ${
                        card.visible ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {card.label}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Floating toggle button when minimized */}
      {!isOpen && (
        <button 
          onClick={onToggle}
          className="fixed top-1/2 -translate-y-1/2 left-4 z-[60] bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200"
          title="Expandir controles"
        >
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      )}
    </aside>
  );
}