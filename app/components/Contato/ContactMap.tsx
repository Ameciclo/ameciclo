import React, { useState, useEffect } from "react";
import 'mapbox-gl/dist/mapbox-gl.css';

export const MAPBOXTOKEN = typeof window !== 'undefined' ? (window as any).MAPBOX_TOKEN : null;
export const MAPBOXSTYLE = "mapbox://styles/mapbox/streets-v11";

const dropIcon = `M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
C20.1,15.8,20.2,15.8,20.2,15.7z`;

const MapMarker = ({ size = 30, icon, color = "#008080" }: any) => (
  <div
    style={{
      width: size,
      height: size,
      transform: `translate(${-size / 2}px, ${-size}px)`,
      cursor: "pointer",
    }}
  >
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{
        fill: color,
        stroke: "none",
      }}
    >
      <path d={icon} />
    </svg>
  </div>
);

export function ContactMap() {
  const [isMounted, setIsMounted] = useState(false);
  const [ReactMapGL, setReactMapGL] = useState<any>(null);
  const [Marker, setMarker] = useState<any>(null);
  const [NavigationControl, setNavigationControl] = useState<any>(null);
  
  const [viewport, setViewport] = useState({
    latitude: -8.0593077,
    longitude: -34.8800935,
    zoom: 17,
    bearing: 0,
    pitch: 0,
  });

  useEffect(() => {
    setIsMounted(true);
    import('react-map-gl').then((module) => {
      setReactMapGL(() => module.default);
      setMarker(() => module.Marker);
      setNavigationControl(() => module.NavigationControl);
    });
  }, []);

  if (!isMounted || !ReactMapGL || !Marker || !NavigationControl) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div style={{ height: '600px' }} className="flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008080] mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando mapa...</p>
          </div>
        </div>
        <div className="p-4 bg-gray-50 border-t">
          <p className="text-sm text-gray-700">
            <strong>Endereço:</strong> Rua da Aurora, 529, loja 2 - Santo Amaro, Recife - PE
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div style={{ height: '600px' }}>
        <ReactMapGL
          {...viewport}
          onViewportChange={setViewport}
          mapStyle={MAPBOXSTYLE}
          mapboxApiAccessToken={MAPBOXTOKEN}
          width="100%"
          height="100%"
        >
          <NavigationControl position="top-right" showCompass={false} />
          
          <Marker
            longitude={-34.8800935}
            latitude={-8.0593077}
          >
            <MapMarker icon={dropIcon} size={30} color="#008080" />
          </Marker>
        </ReactMapGL>
      </div>
      <div className="p-4 bg-gray-50 border-t">
        <p className="text-sm text-gray-700">
          <strong>Endereço:</strong> Rua da Aurora, 529, loja 2 - Santo Amaro, Recife - PE
        </p>
        <a 
          href="https://www.google.com/maps/place/Ameciclo/@-8.0593077,-34.8800935,19z"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#008080] hover:underline mt-2 inline-block"
        >
          🗺️ Abrir no Google Maps
        </a>
      </div>
    </div>
  );
}
