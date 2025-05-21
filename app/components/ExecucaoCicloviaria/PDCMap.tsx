import { useState } from "react";
import {
    Map,
    Source,
    Layer,
    Marker,
    FullscreenControl,
    NavigationControl,
    LayerProps,
} from "react-map-gl";

import { WebMercatorViewport } from "@math.gl/web-mercator";

import bbox from "@turf/bbox";
import * as turf from "@turf/helpers";
import { pointData } from "../../../typings";
import { Link } from "@remix-run/react";

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
                <p className="py-2">
                    {selectedPoint.popup.total} ciclistas em {selectedPoint.popup.date}
                </p>
                {selectedPoint.popup.obs != "" && (
                    <p className="py-2 text-sm text-gray-700">
                        {selectedPoint.popup.obs}
                    </p>
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

const MapMarker = ({ size = 20, icon, color = "#008888" }: any) => {
    return (
        <>
            <svg
                height={size}
                viewBox="0 0 24 24"
                style={{
                    cursor: "pointer",
                    fill: color,
                    stroke: "none",
                    transform: `translate(${-size / 2}px,${-size}px)`,
                }}
            >
                <path d={icon} />
            </svg>
        </>
    );
};

const MapCommands = ({ handleClick }: any) => {
    const controlStyle = { right: 10, top: 10 };
    return (
        <>
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    padding: "10px",
                    zIndex: 500,
                }}
            >
                <button onClick={handleClick}>
                    <FullscreenControl style={controlStyle} />
                </button>
            </div>

            <div
                style={{
                    position: "absolute",
                    top: 40,
                    right: 0,
                    padding: "10px",
                    zIndex: 500,
                }}
            >
                <NavigationControl style={controlStyle} />
            </div>
        </>
    );
};

const MapLayersPanel = ({ layersConf }: any) => {
    return (
        <div className="absolute bottom-0 right-0 bg-white border rounded p-4 m-2 shadow-md">
            <h3 className="font-bold mb-2">Legenda</h3>
            {layersConf.map((control: any) => {
                const color = control.paint["line-color"];
                return (
                    <div
                        className="flex items-center mb-1 uppercase font-bold"
                        key={control.id}
                    >
                        <span className="ml-2 text-sm font-bold" style={{ color: color }}>
                            {control.id}
                        </span>
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
        zoom: 20,
        bearing: 0,
        pitch: 0,
    };

    let points = [
        [-34.9452, -8.05843],
        [-34.945277, -8.0584364],
    ];
    if (pointsData)
        points = pointsData.map((point: any) => [point.longitude, point.latitude]);
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
    scrollZoom: false,
    touchZoom: true,
    touchRotate: true,
    keyboard: true,
    boxZoom: true,
    doubleClickZoom: true,
};

const dropIcon = `M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
C20.1,15.8,20.2,15.8,20.2,15.7z`;

const MapControlPanel = ({
    controlPanel,
    markerVisibility,
    pointsData,
    handleMarkerToggle,
}: any | [any[], any]) => {
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

export const PDCMap = ({
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

    const [markerVisibility, setMarkerVisibility] = useState<Record<string, boolean>>(
        pointsData?.reduce((obj, marker) => {
            obj[marker.key] = true;
            return obj;
        }, {} as Record<string, boolean>) ?? {}
    );

    const handleMarkerToggle = (key: string) => {
        setMarkerVisibility((prev) => ({
            ...prev,
            [key]: !prev?.[key],
        }));
    };

    return (
        <section className="container mx-auto">
            <div className="relative bg-green-200 rounded shadow-2xl">
                <Map
                    {...viewport}
                    {...settings}
                    style={{ width: "100%", height: "500px" }}
                    onMove={(evt: any) => setViewport(evt.viewState)}
                    mapStyle={MAPBOXSTYLE}
                    mapboxAccessToken={MAPBOXTOKEN}
                >
                    <MapCommands handleClick={handleClick} />
                    {layerData && (
                        <Source id="layersMap" type="geojson" data={layerData}>
                            {layersConf?.map((layer: any, i: number) => (
                                <Layer key={layer.id || i} {...layer} />
                            ))}
                        </Source>
                    )}
                    {pointsData?.map(
                        (point) =>
                            markerVisibility &&
                            markerVisibility[point.key] == true && (
                                <Marker {...point} onClick={() => setSelectedPoint(point)}>
                                    <MapMarker
                                        icon={dropIcon}
                                        size={point.size ? point.size : 15}
                                        color={point.color ? point.color : "#008080"}
                                    />
                                </Marker>
                            )
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
                    {layersConf && layersConf.length > 0 && (
                        <MapLayersPanel
                            layersConf={layersConf}
                        />
                    )}
                </Map>
            </div>
        </section>
    );
};