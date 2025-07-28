import { useState, useEffect } from "react";
import Map, { Source, Layer, Marker, FullscreenControl, NavigationControl, LayerProps } from "react-map-gl";

import { WebMercatorViewport } from "@math.gl/web-mercator";

import bbox from "@turf/bbox";
import * as turf from "@turf/helpers";
import { pointData } from "../../../../typings";
import * as Remix from "@remix-run/react";

function CountingPopUp({ selectedPoint, setSelectedPoint }: any) {
    return (
        <div className="absolute top-0 left-0 max-w-sm bg-white shadow-md p-6 m-10 text-sm text-gray-600 uppercase">
            <button
                className="absolute top-0 right-0 hover:text-red-500"
                onClick={(e) => setSelectedPoint(undefined)}
            >
                X
            </button>
            <div className="text-center">
                <h2 className="font-bold">{selectedPoint.popup.name}</h2>
                <p>Popup Content</p>
            </div>
        </div>
    );
}

const MapCommands = ({ handleClick, viewport, setViewport, settings, setsettings, isFullscreen, setIsFullscreen, initialViewport }: any) => {
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

    const isAtDefaultPosition = () => {
        const tolerance = 0.001;
        return Math.abs(viewport.latitude - initialViewport.latitude) < tolerance &&
            Math.abs(viewport.longitude - initialViewport.longitude) < tolerance &&
            Math.abs(viewport.zoom - initialViewport.zoom) < 0.1;
    };

    return (
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-50">
            <button
                onClick={toggleFullscreen}
                className="bg-white hover:bg-gray-100 border border-gray-300 rounded p-2 shadow-md transition-colors"
                title="Expandir mapa em tela cheia"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
            </button>

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

            {!isAtDefaultPosition() && (
                <button
                    onClick={handleRecenter}
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

    let points = [
        [-34.9452, -8.05843],
        [-34.945277, -8.0584364],
    ];
    if (pointsData) {
        points = pointsData.map((point: any) => [point.longitude, point.latitude]);
        if (points.length === 1) {
            points.push(points[0]);
        }
    }
    const lineStringFromPointData = turf.lineString(points);
    const [PminX, PminY, PmaxX, PmaxY] = bbox(lineStringFromPointData);

    let lineStringFromLayersData = lineStringFromPointData;
    if (layerData) lineStringFromLayersData = layerData;
    const [LminX, LminY, LmaxX, LmaxY] = bbox(lineStringFromLayersData);

    let [minX, minY, maxX, maxY] = [PminX, PminY, PmaxX, PmaxY];
    if (pointsData && layerData) {
        minX = Math.min(PminX, LminX);
        minY = Math.min(PminY, LminY);
        maxX = Math.max(PmaxX, LmaxX);
        maxY = Math.max(PmaxY, LmaxY);
    } else if (!pointsData && layerData) {
        [minX, minY, maxX, maxY] = [LminX, LminY, LmaxX, LmaxY]
    }

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

const mapInicialState = {
    dragPan: true,
    dragRotate: true,
    scrollZoom: true,
    touchZoom: true,
    touchRotate: true,
    keyboard: true,
    boxZoom: true,
    doubleClickZoom: true,
};

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
}) => {
    const inicialViewPort = getInicialViewPort(pointsData, layerData);

    const [selectedPoint, setSelectedPoint] = useState<pointData | undefined>(
        undefined
    );

    const [viewport, setViewport] = useState(inicialViewPort);
    const [settings, setsettings] = useState({ ...mapInicialState });
    const [isFullscreen, setIsFullscreen] = useState(false);

    const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>(
        layersConf?.reduce((obj, layer) => {
            if (layer.id) {
                obj[layer.id] = true;
            }
            return obj;
        }, {} as Record<string, boolean>) ?? {}
    );

    const handleClick = () => {
        setsettings({
            dragPan: true,
            dragRotate: true,
            scrollZoom: settings.scrollZoom ? false : true,
            touchZoom: true,
            touchRotate: true,
            keyboard: true,
            boxZoom: true,
            doubleClickZoom: true,
        });
    };

    const [markerVisibility, setMarkerVisibility] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (pointsData) {
            const initialVisibility: Record<string, boolean> = {};
            pointsData.forEach(marker => {
                initialVisibility[marker.key] = true; // All markers visible by default
            });
            setMarkerVisibility(initialVisibility);
        }
    }, [pointsData]);

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
        <section className="container mx-auto">
            <div className={`relative bg-gray-200 rounded shadow-2xl map-container ${isFullscreen ? 'fixed inset-0 z-50 w-screen h-screen' : ''
                }`}>
                <Map
                    {...viewport}
                    {...settings}
                    width="100%"
                    height={isFullscreen ? "100vh" : "500px"}
                    onViewportChange={setViewport}
                    mapStyle={MAPBOXSTYLE}
                    mapboxApiAccessToken={MAPBOXTOKEN}
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
                    <MapCommands handleClick={handleClick} viewport={viewport} setViewport={setViewport} settings={settings} setsettings={setsettings} isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen} initialViewport={inicialViewPort} />
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
                        const { key, latitude, longitude, size, color } = point;
                        return (
                            markerVisibility &&
                            markerVisibility[key] == true && (
                                <Marker
                                    key={key}
                                    latitude={latitude}
                                    longitude={longitude}
                                    onClick={() => setSelectedPoint(point)}
                                >
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
                                </Marker>
                            )
                        );
                    })}
                    {selectedPoint !== undefined && (
                        <CountingPopUp
                            selectedPoint={selectedPoint}
                            setSelectedPoint={setSelectedPoint}
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
                    {layersConf && layersConf.length > 0 && (
                        <MapLayersPanel
                            layersConf={layersConf}
                            layerVisibility={layerVisibility}
                            toggleLayerVisibility={toggleLayerVisibility}
                        />
                    )}
                </Map>
            </div>
        </section>
    );
};