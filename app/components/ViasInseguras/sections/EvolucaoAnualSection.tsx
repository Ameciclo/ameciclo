import ViaTemporalCharts from "../ViaTemporalCharts";

interface EvolucaoAnualSectionProps {
  evolucaoData: any[];
}

export function EvolucaoAnualSection({ evolucaoData }: EvolucaoAnualSectionProps) {
  const ultimoDia = evolucaoData
    .map((year: any) => year.ultimo_dia)
    .filter(Boolean)
    .sort()
    .pop();

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
        Evolução Anual de Sinistros
      </h2>
      {ultimoDia && (
        <p className="text-center text-sm text-gray-500 mb-6">
          Último dado: {String(ultimoDia).slice(0, 7)}
        </p>
      )}
      <ViaTemporalCharts data={evolucaoData} />
    </section>
  );
}
