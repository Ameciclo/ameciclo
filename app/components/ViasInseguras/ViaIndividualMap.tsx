import { useState, useEffect } from "react";
import Map, { Source, Layer } from "react-map-gl";
import { WebMercatorViewport } from "@math.gl/web-mercator";
import bbox from "@turf/bbox";

const MAPBOXTOKEN = "pk.eyJ1IjoiaWFjYXB1Y2EiLCJhIjoiODViMTRmMmMwMWE1OGIwYjgxNjMyMGFkM2Q5OWJmNzUifQ.OFgXp9wbN5BJlpuJEcDm4A";
const MAPBOXSTYLE = "mapbox://styles/mapbox/light-v10";

const MapCommands = ({ viewport, setViewport, settings, setsettings, initialViewport }: any) => {
    const handleZoomIn = () => {
        setViewport({ ...viewport, zoom: viewport.zoom + 1 });
    };

    const handleZoomOut = () => {
        setViewport({ ...viewport, zoom: viewport.zoom - 1 });
    };

    const handleRecenter = () => {
        setViewport(initialViewport);
    };

    const handleToggleDragPan = () => {
        setsettings((prev: any) => ({ 
            ...prev, 
            dragPan: !prev.dragPan,
            scrollZoom: !prev.scrollZoom 
        }));
    };

    return (
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-50">
            <button
                onClick={handleZoomIn}
                className="bg-white hover:bg-gray-100 border border-gray-300 rounded p-2 shadow-md transition-colors"
                title="Zoom in"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            </button>

            <button
                onClick={handleZoomOut}
                className="bg-white hover:bg-gray-100 border border-gray-300 rounded p-2 shadow-md transition-colors"
                title="Zoom out"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
            </button>

            <button
                onClick={handleToggleDragPan}
                className={`bg-white hover:bg-gray-100 border border-gray-300 rounded p-2 shadow-md transition-colors ${settings.dragPan ? 'text-blue-500' : ''}`}
                title="Mover mapa"
            >
                <svg className="w-5 h-5" version="1.1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                    <path d="M23.016 5.484v14.531c0 2.203-1.828 3.984-4.031 3.984h-7.266c-1.078 0-2.109-0.422-2.859-1.172l-7.875-8.016s1.266-1.219 1.313-1.219c0.234-0.188 0.516-0.281 0.797-0.281 0.234 0 0.422 0.047 0.609 0.141 0.047 0 4.313 2.438 4.313 2.438v-11.906c0-0.844 0.656-1.5 1.5-1.5s1.5 0.656 1.5 1.5v7.031h0.984v-9.516c0-0.844 0.656-1.5 1.5-1.5s1.5 0.656 1.5 1.5v9.516h0.984v-8.531c0-0.844 0.656-1.5 1.5-1.5s1.5 0.656 1.5 1.5v8.531h1.031v-5.531c0-0.844 0.656-1.5 1.5-1.5s1.5 0.656 1.5 1.5z"/>
                </svg>
            </button>

            <button
                onClick={handleRecenter}
                className="bg-white hover:bg-gray-100 border border-gray-300 rounded p-2 shadow-md transition-colors"
                title="Recentralizar mapa"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            </button>
        </div>
    );
};

const ViaLegend = ({ totalSinistros }: { totalSinistros: number }) => {
    return (
        <div className="absolute bottom-0 right-0 bg-white border rounded p-4 m-2 shadow-md max-w-xs">
            <h3 className="font-bold mb-3 text-center">Via em Análise</h3>
            <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-1 bg-red-600 rounded"></div>
                    <span>{totalSinistros} sinistros totais</span>
                </div>
            </div>
        </div>
    );
};

const getInicialViewPort = (layerData: any) => {
    let standardViewPort = {
        latitude: -8.0584364,
        longitude: -34.945277,
        zoom: 15,
        bearing: 0,
        pitch: 0,
    };

    const hasLayers = layerData && layerData.features && layerData.features.length > 0;

    if (!hasLayers) {
        return standardViewPort;
    }

    try {
        const [minX, minY, maxX, maxY] = bbox(layerData);
        
        const vp = new WebMercatorViewport({
            width: 400,
            height: 400,
            ...standardViewPort,
        });

        const { longitude, latitude, zoom } = vp.fitBounds(
            [
                [minX, minY],
                [maxX, maxY],
            ],
            {
                padding: 60,
            }
        );

        if (latitude && longitude && zoom) {
            standardViewPort.longitude = longitude;
            standardViewPort.latitude = latitude;
            standardViewPort.zoom = Math.min(zoom, 16); // Limitar zoom máximo
        }
    } catch(e) {
        console.error("Error creating bbox for via", e);
    }

    return standardViewPort;
};

const mapInicialState = {
    dragPan: false,
    dragRotate: true,
    scrollZoom: false,
    touchZoom: true,
    touchRotate: true,
    keyboard: true,
    boxZoom: true,
    doubleClickZoom: true,
};

interface ViaIndividualMapProps {
    viaName: string;
    totalSinistros: number;
    mapData?: any;
}

export default function ViaIndividualMap({ viaName, totalSinistros, mapData }: ViaIndividualMapProps) {
    const [isClient, setIsClient] = useState(false);
    const [isMapReady, setIsMapReady] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const timer = setTimeout(() => {
            setIsMapReady(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Usar dados reais da API ou fallback para mock
    const viaGeoJSON = mapData || {
        type: "FeatureCollection" as const,
        features: [
            {
                type: "Feature" as const,
                properties: {
                    nome: viaName,
                    sinistros: totalSinistros,
                },
                geometry: {
                    type: "LineString" as const,
                    coordinates: [
                        [-34.9450, -8.0580],
                        [-34.9440, -8.0570],
                        [-34.9430, -8.0560],
                        [-34.9420, -8.0550],
                        [-34.9410, -8.0540],
                    ],
                },
            },
        ],
    };
    
    console.log('🗺️ ViaIndividualMap received data:', {
        hasMapData: !!mapData,
        hasFeatures: mapData?.features?.length > 0,
        usingFallback: !mapData
    });

    const [viewport, setViewport] = useState({
        latitude: -8.0584364,
        longitude: -34.945277,
        zoom: 15,
        bearing: 0,
        pitch: 0,
    });
    const [initialViewport, setInitialViewport] = useState(viewport);

    useEffect(() => {
        if (isClient && isMapReady) {
            const calculatedViewport = getInicialViewPort(viaGeoJSON);
            setViewport(calculatedViewport);
            setInitialViewport(calculatedViewport);
        }
    }, [isClient, isMapReady]);

    const [settings, setsettings] = useState({ ...mapInicialState });

    const hasRealData = mapData && mapData.features && mapData.features.length > 0;

    return (
        <div className="relative bg-gray-200 rounded shadow-2xl">
            {!hasRealData && (
                <div className="absolute top-4 left-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded z-50 text-sm">
                    ⚠️ Usando localização aproximada - dados de geometria não disponíveis
                </div>
            )}
            {isClient && isMapReady && (
                <Map
                    {...viewport}
                    {...settings}
                    width="100%"
                    height="400px"
                    onViewportChange={setViewport}
                    mapStyle={MAPBOXSTYLE}
                    mapboxApiAccessToken={MAPBOXTOKEN}
                    getCursor={({ isDragging }) => (settings.dragPan ? (isDragging ? 'grabbing' : 'grab') : 'pointer')}
                >
                    <style>{`
                        .mapboxgl-ctrl-attrib {
                            color: #d1d5db !important;
                            font-size: 10px !important;
                            opacity: 0.6 !important;
                        }
                        .mapboxgl-ctrl-attrib a {
                            color: #d1d5db !important;
                            font-size: 10px !important;
                        }
                    `}</style>
                    
                    <MapCommands 
                        viewport={viewport} 
                        setViewport={setViewport} 
                        settings={settings} 
                        setsettings={setsettings} 
                        initialViewport={initialViewport} 
                    />
                    
                    <Source id="via-individual" type="geojson" data={viaGeoJSON}>
                        <Layer
                            id="via-line"
                            type="line"
                            paint={{
                                "line-color": [
                                    "interpolate",
                                    ["linear"],
                                    ["get", "sinistros"],
                                    0,
                                    "#FEF3C7",
                                    50,
                                    "#F59E0B",
                                    150,
                                    "#DC2626",
                                    300,
                                    "#7F1D1D",
                                ],
                                "line-width": [
                                    "interpolate",
                                    ["linear"],
                                    ["get", "sinistros"],
                                    0,
                                    4,
                                    50,
                                    6,
                                    150,
                                    8,
                                    300,
                                    10,
                                ],
                                "line-opacity": 0.8,
                            }}
                        />
                    </Source>
                    
                    <ViaLegend totalSinistros={totalSinistros} />
                </Map>
            )}
        </div>
    );
}