import { CardLoading } from "~/components/Dom/LoaDataLoading";

interface InvestmentCardsProps {
  hasData: boolean;
  totalClimateBudgeted: number;
  totalStateBudget: number;
}

export function InvestmentCards({ hasData, totalClimateBudgeted, totalStateBudget }: InvestmentCardsProps) {
  const formatValue = (value: number) => {
    if (value >= 1000000000) {
      return {
        number: (value / 1000000000).toFixed(1).replace('.0', ''),
        unit: 'Bi'
      };
    }
    if (value >= 1000000) {
      return {
        number: (value / 1000000).toFixed(1).replace('.0', ''),
        unit: 'Mi'
      };
    }
    return {
      number: value.toFixed(0),
      unit: ''
    };
  };

  const climateValue = formatValue(totalClimateBudgeted);
  const stateValue = formatValue(totalStateBudget);

  if (!hasData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <CardLoading />
        <CardLoading />
        <CardLoading />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow-lg p-4 border-l-8 border-green-600" aria-label="Investimento em ações climáticas">
        <div className="mb-2 inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          Ações climáticas
        </div>
        <h3 className="text-3xl font-bold mb-1 flex items-baseline">
          <span>{climateValue.number}</span>
          <span className="text-xl ml-1">{climateValue.unit}</span>
        </h3>
        <p className="text-base mb-1">Recursos destinados a programas de sustentabilidade e meio ambiente</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4 border-l-8 border-red-600" aria-label="Orçamento total do estado">
        <div className="mb-2 inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
          Orçamento total
        </div>
        <h3 className="text-3xl font-bold mb-1 flex items-baseline">
          <span>{stateValue.number}</span>
          <span className="text-xl ml-1">{stateValue.unit}</span>
        </h3>
        <p className="text-base mb-1">Soma de todos os recursos públicos estaduais</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4 border-l-8 border-blue-600" aria-label="Custo por tonelada de CO2 equivalente">
        <div className="mb-2 inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          Emissão de carbono
        </div>
        <h3 className="text-3xl font-bold mb-1">R$ 1400 Mil / CO2e</h3>
        <p className="text-base mb-1">Valor investido para cada tonelada de CO2 reduzida</p>
        <p className="text-xs text-gray-500 mt-2">
          Fonte: <a href="https://semas.pe.gov.br/grafico-inventario-gee/" className="text-ameciclo hover:underline">semas.pe.gov.br</a>
        </p>
      </div>
    </div>
  );
}
