import { useState, useEffect } from "react";
import Map, { Source, Layer, Marker, Popup, FullscreenControl, NavigationControl, LayerProps } from "react-map-gl";

import { WebMercatorViewport } from "@math.gl/web-mercator";

import bbox from "@turf/bbox";
import * as turf from "@turf/helpers";
import { pointData } from "../../../../typings";
import * as Remix from "@remix-run/react";
import { Move } from 'lucide-react';



const MapCommands = ({ handleClick, viewport, setViewport, settings, setsettings, isFullscreen, setIsFullscreen, initialViewport, isSelectionMode, toggleSelectionMode, toggleDragPan, dragPanEnabled, radius, setRadius }: any) => {
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
        const newViewport = { ...viewport, zoom: viewport.zoom + 1 };
        setViewport(newViewport);
        if (onViewStateChange) {
            onViewStateChange(newViewport);
        }
    };

    const handleZoomOut = () => {
        const newViewport = { ...viewport, zoom: viewport.zoom - 1 };
        setViewport(newViewport);
        if (onViewStateChange) {
            onViewStateChange(newViewport);
        }
    };

    const handleRecenter = () => {
        // Resetar para a posição inicial padrão do Recife
        const defaultViewport = {
            latitude: -8.0584364,
            longitude: -34.945277,
            zoom: 10,
            bearing: 0,
            pitch: 0
        };
        setViewport(defaultViewport);
    };

    const handleToggleDragPan = () => {
        if (toggleDragPan) {
            toggleDragPan();
        } else {
            setsettings((prev: any) => ({ 
                ...prev, 
                dragPan: !prev.dragPan,
                scrollZoom: !prev.scrollZoom 
            }));
        }
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
                className="bg-white hover:bg-gray-100 border border-gray-300 rounded p-2 shadow-md transition-colors"
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
                className="bg-white hover:bg-gray-100 border border-gray-300 rounded p-2 shadow-md transition-colors"
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
                    (dragPanEnabled !== undefined ? dragPanEnabled : settings.dragPan) ? 'bg-gray-200 border-[3px] border-gray-400' : 'border border-gray-300'
                }`}
                title="Mover mapa"
            >
                <Move className="w-5 h-5" />
            </button>


            

            
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRecenter();
                }}
                className="bg-white hover:bg-gray-100 border border-gray-300 rounded p-2 shadow-md transition-colors"
                title="Voltar para visão geral"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            </button>
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
    toggleDragPan,
    dragPanEnabled,
    radius,
    setRadius,
    selectedCircles = [],
    selectedPoints = [],
    hoverPoint,
    onMouseMove,
    initialViewState,
    onViewStateChange,
    onPointClick,
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
    toggleDragPan?: () => void;
    dragPanEnabled?: boolean;
    radius?: number;
    setRadius?: (radius: number) => void;
    selectedCircles?: Array<{ lat: number; lng: number; radius: number; id: string }>;
    selectedPoints?: Array<{ lat: number; lng: number; id: string; customIcon?: React.ReactNode }>;
    hoverPoint?: { lat: number; lng: number } | null;
    onMouseMove?: (event: any) => void;
    initialViewState?: { latitude: number; longitude: number; zoom: number };
    onViewStateChange?: (viewState: any) => void;
    onPointClick?: (point: any) => void;
}) => {
    const [isClient, setIsClient] = useState(false);
    const [isMapReady, setIsMapReady] = useState(false);

    useEffect(() => {
        setIsClient(true);
        
        // Adicionar CSS para mapbox no head
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
                .mapboxgl-popup {
                    max-width: none !important;
                }
                .mapboxgl-popup-content {
                    padding: 0 !important;
                    background: transparent !important;
                    box-shadow: none !important;
                    border: none !important;
                }
                .mapboxgl-popup-close-button {
                    display: none !important;
                }
                .mapboxgl-popup-tip {
                    border-top-color: white !important;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Delay menor para evitar problemas de hidratação
        const timer = setTimeout(() => {
            setIsMapReady(true);
        }, 50);
        
        return () => clearTimeout(timer);
    }, []);



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
    const [settings, setsettings] = useState(() => ({
        dragPan: dragPanEnabled ?? defaultDragPan,
        dragRotate: true,
        scrollZoom: dragPanEnabled ?? defaultDragPan,
        touchZoom: true,
        touchRotate: true,
        keyboard: true,
        boxZoom: true,
        doubleClickZoom: true,
    }));
    
    // Atualizar settings quando dragPanEnabled mudar
    useEffect(() => {
        if (dragPanEnabled !== undefined) {
            setsettings(prev => ({
                ...prev,
                dragPan: dragPanEnabled,
                scrollZoom: dragPanEnabled
            }));
        }
    }, [dragPanEnabled]);
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
    const [selectedMarker, setSelectedMarker] = useState<pointData | null>(null);

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
                        onMove={(evt) => {
                            const newViewport = evt.viewState;
                            setViewport(newViewport);
                            if (onViewStateChange) {
                                onViewStateChange(newViewport);
                            }
                        }}
                        onViewStateChange={(evt) => {
                            const newViewport = evt.viewState;
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
                        onClick={(e) => {
                            setSelectedMarker(null);
                            if (onMapClick) onMapClick(e);
                        }}
                        onMouseDown={onMapClick}
                        onMouseMove={onMouseMove}
                    >

                        <MapCommands viewport={viewport} setViewport={setViewport} settings={settings} setsettings={setsettings} isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen} initialViewport={initialViewport} isSelectionMode={isSelectionMode} toggleSelectionMode={toggleSelectionMode} toggleDragPan={toggleDragPan} dragPanEnabled={dragPanEnabled} radius={radius} setRadius={setRadius} />
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
                            
                            const zoomAdjustedSize = viewport.zoom >= 16 
                                ? Math.max((size || 15) * 0.8, 15)
                                : size || 15;
                            
                            return (
                                markerVisibility &&
                                markerVisibility[key] == true && (
                                    <Marker
                                        key={key}
                                        latitude={latitude}
                                        longitude={longitude}
                                        onClick={(e) => {
                                            e?.originalEvent?.stopPropagation?.();
                                            
                                            if (point.type === 'bicicletario' || point.type === 'bikepe') {
                                                setSelectedMarker(point);
                                            }
                                            
                                            if (onPointClick) {
                                                onPointClick(point);
                                            }
                                        }}
                                    >
                                        {customIcon ? (
                                            <div style={{ cursor: "pointer", transform: "translate(-50%, -100%)" }}>
                                                {customIcon}
                                            </div>
                                        ) : (
                                            <svg
                                                height={zoomAdjustedSize}
                                                width={zoomAdjustedSize}
                                                viewBox="0 0 24 24"
                                                style={{
                                                    cursor: "pointer",
                                                    fill: color ? color : "#008080",
                                                    stroke: "white",
                                                    strokeWidth: viewport.zoom > 14 ? "1" : "0.5",
                                                    transform: `translate(${-zoomAdjustedSize / 2}px, ${-zoomAdjustedSize}px)`,
                                                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                                                    transition: viewport.zoom > 16 ? "none" : "all 0.2s ease"
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

                        {selectedMarker && (
                            <Popup
                                latitude={selectedMarker.latitude}
                                longitude={selectedMarker.longitude}
                                onClose={() => setSelectedMarker(null)}
                                closeButton={true}
                                closeOnClick={false}
                                offsetTop={-10}
                                anchor="bottom"
                            >
                                <div className="bg-white rounded-lg shadow-xl border-0 overflow-hidden min-w-[280px] max-w-[320px]">
                                    <div className={`px-4 py-3 text-white ${
                                        selectedMarker.type === 'bikepe' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                                        'bg-gradient-to-r from-blue-500 to-blue-600'
                                    }`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {selectedMarker.type === 'bikepe' ? (
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M5 12c0-2.8 2.2-5 5-5s5 2.2 5 5-2.2 5-5 5-5-2.2-5-5zm14 0c0-2.8 2.2-5 5-5s5 2.2 5 5-2.2 5-5 5-5-2.2-5-5z"/>
                                                        <path d="M10 12h4"/>
                                                    </svg>
                                                ) : (
                                                    <span className="text-lg font-bold">∩</span>
                                                )}
                                                <h3 className="font-semibold text-base truncate">{selectedMarker.popup?.name || (selectedMarker.type === 'bikepe' ? 'Estação Bike PE' : 'Bicicletário')}</h3>
                                            </div>
                                            <button 
                                                onClick={() => setSelectedMarker(null)}
                                                className="text-white hover:bg-black hover:bg-opacity-20 rounded-full p-1 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4">
                                        {selectedMarker.type === 'bikepe' ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                                    <span className="font-medium">{selectedMarker.popup?.total}</span>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div className="bg-gray-50 p-2 rounded">
                                                        <div className="text-xs text-gray-500 uppercase tracking-wide">Referência</div>
                                                        <div className="font-medium text-gray-900">#{selectedMarker.popup?.ref}</div>
                                                    </div>
                                                    <div className="bg-gray-50 p-2 rounded">
                                                        <div className="text-xs text-gray-500 uppercase tracking-wide">Capacidade</div>
                                                        <div className="font-medium text-gray-900">{selectedMarker.popup?.capacity} bikes</div>
                                                    </div>
                                                    <div className="bg-gray-50 p-2 rounded">
                                                        <div className="text-xs text-gray-500 uppercase tracking-wide">Rede</div>
                                                        <div className="font-medium text-gray-900">{selectedMarker.popup?.network}</div>
                                                    </div>
                                                    <div className="bg-gray-50 p-2 rounded">
                                                        <div className="text-xs text-gray-500 uppercase tracking-wide">Operador</div>
                                                        <div className="font-medium text-gray-900">{selectedMarker.popup?.operator}</div>
                                                    </div>
                                                </div>
                                                
                                                <div className="border-t pt-3">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                                            </svg>
                                                            <span className="text-gray-600">Cartão: {selectedMarker.popup?.payment_credit}</span>
                                                        </div>
                                                        <div className="text-gray-600">Taxa: {selectedMarker.popup?.fee}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                    <span className="font-medium">{selectedMarker.popup?.total}</span>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div className="bg-gray-50 p-2 rounded">
                                                        <div className="text-xs text-gray-500 uppercase tracking-wide">Capacidade</div>
                                                        <div className="font-medium text-gray-900">{selectedMarker.popup?.capacity}</div>
                                                    </div>
                                                    <div className="bg-gray-50 p-2 rounded">
                                                        <div className="text-xs text-gray-500 uppercase tracking-wide">Coberto</div>
                                                        <div className="font-medium text-gray-900">{selectedMarker.popup?.covered}</div>
                                                    </div>
                                                    <div className="bg-gray-50 p-2 rounded">
                                                        <div className="text-xs text-gray-500 uppercase tracking-wide">Acesso</div>
                                                        <div className="font-medium text-gray-900">{selectedMarker.popup?.access}</div>
                                                    </div>
                                                    <div className="bg-gray-50 p-2 rounded">
                                                        <div className="text-xs text-gray-500 uppercase tracking-wide">Tipo</div>
                                                        <div className="font-medium text-gray-900">{selectedMarker.popup?.parking_type}</div>
                                                    </div>
                                                </div>
                                                
                                                {selectedMarker.popup?.operator !== 'Não informado' && (
                                                    <div className="border-t pt-3">
                                                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Operador</div>
                                                        <div className="text-sm font-medium text-gray-900">{selectedMarker.popup?.operator}</div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Popup>
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