import { AmecicloMap } from "~/components/Commom/Maps/AmecicloMap";

interface MapViewProps {
  selectedInfra: string[];
  selectedPdc: string[];
  selectedContagem: string[];
  infraOptions: Array<{ name: string; color: string; pattern: string }>;
  pdcOptions: Array<{ name: string; color: string; pattern: string }>;
  layersConf: any[];
  infraData: any;
  pdcData: any;
  contagemData: any;
  getContagemIcon: (count: number) => React.ReactNode;
}

export function MapView({
  selectedInfra,
  selectedPdc,
  selectedContagem,
  layersConf,
  infraData,
  pdcData,
  contagemData,
  getContagemIcon
}: MapViewProps) {
  return (
    <div style={{height: 'calc(100vh - 64px)'}}>
      <AmecicloMap 
        key={`${selectedInfra.join(',')}-${selectedPdc.join(',')}-${selectedContagem.join(',')}`}
        layerData={(() => {
          const allFeatures = [
            ...(infraData?.features || []),
            ...(pdcData?.features || [])
          ];
          return allFeatures.length > 0 ? {
            type: "FeatureCollection",
            features: allFeatures
          } : null;
        })()}
        layersConf={layersConf || []}
        pointsData={contagemData ? contagemData.features.map((feature: any) => ({
          key: `contagem-${feature.properties.type}`,
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
          type: feature.properties.type,
          popup: {
            name: feature.properties.location,
            total: feature.properties.count,
            date: "Jan/2024"
          },
          customIcon: getContagemIcon(feature.properties.count)
        })) : []}
        showLayersPanel={false}
        width="100%" 
        height="100%" 
        defaultDragPan={true}
      />
    </div>
  );
}