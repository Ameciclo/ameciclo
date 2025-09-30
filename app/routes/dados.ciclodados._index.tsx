import { useState } from 'react';
import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";

export default function CicloDados() {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  const chartData = [
    {
      id: 1,
      title: "Av. Gov. Agamenon Magalhães",
      value: "2.846",
      chart: (
        <svg className="w-full h-16" viewBox="0 0 200 60">
          <path d="M0,60 Q10,50 20,45 Q30,30 40,35 Q50,40 60,25 Q70,20 80,30 Q90,35 100,20 Q110,15 120,22 Q130,25 140,18 Q150,10 160,25 Q170,30 180,22 Q190,20 200,25 L200,60 Z" 
            fill="#1d4ed8" fillOpacity="0.3" stroke="#1d4ed8" strokeWidth="2"/>
        </svg>
      )
    },
    {
      id: 2,
      title: "Sinistros com vítima",
      value: "1.323",
      chart: (
        <svg className="w-full h-16" viewBox="0 0 200 60">
          <rect x="20" y="40" width="15" height="20" fill="#1d4ed8"/>
          <rect x="45" y="30" width="15" height="30" fill="#1d4ed8"/>
          <rect x="70" y="35" width="15" height="25" fill="#1d4ed8"/>
          <rect x="95" y="25" width="15" height="35" fill="#1d4ed8"/>
          <rect x="120" y="45" width="15" height="15" fill="#1d4ed8"/>
          <rect x="145" y="20" width="15" height="40" fill="#1d4ed8"/>
          <rect x="170" y="38" width="15" height="22" fill="#1d4ed8"/>
        </svg>
      )
    },
    {
      id: 3,
      title: "Infra. cicloviária executada",
      value: "78%",
      chart: (
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div className="bg-blue-700 h-4 rounded-full transition-all duration-500" style={{width: '78%'}}></div>
        </div>
      )
    }
  ];

  const layers = [
    "Infraestrutura cicloviária",
    "Contagens de ciclistas", 
    "Plano Diretor Cicloviário"
  ];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{height: '100vh', maxHeight: '100vh'}}>
      {/* Header */}
      <header className="flex items-center bg-teal-700 text-white px-4 py-2 flex-shrink-0" style={{minHeight: 'auto'}}>
        <div className="flex items-center">
          <a href="/dados" className="hover:opacity-80 transition-opacity">
            <img src="/ciclodados/Logo.svg" alt="CicloDados" className="h-12" />
          </a>
        </div>

        <div className="flex-1 flex items-center justify-center space-x-4">
          <button className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition-colors">
            Visualizando no mapa
          </button>
          <button className="bg-gray-200 text-black px-3 py-1 rounded hover:bg-gray-300 transition-colors">
            Visualizar no mural
          </button>
          <input
            type="text"
            placeholder="Buscar local, bairro, rua etc"
            className="px-3 py-1 rounded border text-black focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden" style={{height: 'calc(100vh - 64px)'}}>
        {/* Left Sidebar */}
        <aside className={`bg-gray-50 border-r transition-all duration-300 flex-shrink-0 overflow-hidden ${
          leftSidebarOpen ? 'w-72' : 'w-12'
        }`} style={{height: '100%'}}>
          <div className="h-full overflow-y-auto">
            <div className={`flex items-center justify-between p-3 ${
              leftSidebarOpen ? 'mb-4' : 'mb-0 flex-col gap-2'
            }`}>
              {leftSidebarOpen && <h2 className="font-semibold text-gray-800">Camadas de dados</h2>}
              <button 
                onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                className={`hover:bg-gray-200 rounded transition-colors ${
                  leftSidebarOpen ? 'p-1' : 'p-2 w-8 h-8 flex items-center justify-center'
                }`}
                title={leftSidebarOpen ? 'Minimizar' : 'Expandir'}
              >
                <svg className={`w-4 h-4 transition-transform ${
                  leftSidebarOpen ? '' : 'rotate-180'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
            
            {leftSidebarOpen && (
              <div className="px-3 pb-3">
                <div className="space-y-2">
                  {layers.map((layer, index) => (
                    <div key={index} className="p-2 bg-white rounded border hover:bg-gray-50 cursor-pointer transition-colors">
                      {layer}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Map */}
        <main className="flex-1 relative">
          <div style={{height: 'calc(100vh - 64px)'}}>
            <AmecicloMap pointsData={[]} controlPanel={[]} width="100%" height="100%" />
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className={`bg-white border-l flex flex-col transition-all duration-300 flex-shrink-0 overflow-hidden ${
          rightSidebarOpen ? 'w-80' : 'w-12'
        }`} style={{height: '100%'}}>
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className={`bg-blue-500 flex items-center justify-between ${
              rightSidebarOpen ? 'p-3 mb-4' : 'p-2 m-2 flex-col gap-2'
            }`}>
              {rightSidebarOpen && <h2 className="font-semibold text-white">Dados em gráficos</h2>}
              <button 
                onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                className={`hover:bg-white hover:bg-opacity-20 rounded text-white transition-colors ${
                  rightSidebarOpen ? 'p-1' : 'p-2 w-8 h-8 flex items-center justify-center'
                }`}
                title={rightSidebarOpen ? 'Minimizar' : 'Expandir'}
              >
                <svg className={`w-4 h-4 transition-transform ${
                  rightSidebarOpen ? '' : 'rotate-180'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {rightSidebarOpen && (
              <div className="px-3 pb-3">
                <div className="space-y-4">
                  {chartData.map((item) => (
                    <div key={item.id} className="border rounded-lg p-3 shadow-sm bg-gray-50">
                      <h3 className="font-medium text-gray-800 mb-1">{item.title}</h3>
                      <p className="text-2xl font-bold text-black mb-2">{item.value}</p>
                      {item.chart}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Floating Chat */}
      <div className="fixed bottom-6 right-6 z-50">
        {chatOpen && (
          <div className="mb-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 rounded-xl text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">AI</span>
                  </div>
                  <span className="font-medium text-gray-700">Assistente Ameciclo</span>
                </div>
                Olá! Como posso ajudar você com os dados de mobilidade urbana?
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder="Digite sua pergunta..."
                  className="flex-1 p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <button className="p-3 text-gray-400 hover:text-pink-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
        
        <button 
          onClick={() => setChatOpen(!chatOpen)}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center overflow-hidden group hover:pr-4"
        >
          <div className="p-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="whitespace-nowrap font-medium pr-0 group-hover:pr-3 w-0 group-hover:w-auto opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden">
            IA Ameciclo
          </span>
        </button>
      </div>
    </div>
  );
}