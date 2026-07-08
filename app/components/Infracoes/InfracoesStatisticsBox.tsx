import { Link } from "@tanstack/react-router";
import { IntlNumber } from "~/services/utils";

interface BoxItem {
  title: string;
  value: number | string;
  suffix?: string;
  unit?: string;
  color?: string;
  type?: "LinksBox";
}

export function InfracoesStatisticsBox({ title, boxes, subtitle = "" }: {
  title: string;
  boxes: BoxItem[];
  subtitle?: string;
}) {
  if (!boxes || boxes.length === 0) return null;

  return (
    <section className="mx-auto container">
      <div className="mx-auto text-center my-12 md:my-24">
        <h1 className="text-4xl sm:text-5xl font-bold">{title}</h1>
        {subtitle && (
          <h3 className="text-2xl md:text-3xl font-bold my-8">{subtitle}</h3>
        )}
        <div className="flex flex-col align-baseline md:flex-row bg-white shadow-lg rounded-lg mx-4 md:mx-auto my-8 max-w-4xl divide-y md:divide-x divide-gray-100">
          {boxes.map((box, index) =>
            box.type === "LinksBox" ? (
              <LinksBox key={`links-box-${index}`} {...box} />
            ) : (
              <NumberBox key={`number-box-${index}`} {...box} />
            )
          )}
        </div>
      </div>
    </section>
  );
}

function NumberBox({ title, value, unit, suffix, color }: BoxItem) {
  const isStringValue = typeof value === "string";
  const isLoading = isStringValue && (value === "-" || value === "---");

  const displayValue = isStringValue ? value : IntlNumber(value);

  return (
    <div className="flex flex-col justify-between w-full p-6 text-center uppercase tracking-widest h-full">
      <h3 className={isLoading ? "text-gray-400" : ""}>{title}</h3>
      <div>
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-24 bg-gray-200 animate-pulse rounded-sm"></div>
            {unit && <div className="h-4 w-32 bg-gray-200 animate-pulse rounded-sm"></div>}
          </div>
        ) : (
          <>
            <h3 className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${color || ""}`}>
              {displayValue}
              {suffix ? <span className="text-sm sm:text-base font-semibold align-baseline">&nbsp;{suffix}</span> : null}
            </h3>
            {unit && <p className={`normal-case whitespace-nowrap ${color || ""}`}>{unit}</p>}
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
          className="border border-teal-500 bg-ameciclo text-white hover:bg-red-500 hover:border-red-300 rounded-sm px-4 py-2 mt-2"
        >
          {v.label}
        </Link>
      ))}
    </div>
  );
}
