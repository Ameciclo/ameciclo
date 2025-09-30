export default function MapDashboard() {
  return (
    <div id="app-container" className="flex flex-col h-screen w-screen">
      {/* Header */}
      <header
        id="header"
        className="flex items-center justify-between bg-teal-700 text-white px-4 py-2"
      >
        <div id="logo" className="flex items-center space-x-2">
          <div id="logo-placeholder" className="w-8 h-8 bg-gray-200 rounded-full" />
          <span className="font-semibold">ameciclo Dados</span>
        </div>

        <div id="header-controls" className="flex items-center space-x-4">
          <button id="btn-map" className="bg-red-500 px-3 py-1 rounded">
            Visualizando no mapa
          </button>
          <button id="btn-wall" className="bg-gray-200 text-black px-3 py-1 rounded">
            Visualizar no mural
          </button>
          <input
            id="search-bar"
            type="text"
            placeholder="Buscar local, bairro, rua etc"
            className="px-2 py-1 rounded border text-black"
          />
        </div>
      </header>

      {/* Main content */}
      <div id="main-content" className="flex flex-1 overflow-hidden">
        {/* Sidebar Left */}
        <aside
          id="sidebar-left"
          className="w-72 bg-gray-50 border-r p-2 overflow-y-auto"
        >
          <h2 className="font-semibold mb-2">Camadas de dados</h2>
          <div id="layers-container" className="space-y-2">
            {/* Aqui entram as opções de camadas */}
            <div id="layer-infraestrutura">Infraestrutura cicloviária</div>
            <div id="layer-contagens">Contagens de ciclistas</div>
            <div id="layer-plano-diretor">Plano Diretor Cicloviário</div>
          </div>
        </aside>

        {/* Map */}
        <main id="map-container" className="flex-1 relative">
          <div className="absolute inset-0 bg-gray-300" id="map-placeholder">
            {/* Aqui entra o componente de mapa */}
            MAPA
          </div>
        </main>

        {/* Sidebar Right */}
        <aside
          id="sidebar-right"
          className="w-80 bg-white border-l p-2 overflow-y-auto"
        >
          <h2 className="font-semibold mb-2">Dados em gráficos</h2>
          <div id="charts-container" className="space-y-4">
            {/* Exemplo de card */}
            <div
              id="chart-card-1"
              className="border rounded p-2 shadow-sm bg-gray-50"
            >
              <h3 className="font-medium">Av. Gov. Agamenon Magalhães</h3>
              <p>2.846</p>
              <div className="h-16 bg-gray-200">[Gráfico 1]</div>
            </div>

            <div
              id="chart-card-2"
              className="border rounded p-2 shadow-sm bg-gray-50"
            >
              <h3 className="font-medium">Sinistros com vítima</h3>
              <p>1.323</p>
              <div className="h-16 bg-gray-200">[Gráfico 2]</div>
            </div>

            <div
              id="chart-card-3"
              className="border rounded p-2 shadow-sm bg-gray-50"
            >
              <h3 className="font-medium">Infra. cicloviária executada</h3>
              <p>78%</p>
              <div className="h-4 bg-gray-200">[Progress bar]</div>
            </div>
          </div>
        </aside>
      </div>

      {/* Floating Chat Button */}
      <div
        id="chat-ia"
        className="absolute bottom-4 right-4 bg-pink-500 text-white px-4 py-2 rounded shadow-lg cursor-pointer"
      >
        Iniciar chat com a IA da ameciclo
      </div>
    </div>
  );
}
