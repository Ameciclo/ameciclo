export function getLayerStyle(type: string, infraOptions: any[], pdcOptions: any[]) {
  const infraOption = infraOptions.find(opt => opt.name === type);
  const pdcOption = pdcOptions.find(opt => opt.name === type);
  
  if (infraOption) {
    switch (infraOption.pattern) {
      case "solid":
        return { "line-color": infraOption.color, "line-width": 6 };
      case "bordered":
        return { "line-color": infraOption.color, "line-width": 8, "line-opacity": 0.8 };
      case "arrows":
        return { "line-color": infraOption.color, "line-width": 8 };
      case "area":
        const isZona30 = type === "Zonas 30";
        return {
          "fill-color": isZona30 ? "#FEF3C7" : "#DBEAFE",
          "fill-opacity": 0.6,
          "fill-outline-color": isZona30 ? "#F59E0B" : "#3B82F6"
        };
      default:
        return { "line-color": infraOption.color, "line-width": 2 };
    }
  }
  
  if (pdcOption) {
    switch (pdcOption.pattern) {
      case "parallel":
        return { "line-color": pdcOption.color, "line-width": 6 };
      case "parallel-dashed":
        return { "line-color": pdcOption.color, "line-width": 6, "line-dasharray": [4, 2] };
      case "parallel-orange-dashed":
        return { "line-color": pdcOption.color, "line-width": 6, "line-dasharray": [4, 2] };
      case "striped":
        return { "line-color": pdcOption.color, "line-width": 6, "line-opacity": 0.8 };
      default:
        return { "line-color": pdcOption.color, "line-width": 6 };
    }
  }
  
  return { "line-color": "#000000", "line-width": 2 };
}

export function generateLayersConf(
  selectedInfra: string[], 
  selectedPdc: string[], 
  infraOptions: any[], 
  pdcOptions: any[]
) {
  const allLayers = [];
  
  // Layers de infraestrutura
  infraOptions
    .filter(option => selectedInfra.includes(option.name))
    .forEach(option => {
      const style = getLayerStyle(option.name, infraOptions, pdcOptions);
      const isArea = option.pattern === "area";
      
      allLayers.push({
        id: option.name,
        type: isArea ? "fill" : "line",
        filter: ["==", ["get", "type"], option.name],
        paint: style
      });
      
      if (isArea) {
        const isZona30 = option.name === "Zonas 30";
        allLayers.push({
          id: `${option.name}-border`,
          type: "line",
          filter: ["==", ["get", "type"], option.name],
          paint: {
            "line-color": isZona30 ? "#F59E0B" : "#3B82F6",
            "line-width": 2,
            "line-dasharray": [4, 2]
          }
        });
      }
      
      if (option.pattern === "arrows") {
        allLayers.push({
          id: `${option.name}-arrows`,
          type: "symbol",
          filter: ["==", ["get", "type"], option.name],
          layout: {
            "symbol-placement": "line",
            "symbol-spacing": 20,
            "text-field": "▶",
            "text-size": 16,
            "text-rotation-alignment": "map",
            "text-pitch-alignment": "viewport"
          },
          paint: {
            "text-color": "#EF4444"
          }
        });
      }
    });
  
  // Layers de PDC
  pdcOptions
    .filter(option => selectedPdc.includes(option.name))
    .forEach(option => {
      if (option.pattern === "parallel" || option.pattern === "parallel-dashed" || option.pattern === "parallel-orange-dashed") {
        allLayers.push({
          id: `${option.name}-line1`,
          type: "line",
          filter: ["==", ["get", "type"], option.name],
          paint: {
            "line-color": option.color,
            "line-width": 3,
            "line-offset": -2,
            ...(option.pattern.includes("dashed") ? { "line-dasharray": [1, 1] } : {})
          }
        });
        
        allLayers.push({
          id: `${option.name}-line2`,
          type: "line",
          filter: ["==", ["get", "type"], option.name],
          paint: {
            "line-color": option.color,
            "line-width": 3,
            "line-offset": 2,
            ...(option.pattern.includes("dashed") ? { "line-dasharray": [1, 1] } : {})
          }
        });
      } else if (option.pattern === "striped") {
        allLayers.push({
          id: `${option.name}-base`,
          type: "line",
          filter: ["==", ["get", "type"], option.name],
          paint: {
            "line-color": "#EC4899",
            "line-width": 6
          }
        });
        
        allLayers.push({
          id: `${option.name}-stripes`,
          type: "line",
          filter: ["==", ["get", "type"], option.name],
          paint: {
            "line-color": "#FED7AA",
            "line-width": 6,
            "line-dasharray": [1, 1]
          }
        });
      } else {
        const style = getLayerStyle(option.name, infraOptions, pdcOptions);
        allLayers.push({
          id: option.name,
          type: "line",
          filter: ["==", ["get", "type"], option.name],
          paint: style
        });
      }
    });
  
  return allLayers;
}