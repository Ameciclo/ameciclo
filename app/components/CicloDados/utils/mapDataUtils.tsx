export function generateInfraData(selectedInfra: string[]) {
  return null;
}

export function generatePdcData(selectedPdc: string[], execucaoCicloviaria?: any) {
  if (selectedPdc.length === 0) return null;
  
  // Mock data para demonstração dos filtros PDC
  const mockPdcData = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          name: "PDC Realizado Designado",
          type: "pdc_realizado_designado",
          color: "#8B5CF6",
          pattern: "parallel"
        },
        geometry: {
          type: "LineString",
          coordinates: [[-34.8770, -8.0476], [-34.8750, -8.0456]]
        }
      },
      {
        type: "Feature",
        properties: {
          name: "PDC Realizado Não Designado",
          type: "pdc_realizado_nao_designado",
          color: "#8B5CF6",
          pattern: "parallel-dashed"
        },
        geometry: {
          type: "LineString",
          coordinates: [[-34.8750, -8.0456], [-34.8730, -8.0436]]
        }
      },
      {
        type: "Feature",
        properties: {
          name: "Realizado Fora PDC",
          type: "realizado_fora_pdc",
          color: "#F59E0B",
          pattern: "parallel-orange-dashed"
        },
        geometry: {
          type: "LineString",
          coordinates: [[-34.8730, -8.0436], [-34.8710, -8.0416]]
        }
      },
      {
        type: "Feature",
        properties: {
          name: "PDC Não Realizado",
          type: "pdc_nao_realizado",
          color: "#EC4899",
          pattern: "striped"
        },
        geometry: {
          type: "LineString",
          coordinates: [[-34.8710, -8.0416], [-34.8690, -8.0396]]
        }
      }
    ]
  };
  
  // Filtrar features baseado na seleção
  const filteredFeatures = mockPdcData.features.filter(feature => {
    return selectedPdc.includes(feature.properties.name);
  });
  
  return {
    type: "FeatureCollection",
    features: filteredFeatures
  };
}

export function generateContagemData(selectedContagem: string[], apiData?: any, profileFilters?: {
  genero?: string;
  raca?: string;
  socio?: string;
  dias?: string;
}) {
  if (selectedContagem.length === 0) return null;

  if (apiData && apiData.features) {
    // Filter features based on selected sources
    const filteredFeatures = apiData.features.filter((feature: any) => {
      const source = feature.properties.source;
      
      if (selectedContagem.includes("Contagem da Ameciclo") && source === 'ameciclo') {
        return true;
      }
      if (selectedContagem.includes("Contagem da Prefeitura") && source === 'prefeitura') {
        return true;
      }
      
      return false;
    });

    return {
      type: "FeatureCollection",
      features: filteredFeatures.map((feature: any) => {
        const props = feature.properties;
        
        return {
          type: "Feature",
          properties: {
            type: "Contagem",
            count: props.total_cyclists || props.count || 0,
            total_cyclists: props.total_cyclists || props.count || 0,
            location: props.name || props.address || 'Ponto de Contagem',
            source: props.source,
            ...props
          },
          geometry: feature.geometry
        };
      })
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