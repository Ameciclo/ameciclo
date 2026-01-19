import { CardLoading } from "~/components/Dom/LoaDataLoading";

interface BudgetComparisonCardsProps {
  hasData: boolean;
  totalClimateBudgeted: number;
  totalClimateExecuted: number;
}

export function BudgetComparisonCards({ hasData, totalClimateBudgeted, totalClimateExecuted }: BudgetComparisonCardsProps) {
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

  const budgetedValue = formatValue(totalClimateBudgeted);
  const executedValue = formatValue(totalClimateExecuted);

  if (!hasData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <CardLoading />
        <CardLoading />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow-lg p-4 border-l-8 border-ameciclo">
        <div className="mb-2 inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          Valor Orçado 2025
        </div>
        <h3 className="text-3xl font-bold mb-1 flex items-baseline">
          <span>{budgetedValue.number}</span>
          <span className="text-xl ml-1">{budgetedValue.unit}</span>
        </h3>
        <p className="text-base mb-1">Dotação orçamentária aprovada para políticas ambientais em 2025</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4 border-l-8 border-gray-400">
        <div className="mb-2 inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
          Valor Executado 2025
        </div>
        <h3 className="text-3xl font-bold mb-1 flex items-baseline">
          <span>{executedValue.number}</span>
          <span className="text-xl ml-1">{executedValue.unit}</span>
        </h3>
        <p className="text-base mb-1">Recursos efetivamente pagos em programas climáticos em 2025</p>
      </div>
    </div>
  );
}
