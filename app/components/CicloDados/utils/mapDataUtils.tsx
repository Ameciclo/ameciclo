export function generateInfraData(selectedInfra: string[]) {
  return null;
}

export function generatePdcData(selectedPdc: string[]) {
  return null;
}

export function generateContagemData(selectedContagem: string[]) {
  if (selectedContagem.length === 0) return null;

  const contagemCounts = {
    "Somente Mulheres": 45,
    "Crianças e Adolescentes": 23,
    "Carona": 12,
    "Serviço": 8,
    "Cargueira": 15,
    "Uso de Calçada": 31,
    "Contramão": 7
  };

  const totalCount = selectedContagem.reduce((sum, type) => 
    sum + (contagemCounts[type as keyof typeof contagemCounts] || 0), 0
  );

  return {
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      properties: { 
        type: "Contagem Total", 
        count: totalCount,
        location: "Av. Conde da Boa Vista"
      },
      geometry: {
        type: "Point",
        coordinates: [-34.8800, -8.0580]
      }
    }]
  };
}

export function getContagemIcon(count: number) {
  return (
    <div className="relative">
      <div className="bg-white rounded-lg px-2 py-1 shadow-lg">
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>
          <span className="text-sm font-bold text-black">{count}</span>
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
        <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
      </div>
    </div>
  );
}