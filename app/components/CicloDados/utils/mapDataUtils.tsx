export function generateInfraData(selectedInfra: string[]) {
  if (selectedInfra.length === 0) return null;

  return {
    type: "FeatureCollection",
    features: [
      // Ciclovias - Av. Conde da Boa Vista
      {
        type: "Feature",
        properties: { type: "Ciclovias" },
        geometry: {
          type: "LineString",
          coordinates: [[-34.8813, -8.0576], [-34.8798, -8.0582], [-34.8785, -8.0588]]
        }
      },
      // Ciclofaixas - Rua da Aurora
      {
        type: "Feature",
        properties: { type: "Ciclofaixas" },
        geometry: {
          type: "LineString",
          coordinates: [[-34.8825, -8.0595], [-34.8810, -8.0601], [-34.8795, -8.0607]]
        }
      },
      // Ciclorrotas - Rua do Hospício
      {
        type: "Feature",
        properties: { type: "Ciclorrotas" },
        geometry: {
          type: "LineString",
          coordinates: [[-34.8840, -8.0610], [-34.8825, -8.0616], [-34.8810, -8.0622]]
        }
      },
      // Calçadas Compartilhadas - Rua da Imperatriz
      {
        type: "Feature",
        properties: { type: "Calçadas Compartilhadas" },
        geometry: {
          type: "LineString",
          coordinates: [[-34.8855, -8.0625], [-34.8840, -8.0631], [-34.8825, -8.0637]]
        }
      },
      // Zonas 30 - Bairro do Recife
      {
        type: "Feature",
        properties: { type: "Zonas 30", id: "zona30-1" },
        geometry: {
          type: "Polygon",
          coordinates: [[[-34.8750, -8.0680], [-34.8725, -8.0685], [-34.8720, -8.0700], [-34.8735, -8.0715], [-34.8755, -8.0710], [-34.8760, -8.0695], [-34.8750, -8.0680]]]
        }
      },
      // Zonas de Pedestre - Marco Zero
      {
        type: "Feature",
        properties: { type: "Zonas de Pedestre", id: "zona-pedestre-1" },
        geometry: {
          type: "Polygon",
          coordinates: [[[-34.8720, -8.0580], [-34.8712, -8.0585], [-34.8708, -8.0592], [-34.8714, -8.0598], [-34.8722, -8.0595], [-34.8725, -8.0588], [-34.8720, -8.0580]]]
        }
      }
    ].filter(feature => selectedInfra.includes(feature.properties.type))
  };
}

export function generatePdcData(selectedPdc: string[]) {
  if (selectedPdc.length === 0) return null;

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { type: "Realizado dentro do PDF com infra designada", id: "pdc-1" },
        geometry: {
          type: "LineString",
          coordinates: [[-34.8770, -8.0550], [-34.8760, -8.0555], [-34.8750, -8.0560]]
        }
      },
      {
        type: "Feature",
        properties: { type: "Realizado dentro do PDF com infra não designada", id: "pdc-2" },
        geometry: {
          type: "LineString",
          coordinates: [[-34.8780, -8.0565], [-34.8770, -8.0570], [-34.8760, -8.0575]]
        }
      },
      {
        type: "Feature",
        properties: { type: "Realizado fora do PDC", id: "pdc-3" },
        geometry: {
          type: "LineString",
          coordinates: [[-34.8790, -8.0580], [-34.8780, -8.0585], [-34.8770, -8.0590]]
        }
      },
      {
        type: "Feature",
        properties: { type: "PDC não realizado", id: "pdc-4" },
        geometry: {
          type: "LineString",
          coordinates: [[-34.8800, -8.0595], [-34.8790, -8.0600], [-34.8780, -8.0605]]
        }
      }
    ].filter(feature => selectedPdc.includes(feature.properties.type))
  };
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