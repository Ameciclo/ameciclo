import React, { useState, useEffect } from "react";

interface SamuChoroplethMapProps {
  citiesData: any[];
}

export function SamuChoroplethMap({ citiesData }: SamuChoroplethMapProps) {
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar dados do GeoJSON de Pernambuco
    fetch("/data/pernambuco-municipios.geojson")
      .then((response) => response.json())
      .then((data) => {
        setGeoData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao carregar GeoJSON:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <p className="text-gray-500">Carregando mapa...</p>
      </div>
    );
  }

  if (!geoData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <p className="text-red-500">Erro ao carregar dados do mapa</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold">Mapa de Chamadas por Município</h3>
        <p className="text-gray-600">
          Intensidade de chamadas do SAMU por município de Pernambuco
        </p>
      </div>
      
      {/* Placeholder para o mapa - aqui seria implementado com uma biblioteca como Leaflet ou Mapbox */}
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-2">Mapa Coroplético</p>
          <p className="text-sm text-gray-400">
            {citiesData.length} municípios com dados
          </p>
        </div>
      </div>
      
      {/* Legenda */}
      <div className="mt-4 flex justify-center">
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-gray-600">Intensidade:</span>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-200 rounded"></div>
            <span>Baixa</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span>Média</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span>Alta</span>
          </div>
        </div>
      </div>
    </div>
  );
}