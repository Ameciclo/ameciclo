import { useState, useEffect } from "react";
import Map, { Source, Layer, Marker, FullscreenControl, NavigationControl, LayerProps } from "react-map-gl";

import { WebMercatorViewport } from "@math.gl/web-mercator";

import bbox from "@turf/bbox";
import * as turf from "@turf/helpers";
import { pointData } from "../../../../typings";
import * as Remix from "@remix-run/react";
import { Move } from 'lucide-react';

function CountingPopUp({ selectedPoint, setSelectedPoint }: any) {
    const { popup } = selectedPoint;
    const total = popup.total || 0;
    const date = popup.date || "Data não disponível";
    
    return (
        <div className="absolute top-0 left-0 max-w-sm bg-white shadow-md p-6 m-10 text-sm text-gray-600 uppercase">
            <button
                className="absolute top-0 right-0 hover:text-red-500"
                onClick={(e) => setSelectedPoint(undefined)}
            >
                X
            </button>
            <div className="text-center">
                <h2 className="font-bold">{popup.name || "Ponto de contagem"}</h2>
                <p className="py-2">
                    {total} ciclistas em {date}
                </p>
                {popup.obs && popup.obs !== "" && (
                    <p className="py-2 text-sm text-gray-700">
                        {popup.obs}
                    </p>
                )}
                {popup.url && popup.url !== "" && (
                    <Remix.Link to={popup.url}>
                        <button className="bg-ameciclo text-white p-2">Ver mais</button>
                    </Remix.Link>
                )}
            </div>
        </div>
    );
}

const MapCommands = ({ handleClick, viewport, setViewport, settings, setsettings, isFullscreen, setIsFullscreen, initialViewport, isSelectionMode, toggleSelectionMode, radius, setRadius }: any) => {
    const toggleFullscreen = () => {
        if (typeof document === 'undefined') return;

        const mapContainer = document.querySelector('.map-container');
        if (!document.fullscreenElement) {
            mapContainer?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

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

    const isAtDefaultPosition = () => {
        const tolerance = 0.001;
        return Math.abs(viewport.latitude - initialViewport.latitude) < tolerance &&
            Math.abs(viewport.longitude - initialViewport.longitude) < tolerance &&
            Math.abs(viewport.zoom - initialViewport.zoom) < 0.1;
    };

    return (
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-[60]">
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFullscreen();
                }}
                className="bg-white hover:bg-gray-100 border border-gray-300 rounded p-2 shadow-md transition-colors"
                title="Expandir mapa em tela cheia"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
            </button>

            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleZoomIn();
                }}
                className="hidden md:block bg-white hover:bg-gray-100 border border-gray-300 rounded p-2 shadow-md transition-colors"
                title="Zoom in"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            </button>

            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleZoomOut();
                }}
                className="hidden md:block bg-white hover:bg-gray-100 border border-gray-300 rounded p-2 shadow-md transition-colors"
                title="Zoom out"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
            </button>

            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleToggleDragPan();
                }}
                className={`hidden md:block bg-white hover:bg-gray-100 rounded p-2 shadow-md transition-all ${
                    settings.dragPan ? 'bg-gray-200 border-[3px] border-gray-400' : 'border border-gray-300'
                }`}
                title="Mover mapa"
            >
                <Move className="w-5 h-5" />
            </button>


            
            {toggleSelectionMode && (
                <>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            if (!isSelectionMode) {
                                // Ativar seleção e desativar modo mover
                                setsettings((prev: any) => ({ 
                                    ...prev, 
                                    dragPan: false,
                                    scrollZoom: false 
                                }));
                            } else {
                                // Desativar seleção e reativar modo mover
                                setsettings((prev: any) => ({ 
                                    ...prev, 
                                    dragPan: true,
                                    scrollZoom: true 
                                }));
                            }
                            
                            toggleSelectionMode();
                        }}
                        className={`bg-white hover:bg-gray-100 rounded p-2 shadow-md transition-all ${
                            isSelectionMode ? 'bg-gray-200 border-[3px] border-gray-400' : 'border border-gray-300'
                        }`}
                        title="Selecionar área no mapa"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                    </button>
                    
                    {isSelectionMode && setRadius && (
                        <div className="flex flex-col items-center gap-1">
                            <input
                                type="range"
                                min="100"
                                max="2000"
                                step="100"
                                value={radius}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setRadius(Number(e.target.value));
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                onMouseUp={(e) => e.stopPropagation()}
                                onMouseMove={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.stopPropagation()}
                                onPointerUp={(e) => e.stopPropagation()}
                                onPointerMove={(e) => e.stopPropagation()}
                                className="w-12 h-1"
                            />
                            <div className="text-xs text-white bg-black bg-opacity-50 px-1 rounded">{radius}m</div>
                        </div>
                    )}
                </>
            )}
            
            {!isAtDefaultPosition() && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRecenter();
                    }}
                    className="bg-white hover:bg-gray-100 border border-gray-300 rounded p-2 shadow-md transition-colors"
                    title="Recentralizar mapa"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            )}
        </div>
    );
};

const MapLayersPanel = ({ layersConf, layerVisibility, toggleLayerVisibility }: any) => {

    return (
        <div className="absolute bottom-0 right-0 bg-white border rounded p-4 m-2 shadow-md max-w-xs">
            <h3 className="font-bold mb-2">Filtros do Mapa</h3>
            {layersConf.map((control: any) => {
                const color = control.paint?.["line-color"];
                const isVisible = control.id ? layerVisibility[control.id] !== false : true;
                return (
                    <div
                        className="flex items-center justify-between mb-1 uppercase font-bold"
                        key={control.id}
                    >
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={isVisible}
                                onChange={() => control.id && toggleLayerVisibility(control.id)}
                                className="mr-2"
                            />
                            <span className="text-xs font-bold" style={{ color: color }}>
                                {control.id}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const MAPBOXTOKEN = "pk.eyJ1IjoiaWFjYXB1Y2EiLCJhIjoiODViMTRmMmMwMWE1OGIwYjgxNjMyMGFkM2Q5OWJmNzUifQ.OFgXp9wbN5BJlpuJEcDm4A";
const MAPBOXSTYLE = "mapbox://styles/mapbox/light-v10";

const getInicialViewPort = (pointsData: any, layerData: any) => {
    let standardViewPort = {
        latitude: -8.0584364,
        longitude: -34.945277,
        zoom: 10,
        bearing: 0,
        pitch: 0,
    };

    const hasPoints = pointsData && pointsData.length > 0;
    const hasLayers = layerData && layerData.features && layerData.features.length > 0;

    if (!hasPoints && !hasLayers) {
        return standardViewPort;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    if (hasPoints && pointsData.length > 1) {
        try {
            const lineStringFromPointData = turf.lineString(pointsData.map((point: any) => [point.longitude, point.latitude]));
            const [pMinX, pMinY, pMaxX, pMaxY] = bbox(lineStringFromPointData);
            minX = Math.min(minX, pMinX);
            minY = Math.min(minY, pMinY);
            maxX = Math.max(maxX, pMaxX);
            maxY = Math.max(maxY, pMaxY);
        } catch(e) {
            console.error("Error creating bbox for points", e);
        }
    }

    if (hasLayers) {
        try {
            const [lMinX, lMinY, lMaxX, lMaxY] = bbox(layerData);
            minX = Math.min(minX, lMinX);
            minY = Math.min(minY, lMinY);
            maxX = Math.max(maxX, lMaxX);
            maxY = Math.max(maxY, lMaxY);
        } catch(e) {
            console.error("Error creating bbox for layers", e);
        }
    }
    
    if(minX === Infinity) return standardViewPort;

    const vp = new WebMercatorViewport({
        width: 400,
        height: 500,
        ...standardViewPort,
    });

    const { longitude, latitude, zoom } = vp.fitBounds(
        [
            [minX, minY],
            [maxX, maxY],
        ],
        {
            padding: 40,
        }
    );

    if (latitude && longitude && zoom) {
        standardViewPort.longitude = longitude;
        standardViewPort.latitude = latitude;
        standardViewPort.zoom = zoom;
    }

    return standardViewPort;
};

const getMapInitialState = (defaultDragPan: boolean) => ({
    dragPan: defaultDragPan,
    dragRotate: true,
    scrollZoom: defaultDragPan,
    touchZoom: true,
    touchRotate: true,
    keyboard: true,
    boxZoom: true,
    doubleClickZoom: true,
});

const dropIcon = `M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
C20.1,15.8,20.2,15.8,20.2,15.7z`;

interface MapControlPanelProps {
    controlPanel: { type: string; color: string }[];
    markerVisibility: Record<string, boolean>;
    pointsData: pointData[];
    handleMarkerToggle: (key: string) => void;
}

const MapControlPanel = ({
    controlPanel,
    markerVisibility,
    pointsData,
    handleMarkerToggle,
}: MapControlPanelProps) => {
    return (
        <div className="absolute bottom-0 right-0 bg-white border rounded p-4 mb-2 shadow">
            <h3 className="font-bold mb-2">Legenda</h3>
            {controlPanel.map((control: any) => {
                const filteredPoints = pointsData.filter(
                    (marker: any) => marker.type === control.type
                );
                const checked =
                    filteredPoints.length > 0 &&
                    filteredPoints.every(
                        (point: any) => markerVisibility[point.key] === true
                    );
                return (
                    <div className="flex items-center mb-1 uppercase font-bold" key={control.type}>
                        <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                                filteredPoints.forEach((point: any) =>
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
    );
};

export const AmecicloMap = ({
    layerData,
    layersConf,
    pointsData,
    controlPanel = [],
    showLayersPanel = true,
    width = "auto",
    height = "500px",
    defaultDragPan = false,
    onMapClick,
    isSelectionMode,
    toggleSelectionMode,
    radius,
    setRadius,
    selectedCircles = [],
    selectedPoints = [],
    hoverPoint,
    onMouseMove,
    initialViewState,
    onViewStateChange,
}: {
    layerData?:
    | GeoJSON.Feature<GeoJSON.Geometry>
    | GeoJSON.FeatureCollection<GeoJSON.Geometry>
    | string;
    layersConf?: LayerProps[];
    pointsData?: pointData[];
    width?: string;
    height?: string;
    controlPanel?: any[];
    showLayersPanel?: boolean;
    defaultDragPan?: boolean;
    onMapClick?: (event: any) => void;
    isSelectionMode?: boolean;
    toggleSelectionMode?: () => void;
    radius?: number;
    setRadius?: (radius: number) => void;
    selectedCircles?: Array<{ lat: number; lng: number; radius: number; id: string }>;
    selectedPoints?: Array<{ lat: number; lng: number; id: string; customIcon?: React.ReactNode }>;
    hoverPoint?: { lat: number; lng: number } | null;
    onMouseMove?: (event: any) => void;
    initialViewState?: { latitude: number; longitude: number; zoom: number };
    onViewStateChange?: (viewState: any) => void;
}) => {
    const [isClient, setIsClient] = useState(false);
    const [isMapReady, setIsMapReady] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Pequeno delay para garantir que tudo está hidratado
        const timer = setTimeout(() => {
            setIsMapReady(true);
        }, 100);
        
        // Adicionar CSS para mapbox no head
        if (typeof document !== 'undefined') {
            const existingStyle = document.getElementById('mapbox-custom-styles');
            if (!existingStyle) {
                const style = document.createElement('style');
                style.id = 'mapbox-custom-styles';
                style.textContent = `
                    .mapboxgl-ctrl-attrib {
                        color: #d1d5db !important;
                        font-size: 10px !important;
                        opacity: 0.6 !important;
                    }
                    .mapboxgl-ctrl-attrib a {
                        color: #d1d5db !important;
                        font-size: 10px !important;
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        return () => clearTimeout(timer);
    }, []);

    const [selectedMarker, setSelectedMarker] = useState<pointData | undefined>(
        undefined
    );

    const [viewport, setViewport] = useState({
        latitude: -8.0584364,
        longitude: -34.945277,
        zoom: 10,
        bearing: 0,
        pitch: 0,
    });
    const [initialViewport, setInitialViewport] = useState(viewport);


    const [hasSetInitialViewport, setHasSetInitialViewport] = useState(false);

    useEffect(() => {
        if (isClient && isMapReady && !hasSetInitialViewport) {
            let newViewport;
            if (initialViewState) {
                // Usar viewState fornecido via props
                newViewport = {
                    ...initialViewState,
                    bearing: 0,
                    pitch: 0
                };

            } else {
                // Calcular baseado nos dados
                newViewport = getInicialViewPort(pointsData, layerData);

            }
            setViewport(newViewport);
            setInitialViewport(newViewport);
            setHasSetInitialViewport(true);
        }
    }, [isClient, isMapReady, initialViewState, hasSetInitialViewport]);
    const [settings, setsettings] = useState(getMapInitialState(defaultDragPan));
    const [isFullscreen, setIsFullscreen] = useState(false);

    const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({});
    
    useEffect(() => {
        if (layersConf && isClient) {
            const initialVisibility = layersConf.reduce((obj, layer) => {
                if (layer.id) {
                    obj[layer.id] = true;
                }
                return obj;
            }, {} as Record<string, boolean>);
            setLayerVisibility(initialVisibility);
        }
    }, [layersConf, isClient]);

    const [markerVisibility, setMarkerVisibility] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (pointsData && isClient) {
            const initialVisibility: Record<string, boolean> = {};
            pointsData.forEach(marker => {
                initialVisibility[marker.key] = true; // All markers visible by default
            });
            setMarkerVisibility(initialVisibility);
        }
    }, [pointsData, isClient]);

    const handleMarkerToggle = (key: string) => {
        setMarkerVisibility((prev) => {
            const newState = {
                ...prev,
                [key]: !prev?.[key],
            };
            return newState;
        });
    };

    const toggleLayerVisibility = (layerId: string) => {
        setLayerVisibility((prev) => ({
            ...prev,
            [layerId]: !prev[layerId],
        }));
    };

    return (
        <section className={width === "100%" ? "w-full" : "container mx-auto"} style={{height: height === "100%" ? "100%" : "auto"}}>
            <div className={`relative bg-gray-200 map-container ${isFullscreen ? 'fixed inset-0 z-50 w-screen h-screen rounded shadow-2xl' : width === "100%" ? 'w-full h-full' : 'rounded shadow-2xl'}`} style={{height: height === "100%" ? "100%" : height}}>
                {isClient && isMapReady && (
                    <Map
                        {...viewport}
                        {...settings}
                        width="100%"
                        height={isFullscreen ? "100vh" : height}
                        onViewportChange={(newViewport) => {
                            setViewport(newViewport);
                            if (onViewStateChange) {
                                onViewStateChange(newViewport);
                            }
                        }}
                        mapStyle={MAPBOXSTYLE}
                        mapboxApiAccessToken={MAPBOXTOKEN}
                        getCursor={({ isDragging }) => {
                            if (isSelectionMode) return 'pointer';
                            return settings.dragPan ? (isDragging ? 'grabbing' : 'grab') : 'pointer';
                        }}
                        onClick={onMapClick}
                        onMouseDown={onMapClick}
                        onMouseMove={onMouseMove}
                    >

                        <MapCommands viewport={viewport} setViewport={setViewport} settings={settings} setsettings={setsettings} isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen} initialViewport={initialViewport} isSelectionMode={isSelectionMode} toggleSelectionMode={toggleSelectionMode} radius={radius} setRadius={setRadius} />
                        {layerData && (
                            <Source id="layersMap" type="geojson" data={layerData}>
                                {layersConf?.map((layer: any, i: number) =>
                                    layer.id && layerVisibility[layer.id] !== false && (
                                        <Layer key={layer.id || i} {...layer} />
                                    )
                                )}
                            </Source>
                        )}
                        {pointsData?.map((point) => {
                            const { key, latitude, longitude, size, color, customIcon } = point;
                            return (
                                markerVisibility &&
                                markerVisibility[key] == true && (
                                    <Marker
                                        key={key}
                                        latitude={latitude}
                                        longitude={longitude}
                                        onClick={() => setSelectedMarker(point)}
                                    >
                                        {customIcon ? (
                                            <div style={{ cursor: "pointer", transform: "translate(-50%, -100%)" }}>
                                                {customIcon}
                                            </div>
                                        ) : (
                                            <svg
                                                height={size ? size : 15}
                                                viewBox="0 0 24 24"
                                                style={{
                                                    cursor: "pointer",
                                                    fill: color ? color : "#008080",
                                                    stroke: "none",
                                                    transform: `translate(${- (size ? size : 15) / 2}px,${- (size ? size : 15)}px)`,
                                                }}
                                            >
                                                <path d={dropIcon} />
                                            </svg>
                                        )}
                                    </Marker>
                                )
                            );
                        })}

                        {hoverPoint && radius && (() => {
                            const metersPerPixel = 156543.03392 * Math.cos(hoverPoint.lat * Math.PI / 180) / Math.pow(2, viewport.zoom);
                            const radiusInPixels = radius / metersPerPixel;
                            const circleSize = Math.max(10, Math.min(400, radiusInPixels * 2));
                            
                            return (
                                <Marker
                                    latitude={hoverPoint.lat}
                                    longitude={hoverPoint.lng}
                                >
                                    <div 
                                        style={{
                                            width: `${circleSize}px`,
                                            height: `${circleSize}px`,
                                            borderRadius: '50%',
                                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                            border: '2px dashed #ef4444',
                                            transform: 'translate(-50%, -50%)',
                                            pointerEvents: 'none'
                                        }}
                                    />
                                </Marker>
                            );
                        })()}
                        {selectedCircles && selectedCircles.length > 0 && selectedCircles.map((circle) => {
                            const metersPerPixel = 156543.03392 * Math.cos(circle.lat * Math.PI / 180) / Math.pow(2, viewport.zoom);
                            const radiusInPixels = circle.radius / metersPerPixel;
                            const circleSize = Math.max(10, Math.min(400, radiusInPixels * 2));
                            
                            return (
                                <Marker
                                    key={circle.id}
                                    latitude={circle.lat}
                                    longitude={circle.lng}
                                >
                                    <div 
                                        style={{
                                            width: `${circleSize}px`,
                                            height: `${circleSize}px`,
                                            borderRadius: '50%',
                                            backgroundColor: 'rgba(239, 68, 68, 0.3)',
                                            border: '2px solid #ef4444',
                                            transform: 'translate(-50%, -50%)',
                                            pointerEvents: 'none'
                                        }}
                                    />
                                </Marker>
                            );
                        })}

                        {selectedPoints && selectedPoints.length > 0 && selectedPoints.map((point) => (
                            <Marker
                                key={point.id}
                                latitude={point.lat}
                                longitude={point.lng}
                            >
                                <div style={{ transform: "translate(-50%, -100%)" }}>
                                    {point.customIcon}
                                </div>
                            </Marker>
                        ))}

                        {selectedMarker !== undefined && (
                            <CountingPopUp
                                selectedPoint={selectedMarker}
                                setSelectedPoint={setSelectedMarker}
                            />
                        )}
                        {controlPanel.length > 0 && (
                            <MapControlPanel
                                controlPanel={controlPanel}
                                markerVisibility={markerVisibility}
                                pointsData={pointsData}
                                handleMarkerToggle={handleMarkerToggle}
                            />
                        )}
                        {showLayersPanel && layersConf && layersConf.length > 0 && (
                            <MapLayersPanel
                                layersConf={layersConf}
                                layerVisibility={layerVisibility}
                                toggleLayerVisibility={toggleLayerVisibility}
                            />
                        )}
                    </Map>
                )}
            </div>
        </section>
    );
};