import { useState } from "react";

interface CityOption {
  id: string;
  label: string;
}

interface SamuFilterBarProps {
  selectedCity: string;
  selectedCityName: string;
  selectedYear: number | null;
  selectedEndYear: number | null;
  availableYears: number[];
  citiesList: CityOption[];
  onCityChange: (cityId: string) => void;
  onStartYearChange: (year: number) => void;
  onEndYearChange: (year: number | null) => void;
}

export function SamuFilterBar({
  selectedCity,
  selectedCityName,
  selectedYear,
  selectedEndYear,
  availableYears,
  citiesList,
  onCityChange,
  onStartYearChange,
  onEndYearChange,
}: SamuFilterBarProps) {
  const [isOpen, setIsOpen] = useState<string | null>(null);

  const toggleFilter = (filterName: string) => {
    setIsOpen(isOpen === filterName ? null : filterName);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-ameciclo shadow-lg border-t border-gray-200 z-50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">

          <div className="relative grow shrink-0 basis-full sm:basis-auto sm:min-w-48">
            <button
              onClick={() => toggleFilter("city")}
              className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium"
              aria-label="Filtro de cidade"
              aria-expanded={isOpen === "city"}
            >
              <span className="text-gray-500 mr-2">Cidade:</span>
              <span className="truncate">{selectedCityName}</span>
              <svg className="w-4 h-4 ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOpen === "city" && (
              <div className="absolute bottom-full left-0 mb-2 w-full max-h-60 overflow-y-auto bg-white shadow-lg rounded-lg border border-gray-200 p-2" role="menu" aria-label="Seleção de cidade">
                {citiesList.map((city) => (
                  <button
                    key={city.id}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${city.id === selectedCity ? "bg-ameciclo text-white" : "hover:bg-gray-100"}`}
                    onClick={() => {
                      onCityChange(city.id);
                      setIsOpen(null);
                    }}
                  >
                    {city.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative grow shrink-0 basis-full sm:basis-auto sm:min-w-36">
            <button
              onClick={() => toggleFilter("startYear")}
              className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium"
              aria-label="Ano início"
              aria-expanded={isOpen === "startYear"}
            >
              <span className="text-gray-500 mr-2">Ano início:</span>
              <span>{selectedYear ?? "Nenhum"}</span>
              <svg className="w-4 h-4 ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOpen === "startYear" && (
              <div className="absolute bottom-full left-0 mb-2 w-full max-h-48 overflow-y-auto bg-white shadow-lg rounded-lg border border-gray-200 p-2" role="menu" aria-label="Seleção de ano início">
                <div className="grid grid-cols-3 gap-1">
                  {availableYears.map((year) => (
                    <button
                      key={year}
                      className={`px-2 py-1 text-sm rounded-lg ${
                        year === selectedYear && !selectedEndYear
                          ? "bg-ameciclo text-white"
                          : year === selectedYear
                            ? "bg-ameciclo/20 text-ameciclo font-semibold"
                            : "hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        onStartYearChange(year);
                        setIsOpen(null);
                      }}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative grow shrink-0 basis-full sm:basis-auto sm:min-w-36">
            <button
              onClick={() => toggleFilter("endYear")}
              className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium"
              aria-label="Ano fim"
              aria-expanded={isOpen === "endYear"}
            >
              <span className="text-gray-500 mr-2">Ano fim:</span>
              <span>{selectedEndYear ?? "Nenhum"}</span>
              <svg className="w-4 h-4 ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isOpen === "endYear" && (
              <div className="absolute bottom-full left-0 mb-2 w-full max-h-48 overflow-y-auto bg-white shadow-lg rounded-lg border border-gray-200 p-2" role="menu" aria-label="Seleção de ano fim">
                <div className="grid grid-cols-3 gap-1">
                  <button
                    className={`px-2 py-1 text-sm rounded-lg ${!selectedEndYear ? "bg-ameciclo text-white" : "hover:bg-gray-100"}`}
                    onClick={() => {
                      onEndYearChange(null);
                      setIsOpen(null);
                    }}
                  >
                    Nenhum
                  </button>
                  {availableYears.map((year) => (
                    <button
                      key={year}
                      className={`px-2 py-1 text-sm rounded-lg ${
                        year === selectedEndYear
                          ? "bg-ameciclo text-white"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        onEndYearChange(year);
                        setIsOpen(null);
                      }}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
