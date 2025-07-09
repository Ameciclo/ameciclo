import React, { useState } from "react";
import type { PointData } from "~/services/contagens.service";

interface ContagensMapProps {
  pointsData: PointData[];
  controlPanel: Array<{
    type: string;
    color: string;
  }>;
}

export function ContagensMap({ pointsData, controlPanel }: ContagensMapProps) {
  const [selectedPoint, setSelectedPoint] = useState<PointData | null>(null);
  const [markerVisibility, setMarkerVisibility] = useState(
    pointsData.reduce((obj, marker) => ({ ...obj, [marker.key]: true }), {} as Record<string, boolean>)
  );

  const handleMarkerToggle = (key: string) => {
    setMarkerVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section className="container mx-auto">
      <div className="relative bg-green-200 rounded shadow-2xl h-96">
        {/* Placeholder para o mapa - implementar com react-map-gl */}
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-gray-600">Mapa será implementado aqui</p>
          <p className="text-sm text-gray-500 ml-2">
            {pointsData.length} pontos de contagem
          </p>
        </div>

        {/* Painel de controle */}
        {controlPanel.length > 0 && (
          <div className="absolute bottom-0 right-0 bg-white border rounded p-4 mb-2 shadow">
            <h3 className="font-bold mb-2">Legenda</h3>
            {controlPanel.map((control) => {
              const filteredPoints = pointsData.filter(
                (marker) => marker.type === control.type
              );
              const checked = filteredPoints.length > 0 &&
                filteredPoints.every((point) => markerVisibility[point.key] === true);
              
              return (
                <div className="flex items-center mb-1 uppercase font-bold" key={control.type}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      filteredPoints.forEach((point) =>
                        handleMarkerToggle(point.key)
                      );
                    }}
                  />
                  <span
                    className="ml-2 text-sm font-medium"
                    style={{ color: control.color }}
                  >
                    {control.type}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Popup */}
        {selectedPoint && (
          <div className="absolute top-0 left-0 max-w-sm bg-white shadow-md p-6 m-10 text-sm text-gray-600 uppercase">
            <button
              className="absolute top-0 right-0 hover:text-red-500"
              onClick={() => setSelectedPoint(null)}
            >
              X
            </button>
            <div className="text-center">
              <h2 className="font-bold">{selectedPoint.popup.name}</h2>
              <p className="py-2">
                {selectedPoint.popup.total} ciclistas em {selectedPoint.popup.date}
              </p>
              {selectedPoint.popup.obs && (
                <p className="py-2 text-sm text-gray-700">
                  {selectedPoint.popup.obs}
                </p>
              )}
              {selectedPoint.popup.url && (
                <a href={selectedPoint.popup.url}>
                  <button className="bg-ameciclo text-white p-2">Ver mais</button>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}