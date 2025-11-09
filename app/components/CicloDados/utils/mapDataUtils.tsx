export function generateInfraData(selectedInfra: string[]) {
  return null;
}

export function generatePdcData(selectedPdc: string[]) {
  return null;
}

export function generateContagemData(selectedContagem: string[], apiData?: any) {
  if (selectedContagem.length === 0) return null;

  if (apiData && apiData.features) {
    return {
      type: "FeatureCollection",
      features: apiData.features.map((feature: any) => ({
        type: "Feature",
        properties: {
          type: "Contagem",
          count: feature.properties.count || 0,
          location: feature.properties.name || feature.properties.address || 'Ponto de Contagem',
          ...feature.properties
        },
        geometry: feature.geometry
      }))
    };
  }

  return null;
}

export function getContagemIcon(count: number) {
  return (
    <div className="relative">
      <div className="bg-white rounded-lg px-2 py-1 shadow-lg">
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8"/>
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