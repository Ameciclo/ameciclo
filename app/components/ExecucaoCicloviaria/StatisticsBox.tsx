import { Link } from "@remix-run/react";

export const StatisticsBox = ({ title, boxes, subtitle = "" }: any) => {
  const hasData = boxes && boxes.length > 0;
  
  if (!hasData) return null;
  
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

function NumberBox({ title, value, unit = undefined, color }: any) {
  const isLoading = value === "-" || value === "Carregando...";
  
  return (
    <div className="flex flex-col justify-between w-full p-6 text-center uppercase tracking-widest h-full">
      <h3 className={isLoading ? "text-gray-400" : ""}>{title}</h3>
      <div>
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-24 bg-gray-200 animate-pulse rounded"></div>
            {unit && <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>}
          </div>
        ) : (
          <>
            <h3 className={`text-4xl sm:text-5xl font-bold ${color || ''}`}>{value}</h3>
            {unit && <p className={color || ''}>{unit}</p>}
          </>
        )}
      </div>
    </div>
  );
}

function LinksBox({ title, value }: any) {
  return (
    <div className="flex flex-col justify-center w-full p-6 text-center uppercase tracking-widest">
      <h3>{title}</h3>
      {value.map((v: any, index: number) => (
        <Link
          key={`link-${index}`}
          to={v.url}
          className="border border-teal-500 bg-ameciclo text-white hover:bg-red-500 hover:border-red-300 rounded px-4 py-2 mt-2"
        >
          {v.label}
        </Link>
      ))}
    </div>
  );
}
