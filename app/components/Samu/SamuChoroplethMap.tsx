"use client";
import React, { useState, useEffect } from "react";
import ReactMapGL, { Source, Layer, NavigationControl, FullscreenControl } from "react-map-gl";

const MAPBOXTOKEN = typeof window !== 'undefined' ? (window as any).MAPBOX_TOKEN : "pk.eyJ1IjoiaWFjYXB1Y2EiLCJhIjoiODViMTRmMmMwMWE1OGIwYjgxNjMyMGFkM2Q5OWJmNzUifQ.OFgXp9wbN5BJlpuJEcDm4A";
const MAPBOXSTYLE = "mapbox://styles/mapbox/light-v10";

interface CityData {
  municipio_samu?: string;
  name?: string;
  count: number;
  id?: number;
  historico_anual?: Array<{ ano: number; total_chamados: number }>;
}

interface SamuChoroplethMapProps {
  citiesData: CityData[];
}

export function SamuChoroplethMap({ citiesData }: SamuChoroplethMapProps) {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [viewport, setViewport] = useState({
    latitude: -8.0584364,
    longitude: -34.945277,
    zoom: 9,
    bearing: 0,
    pitch: 0,
  });

  const handleMapClick = (event: any) => {
    const feature = event.features && event.features[0];
    if (feature && feature.properties && feature.properties.calls > 0) {
      const ranking = feature.properties.ranking || 0;
      
      let historico = feature.properties.historico_anual || [];
      
      if (typeof historico === 'string') {
        try {
          historico = JSON.parse(historico);
        } catch (e) {
          console.error('Erro ao fazer parse do histórico:', e);
          historico = [];
        }
      }
      
      setSelectedCity({
        name: feature.properties.displayName,
        calls: feature.properties.calls,
        ranking: ranking,
        historico_anual: historico
      });
    }
  };

  useEffect(() => {
    if (!citiesData || citiesData.length === 0) return;
    
    fetch("/data/pernambuco-municipios.geojson")
      .then((response) => response.json())
      .then((data) => {
        const validCities = citiesData.filter(city => city.count && city.count > 0);
        if (validCities.length === 0) return;
        
        const maxCalls = Math.max(...validCities.map((city) => city.count));

        const enrichedFeatures = data.features
          .filter((feature: any) => 
            feature.geometry && 
            feature.geometry.coordinates && 
            feature.properties &&
            (feature.properties.name || feature.properties.NAME || feature.properties.NM_MUN)
          )
          .map((feature: any) => {
            const cityName =
              feature.properties.name ||
              feature.properties.NAME ||
              feature.properties.NM_MUN;
            const cityData = validCities.find(
              (city) =>
                (city.name &&
                  city.name.toLowerCase().includes(cityName.toLowerCase())) ||
                (city.municipio_samu &&
                  city.municipio_samu
                    .toLowerCase()
                    .includes(cityName.toLowerCase())) ||
                cityName
                  .toLowerCase()
                  .includes(
                    (city.name || city.municipio_samu || "").toLowerCase()
                  )
            );

            const calls = cityData ? cityData.count : 0;
            const intensity = maxCalls > 0 ? calls / maxCalls : 0;

            return {
              ...feature,
              properties: {
                ...feature.properties,
                calls,
                intensity,
                displayName: cityName,
                cityData: cityData,
                ranking: cityData?.ranking || 0,
                historico_anual: cityData?.historico_anual || [],
              },
            };
          });

        setGeoJsonData({
          ...data,
          features: enrichedFeatures,
        });
      })
      .catch((error) => console.error("Erro ao carregar GeoJSON:", error));
  }, [citiesData]);
  
  const totalCities = citiesData.length;
  const layersConf = geoJsonData
    ? [
        {
          id: "samu-choropleth",
          type: "fill" as const,
          paint: {
            "fill-color": [
              "case",
              [">", ["get", "intensity"], 0.7],
              "#800026",
              [">", ["get", "intensity"], 0.4],
              "#BD0026",
              [">", ["get", "intensity"], 0.15],
              "#E31A1C",
              [">", ["get", "intensity"], 0.05],
              "#FC4E2A",
              [">", ["get", "intensity"], 0],
              "#FD8D3C",
              "#FFEDA0",
            ],
            "fill-opacity": ["case", ["==", ["get", "calls"], 0], 0, 0.7],
          },
          layout: {},
        },
        {
          id: "samu-choropleth-border",
          type: "line" as const,
          paint: {
            "line-color": "#ffffff",
            "line-width": 1,
          },
          layout: {},
        },
        {
          id: "samu-city-names",
          type: "symbol" as const,
          paint: {
            "text-color": "#000000",
            "text-halo-color": "#ffffff",
            "text-halo-width": 1,
          },
          layout: {
            "text-field": [
              "case",
              [">", ["get", "calls"], 0],
              ["get", "displayName"],
              "",
            ],
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-size": 10,
            "text-anchor": "center",
            "text-offset": [0, -1.5],
          },
        },
        {
          id: "samu-labels",
          type: "symbol" as const,
          paint: {
            "text-color": "#000000",
            "text-halo-color": "#ffffff",
            "text-halo-width": 2,
          },
          layout: {
            "text-field": [
              "case",
              [">", ["get", "calls"], 0],
              ["get", "calls"],
              "",
            ],
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-size": 12,
            "text-anchor": "center",
            "text-offset": [0, 0.5],
          },
        },
      ]
    : [];

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-2">
          Mapa de Chamadas do SAMU por Município
        </h3>
        <div className="flex items-center space-x-4 text-sm">
          <span>Menos chamadas</span>
          <div className="flex">
            {[
              "#FFEDA0",
              "#FD8D3C",
              "#FC4E2A",
              "#E31A1C",
              "#BD0026",
              "#800026",
            ].map((color, index) => (
              <div
                key={index}
                className="w-6 h-4"
                style={{ backgroundColor: color }}
              ></div>
            ))}
          </div>
          <span>Mais chamadas</span>
        </div>
      </div>

      {geoJsonData && geoJsonData.features && geoJsonData.features.length > 0 && (
        <div className="relative">
          <div className="bg-green-200 rounded shadow-2xl">
            <ReactMapGL
              {...viewport}
              onViewportChange={(nextViewport: any) => setViewport(nextViewport)}
              width="100%"
              height="400px"
              mapStyle={MAPBOXSTYLE}
              mapboxApiAccessToken={MAPBOXTOKEN}
              dragPan={true}
              dragRotate={true}
              scrollZoom={true}
              touchZoom={true}
              touchRotate={true}
              keyboard={true}
              boxZoom={true}
              doubleClickZoom={true}
              onClick={handleMapClick}
              interactiveLayerIds={['samu-choropleth']}
            >
              <Source id="samu-data" type="geojson" data={geoJsonData}>
                {layersConf.map((layer, index) => (
                  <Layer key={index} {...layer} />
                ))}
              </Source>
              
              <div style={{ position: 'absolute', top: 10, right: 50, zIndex: 1000 }}>
                <NavigationControl />
              </div>
              
              <div style={{ position: 'absolute', top: 110, right: 50, zIndex: 1000 }}>
                <FullscreenControl />
              </div>
            </ReactMapGL>
          </div>
          {selectedCity && (
            <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-xs z-10">
              <button
                onClick={() => setSelectedCity(null)}
                className="float-right text-gray-500 hover:text-gray-700 text-xl leading-none"
              >
                ×
              </button>
              <h4 className="font-bold text-lg mb-2">{selectedCity.name}</h4>
              <p className="text-sm mb-1">
                Ranking: {selectedCity.ranking}º de {totalCities} municípios
              </p>
              <p className="text-sm mb-2">
                Total: {selectedCity.calls} chamadas
              </p>
              {Array.isArray(selectedCity.historico_anual) &&
                selectedCity.historico_anual.length > 0 && (
                  <div>
                    <h5 className="font-semibold mb-1">Histórico:</h5>
                    <div className="text-xs space-y-1">
                      {selectedCity.historico_anual.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.ano}:</span>
                          <span>{item.total_chamados} chamadas</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}