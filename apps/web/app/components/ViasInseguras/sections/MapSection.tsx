import ViaIndividualMap from "../ViaIndividualMap";

interface MapSectionProps {
  viaName: string;
  totalSinistros: number;
  geoJsonData: any;
}

export function MapSection({ viaName, totalSinistros, geoJsonData }: MapSectionProps) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Localização da Via
      </h2>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <ViaIndividualMap 
          viaName={viaName} 
          totalSinistros={totalSinistros}
          mapData={geoJsonData}
        />
      </div>
    </section>
  );
}
