import React, { useState } from "react";
import ReactMapGL, { Source, Layer, Marker, LayerProps, NavigationControl, FullscreenControl } from "react-map-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import bbox from "@turf/bbox";
import * as turf from "@turf/helpers";
import { Link } from "@remix-run/react";
import { pointData } from "../../../typings";

export const MAPBOXTOKEN = typeof window !== 'undefined' ? (window as any).MAPBOX_TOKEN : "pk.eyJ1IjoiaWFjYXB1Y2EiLCJhIjoiODViMTRmMmMwMWE1OGIwYjgxNjMyMGFkM2Q5OWJmNzUifQ.OFgXp9wbN5BJlpuJEcDm4A";
export const MAPBOXSTYLE = "mapbox://styles/mapbox/light-v10";

const isValidCoordinate = (lng: number, lat: number) => {
    return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90 && !isNaN(lng) && !isNaN(lat);
};

export const getInicialViewPort = (pointsData: any, layerData: any) => {
    let standardViewPort = {
        latitude: -8.0476,
        longitude: -34.8770,
        zoom: 11,
        bearing: 0,
        pitch: 0,
    };

    let points = [
        [-34.8770, -8.0476],
        [-34.8770, -8.0476],
    ];

    if (pointsData && pointsData.length > 0) {
        const validPoints = pointsData
            .filter((point: any) => 
                point.longitude !== undefined && 
                point.latitude !== undefined &&
                isValidCoordinate(point.longitude, point.latitude)
            )
            .map((point: any) => [point.longitude, point.latitude]);
        
        if (validPoints.length > 0) {
            points = validPoints;
        }
    }

    try {
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
            [minX, minY, maxX, maxY] = [LminX, LminY, LmaxX, LmaxY];
        }

        // Calcular bounds usando padding como no original
        const padding = 40;
        const width = 400;
        const height = 500;
        
        // Simular fitBounds do WebMercatorViewport
        const centerLng = (minX + maxX) / 2;
        const centerLat = (minY + maxY) / 2;
        
        // Calcular zoom baseado na distância
        const lngDiff = maxX - minX;
        const latDiff = maxY - minY;
        const maxDiff = Math.max(lngDiff, latDiff);
        
        let zoom = 12;
        if (maxDiff < 0.01) zoom = 16;
        else if (maxDiff < 0.05) zoom = 14;
        else if (maxDiff < 0.1) zoom = 12;
        else if (maxDiff < 0.5) zoom = 10;
        else zoom = 8;

        if (isValidCoordinate(centerLng, centerLat)) {
            standardViewPort.longitude = centerLng;
            standardViewPort.latitude = centerLat;
            standardViewPort.zoom = zoom;
        }
    } catch (error) {
        console.warn('Erro ao calcular viewport do mapa, usando coordenadas padrão:', error);
    }

    return standardViewPort;
};

export const mapInicialState = {
    dragPan: true,
    dragRotate: true,
    scrollZoom: false,
    touchZoom: true,
    touchRotate: true,
    keyboard: true,
    boxZoom: true,
    doubleClickZoom: true,
};

export const dropIcon = `M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
C20.1,15.8,20.2,15.8,20.2,15.7z`;

export const standartDropIconSize = 20;

export const CountsMap = ({
    layerData,
    layersConf,
    pointsData,
    width = "100%",
    height = "500px",
    controlPanel = [],
}: {
    layerData?: GeoJSON.Feature<GeoJSON.Geometry> | GeoJSON.FeatureCollection<GeoJSON.Geometry> | string;
    layersConf?: LayerProps[];
    pointsData?: pointData[];
    width?: string;
    height?: string;
    controlPanel?: any[];
}) => {
    const inicialViewPort = getInicialViewPort(pointsData, layerData);

    const [selectedPoint, setSelectedPoint] = useState<pointData | undefined>(undefined);
    const [viewport, setViewport] = useState(inicialViewPort);
    const [settings, setsettings] = useState({ ...mapInicialState });



    const [markerVisibility, setMarkerVisibility]: any = useState(
        pointsData?.reduce((obj, marker) => ({ ...obj, [marker.key]: true }), {})
    );

    const handleMarkerToggle = (key: string) => {
        setMarkerVisibility((prev: any = {}) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <section className="container mx-auto">
            <div className="relative bg-green-200 rounded shadow-2xl overflow-hidden">
                <ReactMapGL
                    {...viewport}
                    {...settings}
                    onViewportChange={setViewport}
                    mapStyle={MAPBOXSTYLE}
                    mapboxApiAccessToken={MAPBOXTOKEN}
                    width={width}
                    height={height}
                >
                    <NavigationControl position="top-right" showCompass={false} />
                    <FullscreenControl position="top-right" />

                    {layerData && (
                        <Source id="layersMap" type="geojson" data={layerData}>
                            {layersConf?.map((layer: any) => (
                                <Layer key={layer.id} {...layer} />
                            ))}
                        </Source>
                    )}

                    {pointsData?.map((point) =>
                        markerVisibility &&
                        markerVisibility[point.key] === true &&
                        isValidCoordinate(point.longitude, point.latitude) ? (
                            <Marker
                                key={point.key}
                                longitude={point.longitude}
                                latitude={point.latitude}
                                onClick={() => setSelectedPoint(point)}
                            >
                                <MapMarker
                                    icon={dropIcon}
                                    size={point.size ? point.size : 15}
                                    color={point.color ? point.color : "#008080"}
                                />
                            </Marker>
                        ) : null
                    )}

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

                    {layersConf && layersConf.length > 0 && <MapLayersPanel layersConf={layersConf} />}
                </ReactMapGL>
            </div>
        </section>
    );
};



const MapMarker = ({ size = 20, icon, color = "#008888" }: any) => (
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

const MapControlPanel = ({ controlPanel, markerVisibility, pointsData, handleMarkerToggle }: any) => (
    <div className="absolute bottom-0 right-0 bg-white border rounded p-4 mb-2 shadow">
        <h3 className="font-bold mb-2">Legenda</h3>
        {controlPanel.map((control: any) => {
            const filteredPoints = pointsData.filter((marker: any) => marker.type === control.type);
            const checked =
                filteredPoints.length > 0 &&
                filteredPoints.every((point: any) => markerVisibility[point.key] === true);

            return (
                <div className="flex items-center mb-1 uppercase font-bold" key={control.type}>
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                            filteredPoints.forEach((point: any) => handleMarkerToggle(point.key));
                        }}
                    />
                    <span className="ml-2 text-sm font-medium" style={{ color: control.color }}>
                        {control.type}
                    </span>
                </div>
            );
        })}
    </div>
);

const MapLayersPanel = ({ layersConf }: any) => (
    <div className="absolute bottom-0 right-0 bg-white border rounded p-4 m-2 shadow-md">
        <h3 className="font-bold mb-2">Legenda</h3>
        {layersConf.map((control: any) => {
            const color = control.paint["line-color"];
            return (
                <div className="flex items-center mb-1 uppercase font-bold" key={control.id}>
                    <span className="ml-2 text-sm font-bold" style={{ color: color }}>
                        {control.id}
                    </span>
                </div>
            );
        })}
    </div>
);

function CountingPopUp({ selectedPoint, setSelectedPoint }: any) {
    return (
        <div className="absolute top-0 left-0 max-w-sm bg-white shadow-md p-6 m-10 text-sm text-gray-600 uppercase">
            <button
                className="absolute top-0 right-0 hover:text-red-500"
                onClick={() => setSelectedPoint(undefined)}
            >
                X
            </button>
            <div className="text-center">
                <h2 className="font-bold">{selectedPoint.popup.name}</h2>
                <p className="py-2">
                    {selectedPoint.popup.total} ciclistas em {selectedPoint.popup.date}
                </p>
                {selectedPoint.popup.obs != "" && (
                    <p className="py-2 text-sm text-gray-700">{selectedPoint.popup.obs}</p>
                )}
                {selectedPoint.popup.url != "" && (
                    <Link to={selectedPoint.popup.url}>
                        <button className="bg-ameciclo text-white p-2">Ver mais</button>
                    </Link>
                )}
            </div>
        </div>
    );
}