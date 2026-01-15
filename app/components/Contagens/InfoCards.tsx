export const InfoCards = ({ cards }: any) => {
  if (!cards) {
    return (
      <section className="container mx-auto grid grid-cols-2 max-[320px]:grid-cols-1 lg:grid-cols-3 auto-rows-auto gap-10 my-10">
        {[...Array(9)].map((_, index) => (
          <div key={index} className="text-center sm:text-left text-base bg-white text-gray-800 min-h-32 rounded shadow-2xl p-3 uppercase tracking-widest flex justify-between flex-col sm:flex-row animate-pulse">
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
              <div className="h-10 bg-gray-300 rounded w-1/2"></div>
            </div>
            <div className="h-20 w-20 bg-gray-300 rounded"></div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="container mx-auto grid grid-cols-2 max-[320px]:grid-cols-1 lg:grid-cols-3 auto-rows-auto gap-10 my-10">
      {cards.map((card: any, index: any) => (
        <InfoCard key={index} {...card} />
      ))}
    </section>
  );
};

const InfoCard = ({ label, data, icon }: any) => {
  return (
    <div
      key={label}
      className="text-center sm:text-left text-base bg-white text-gray-800 min-h-32 rounded shadow-2xl p-3 uppercase tracking-widest flex justify-between flex-col sm:flex-row"
    >
      <div>
        <h3>{label}</h3>
        <h3 className="text-4xl sm:text-5xl font-bold">{data}</h3>
      </div>
      <img src={`/icons/contagens/${icon}.svg`} className="h-20 fill-current" alt={label} />
    </div>
  );
};
