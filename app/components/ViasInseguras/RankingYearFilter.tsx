interface RankingYearFilterProps {
  years: string[];
  startYear: string;
  endYear: string;
  onChange: (startYear: string, endYear: string) => void;
}

export default function RankingYearFilter({
  years,
  startYear,
  endYear,
  onChange,
}: RankingYearFilterProps) {
  if (years.length === 0) return null;

  const inRange = (year: string) => {
    if (!startYear) return false;
    return endYear
      ? year >= startYear && year <= endYear
      : year === startYear;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-gray-600">Ano:</span>
      {years.map((year) => (
        <button
          key={year}
          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
            inRange(year)
              ? "bg-[#008888] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          onClick={() => {
            if (!startYear) {
              onChange(year, year);
            } else if (startYear !== endYear) {
              onChange(year, year);
            } else if (year === startYear) {
              // keep
            } else if (year < startYear) {
              onChange(year, startYear);
            } else {
              onChange(startYear, year);
            }
          }}
        >
          {year}
        </button>
      ))}
    </div>
  );
}
