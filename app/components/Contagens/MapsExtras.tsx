import { Link } from "@remix-run/react";
import { FullscreenControl, NavigationControl, Popup } from "react-map-gl";

export const MapMarker = ({ size = 20, icon, color = "#008888" }: any) => {
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

export const MapCommands = ({ handleClick }: any) => {
    const controlStyle = { right: 10, top: 10 };
    return (
      <>
        <div style={{ position: "absolute", top: 0, right: 0, padding: "10px", zIndex: 500 }}>
          <FullscreenControl style={controlStyle} />
        </div>
  
        <div style={{ position: "absolute", top: 40, right: 0, padding: "10px", zIndex: 500 }}>
          <NavigationControl style={controlStyle} />
        </div>
  
        <div style={{ position: "absolute", top: 80, right: 0, padding: "10px", zIndex: 500 }}>
          <button onClick={handleClick} className="p-2 bg-gray-200 rounded shadow">
            Toggle Zoom
          </button>
        </div>
      </>
    );
  };
  

export function CountingPopUp({ selectedPoint, setSelectedPoint }: any) {
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
