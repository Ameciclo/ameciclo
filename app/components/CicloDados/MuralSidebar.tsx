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
    <aside className={`bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0 overflow-hidden flex flex-col shadow-sm ${
      isOpen ? 'w-80' : 'w-0'
    }`} style={{height: '100%'}}>
      
      {/* Header */}
      <div className={`items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 flex-shrink-0 ${
        isOpen ? 'flex' : 'hidden'
      }`}>
        <div>
          <h2 className="font-semibold text-gray-800 text-lg">Visualização</h2>
          <p className="text-sm text-gray-500">{visibleCards} de {totalCards} cards visíveis</p>
        </div>
        <button 
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
          title="Minimizar painel"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
        </button>
      </div>
      
      {/* Cards Toggle List */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Eye size={16} className="text-gray-500" />
                Controle de Cards
              </h3>
              
              {/* Quick Actions */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => {
                    cardToggles.forEach(card => {
                      if (!card.visible) onCardToggle(card.id);
                    });
                  }}
                  className="flex-1 px-3 py-2 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  Mostrar Todos
                </button>
                <button
                  onClick={() => {
                    cardToggles.forEach(card => {
                      if (card.visible) onCardToggle(card.id);
                    });
                  }}
                  className="flex-1 px-3 py-2 text-xs bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Ocultar Todos
                </button>
              </div>
            </div>

            {/* Card Toggle Buttons */}
            <div className="space-y-2">
              {cardToggles.map((card) => (
                <button
                  key={card.id}
                  onClick={() => onCardToggle(card.id)}
                  className={`w-full p-3 rounded-xl border-2 transition-all duration-200 group hover:shadow-md ${
                    card.visible 
                      ? `${card.color} border-opacity-100 shadow-sm` 
                      : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        card.visible 
                          ? 'bg-white bg-opacity-80' 
                          : 'bg-gray-200'
                      }`}>
                        {card.icon}
                      </div>
                      <div className="text-left">
                        <p className={`font-medium text-sm ${
                          card.visible ? '' : 'text-gray-500'
                        }`}>
                          {card.label}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`p-1.5 rounded-full transition-colors ${
                      card.visible 
                        ? 'bg-white bg-opacity-80 text-gray-700' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {card.visible ? (
                        <Eye size={14} />
                      ) : (
                        <EyeOff size={14} />
                      )}
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
          className="fixed top-1/2 -translate-y-1/2 left-4 z-[60] bg-white border-2 border-gray-200 rounded-full p-3 shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-200 group"
          title="Expandir controles de visualização"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
        </button>
      )}
    </aside>
  );
}