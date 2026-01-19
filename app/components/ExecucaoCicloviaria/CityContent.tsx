import React, { useState, useEffect, useRef, useMemo } from "react";
import { filterById, filterByName, IntlNumberMax1Digit, IntlPercentil } from "~/services/utils";
import { CyclingInfrastructureByCity } from "./CyclingInfrastructureByCity";
import { StatisticsBox } from "./StatisticsBox";
import Table from "../Commom/Table/Table";

interface CityContentProps {
  citiesStats: any;
  filterRef: React.RefObject<HTMLDivElement>;
  sort_cities: any[];
  city_sort: string;
  optionsType: string;
  sortCityAndType: (value: string) => void;
}

function sortCards(data: any[], order: string) {
  const units: Record<string, string> = {
    percentil: "%",
    pdc_feito: "km",
    pdc_total: "km",
    total: "km",
  };
  return data
    .map((d) => ({
      id: d.id,
      label: d.name,
      unit: units[order],
      value: d[order],
    }))
    .sort((a, b) => (b.value >= a.value ? 1 : -1));
}

export function CityContent({
  citiesStats,
  filterRef,
  sort_cities,
  city_sort,
  optionsType,
  sortCityAndType,
}: CityContentProps) {
  const citiesStatsArray = useMemo(
    () => Object.values(citiesStats ?? {}).filter((c: any) => c.name !== undefined),
    [citiesStats]
  );

  const [localSelectedCity, setLocalSelectedCity] = useState(() =>
    filterByName(citiesStatsArray, "Recife")
  );
  const [showFixedBar, setShowFixedBar] = useState(false);
  const [showFloatingFilter, setShowFloatingFilter] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current && filterRef.current && cardsRef.current) {
        const selectElement = filterRef.current.querySelector("select");
        const selectRect = selectElement?.getBoundingClientRect();

        const cardsGrid = cardsRef.current.querySelector(".grid");
        const cardsGridRect = cardsGrid?.getBoundingClientRect();

        const statsSection = sectionRef.current.querySelector("[data-stats-section]");
        const statsRect = statsSection?.getBoundingClientRect();

        const selectOutOfView = selectRect ? selectRect.bottom < 0 : false;
        const cardsStillVisible = cardsGridRect ? cardsGridRect.bottom > 56 : false;
        const showFloating = selectOutOfView && cardsStillVisible;
        setShowFloatingFilter(showFloating);

        const documentsSection = document.querySelector("[data-documents-section]");
        const documentsRect = documentsSection?.getBoundingClientRect();
        const documentsVisible = documentsRect ? documentsRect.top <= 56 : false;

        const showFixed = statsRect ? statsRect.top <= 56 && !documentsVisible : false;
        setShowFixedBar(showFixed);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [city_sort, filterRef]);

  const sortedCards = useMemo(() => {
    if (citiesStatsArray.length === 0) return [];
    return sortCards(citiesStatsArray, city_sort);
  }, [citiesStatsArray, city_sort]);

  const cityCycleStats = useMemo(() => {
    if (!localSelectedCity) return [];
    const { pdc_feito, pdc_total, percent, total } = localSelectedCity;

    const getPercentageColor = (value: number) => {
      if (value >= 98) return "text-green-600";
      if (value >= 90) return "text-blue-600";
      if (value >= 80) return "text-yellow-600";
      if (value >= 60) return "text-orange-600";
      if (value >= 35) return "text-red-600";
      return "text-red-800";
    };

    return [
      {
        title: "estruturas cicloviárias",
        unit: "km",
        value: IntlNumberMax1Digit(total),
      },
      {
        title: "projetadas no plano cicloviário",
        unit: "km",
        value: IntlNumberMax1Digit(pdc_total),
      },
      {
        title: "implantados no plano cicloviário",
        unit: "km",
        value: IntlNumberMax1Digit(pdc_feito),
      },
      {
        title: "cobertos do plano cicloviário",
        value: IntlPercentil(percent),
        unit: "%",
        color: getPercentageColor(percent),
      },
    ].filter((e) => e);
  }, [localSelectedCity]);

  const handleChangeCity = (id: number) => {
    setLocalSelectedCity(filterById(citiesStatsArray, id));
  };

  return (
    <div ref={sectionRef}>
      <div ref={filterRef}>
        <div ref={cardsRef}>
          <CyclingInfrastructureByCity
            cards={sortedCards}
            data={{
              title: "Estrutura nas cidades",
              filters: sort_cities,
            }}
            options={{
              changeFunction: handleChangeCity,
              type: optionsType,
            }}
            selected={localSelectedCity?.id}
          />
        </div>
      </div>

      {showFloatingFilter && (
        <div className="md:hidden fixed top-16 left-1/2 transform -translate-x-1/2 bg-white border-2 border-gray-200 py-3 px-4 rounded-lg shadow-lg z-[9999] max-w-[90vw]">
          <div className="flex items-center gap-3 text-sm">
            <span className="font-semibold text-gray-700 whitespace-nowrap">Dados:</span>
            <select
              value={city_sort}
              onChange={(e) => sortCityAndType(e.target.value)}
              className="text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent max-w-[200px]"
              tabIndex={-1}
            >
              {sort_cities[0].items.map((item: any) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {showFixedBar && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-white border-2 border-gray-200 py-3 px-6 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Cidade:</span>
            <select
              value={localSelectedCity?.id || ""}
              onChange={(e) => handleChangeCity(parseInt(e.target.value))}
              className="text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
              tabIndex={-1}
            >
              {citiesStatsArray.map((city: any) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div data-stats-section>
        <StatisticsBox
          title={localSelectedCity?.name || ""}
          subtitle={"Estatísticas Gerais"}
          boxes={cityCycleStats}
        />
      </div>

      {localSelectedCity?.relations && localSelectedCity.relations.length > 0 && (
        <div data-table-section className="container mx-auto my-12">
          <Table
            title={`Estruturas do PDC para ${localSelectedCity?.name || ""}`}
            data={localSelectedCity.relations}
            columns={[
              { Header: "Nome", accessor: "name" },
              { Header: "Tipologia Prevista", accessor: "pdc_typology" },
              { Header: "Tipologia Executada", accessor: "typologies_str" },
              { Header: "Extensão Prevista (km)", accessor: "length" },
              { Header: "Extensão Executada (km)", accessor: "has_cycleway_length" },
            ]}
            showFilters={true}
          />
        </div>
      )}
    </div>
  );
}
