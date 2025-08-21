interface ConcentrationInfoCardsProps {
  data: Array<{
    top: number;
    km_acum: number;
    percentual_acum: number;
  }>;
}

export default function ConcentrationInfoCards({ data }: ConcentrationInfoCardsProps) {
  if (!data || data.length === 0) {
    return null;
  }

  // Função para encontrar concentração por ranking
  const getConcentrationByRanking = (ranking: number) => {
    const item = data.find(d => d.top === ranking);
    return item ? item.percentual_acum : 0;
  };

  // Função para encontrar concentração por km
  const getConcentrationByKm = (targetKm: number) => {
    const item = data.find(d => d.km_acum >= targetKm);
    return item ? item.percentual_acum : 0;
  };

  const rankingCards = [
    { title: "Top 10 Vias", value: getConcentrationByRanking(10), subtitle: "dos sinistros com vítima" },
    { title: "Top 50 Vias", value: getConcentrationByRanking(50), subtitle: "dos sinistros com vítima" },
    { title: "Top 100 Vias", value: getConcentrationByRanking(100), subtitle: "dos sinistros com vítima" }
  ];

  const kmCards = [
    { title: "Primeiros 125 km", value: getConcentrationByKm(125), subtitle: "dos sinistros com vítima" },
    { title: "Primeiros 250 km", value: getConcentrationByKm(250), subtitle: "dos sinistros com vítima" },
    { title: "Primeiros 500 km", value: getConcentrationByKm(500), subtitle: "dos sinistros com vítima" }
  ];

  return (
    <section className="container mx-auto my-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Indicadores de Concentração
        </h2>
        <p className="text-gray-600 max-w-4xl mx-auto">
          Percentual de sinistros concentrados por ranking das vias e por extensão analisada
        </p>
      </div>

      {/* Cards por Ranking */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">
          Concentração por Ranking de Vias
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rankingCards.map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center border-l-4 border-teal-500">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">{card.title}</h4>
              <div className="text-3xl font-bold text-teal-600 mb-2">
                {card.value.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">{card.subtitle}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cards por Quilometragem */}
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">
          Concentração por Extensão de Vias
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kmCards.map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center border-l-4 border-red-500">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">{card.title}</h4>
              <div className="text-3xl font-bold text-red-600 mb-2">
                {card.value.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">{card.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}