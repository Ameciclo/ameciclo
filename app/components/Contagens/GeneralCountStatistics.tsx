import { Link } from "@remix-run/react";

export const GeneralCountStatistics = ({ title, boxes, subtitle = "" }: any) => {
  return (
    <section className="mx-auto container">
      <div className="mx-auto text-center my-12 md:my-24">
        <h1 className="text-4xl sm:text-5xl font-bold">{title}</h1>
        {subtitle && (
          <h3 className="text-2xl md:text-3xl font-bold my-8">{subtitle}</h3>
        )}
        <div className="flex flex-col align-baseline md:flex-row bg-white shadow-lg rounded-lg mx-4 md:mx-auto my-8 max-w-4xl divide-y md:divide-x divide-gray-100">
          {boxes.map((box: any, index: number) =>
            box?.type == "LinksBox" ? (
              <LinksBox key={`links-box-${index}`} {...box} />
            ) : (
              <NumberBox key={`number-box-${index}`} {...box} />
            )
          )}
        </div>
      </div>
    </section>
  );
};

function NumberBox({ title, value, unit = undefined }: any) {
  const isLoading = value === "0" || value === 0 || !value;
  
  return (
    <div className="flex flex-col justify-center w-full p-6 text-center uppercase tracking-widest">
      <h3>{title}</h3>
      {isLoading ? (
        <div className="mt-2 space-y-2 animate-pulse">
          <div className="h-10 bg-gray-300 rounded w-3/4 mx-auto"></div>
        </div>
      ) : (
        <h3 className="text-3xl sm:text-5xl font-bold mt-2">{value}</h3>
      )}
      {unit && <p>{unit}</p>}
    </div>
  );
}

function LinksBox({ title, value }: any) {
  return (
    <div className="flex flex-col justify-center w-full p-6 text-center uppercase tracking-widest">
      <h3>{title}</h3>
      {value.map((v: any) => (
        <Link
          to={v.url}
          className="border border-teal-500 bg-ameciclo text-white hover:bg-red-500 hover:border-red-300 rounded px-4 py-2 mt-2"
        >
          {v.label}
        </Link>
      ))}
    </div>
  );
}
