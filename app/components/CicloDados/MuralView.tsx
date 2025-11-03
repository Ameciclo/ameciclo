export function MuralView() {
  return (
    <div className="h-full bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="bg-white rounded-lg shadow h-[200px] p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Sinistros Totais</h3>
              <p className="text-3xl font-bold text-gray-900">581</p>
              <p className="text-sm text-gray-600 flex items-center gap-1">Redução dos Fatais 12% <span className="text-green-500">▲</span></p>
              <p className="text-sm text-gray-600 flex items-center gap-1">Aumento nos não fatais 11% <span className="text-red-500">▼</span></p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ano anterior: 482</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow h-[200px] relative overflow-hidden">
            <div className="p-4 space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Velocidade média</h3>
              <p className="text-3xl font-bold text-gray-900">24km/h</p>
            </div>
            <div className="absolute inset-x-0 top-24 bottom-12 mx-4">
              <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
                  </linearGradient>
                </defs>
                <path d="M0,15 Q12,5 25,10 T50,8 T75,12 T100,10 L100,20 L0,20 Z" fill="url(#waveGradient)"/>
                <path d="M0,15 Q12,5 25,10 T50,8 T75,12 T100,10" stroke="#3b82f6" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-sm text-gray-500">Fluxo de automóveis: 65.214</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow h-[200px] p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Fluxo de ciclistas</h3>
              <p className="text-3xl font-bold text-gray-900">6,560</p>
              <div className="flex items-end justify-between h-8 gap-1">
                <div className="w-2 bg-green-400 h-6"></div>
                <div className="w-2 bg-green-500 h-4"></div>
                <div className="w-2 bg-green-600 h-8"></div>
                <div className="w-2 bg-green-500 h-3"></div>
                <div className="w-2 bg-green-400 h-5"></div>
                <div className="w-2 bg-green-600 h-7"></div>
                <div className="w-2 bg-green-500 h-2"></div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Horário de pico: 423</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow h-[200px]"></div>
        </div>
      </div>
    </div>
  );
}