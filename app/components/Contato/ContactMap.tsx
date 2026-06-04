import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";

const AmecicloMarker = () => (
  <div className="flex flex-col items-center">
    <div className="w-10 h-10 bg-white rounded-full border-3 border-[#008080] shadow-lg flex items-center justify-center overflow-hidden">
      <img src="/miniatura-ameciclo-logo.webp" alt="Ameciclo" className="w-7 h-7 object-contain" />
    </div>
    <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#008080] -mt-[1px]" />
  </div>
);

export function ContactMap() {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <AmecicloMap
        height="100%"
        width="100%"
        pointsData={[
          {
            key: "sede-ameciclo",
            latitude: -8.059349,
            longitude: -34.880116,
            size: 30,
            color: "#008080",
            type: "sede",
            popup: { name: "Sede da Ameciclo" },
            customIcon: <AmecicloMarker />,
          },
        ]}
        initialViewState={{ latitude: -8.059349, longitude: -34.880116, zoom: 15 }}
        showLayersPanel={false}
      />
    </div>
  );
}
