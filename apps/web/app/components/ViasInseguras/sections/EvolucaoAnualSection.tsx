import ViaTemporalCharts from "../ViaTemporalCharts";

interface EvolucaoAnualSectionProps {
  evolucaoData: any[];
}

export function EvolucaoAnualSection({ evolucaoData }: EvolucaoAnualSectionProps) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Evolução Anual de Sinistros
      </h2>               
      <ViaTemporalCharts data={evolucaoData} />
    </section>
  );
}
