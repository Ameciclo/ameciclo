"use client";
import React, { useState } from "react";
import { filterById, filterByName, IntlNumber2Digit } from "~/services/utils";
import { ColumnFilter, SelectColumnFilter } from "../Ideciclo/TableFiltersIdeciclo";

const ExtensionCell = ({ value }: any) => {
    return <>{<span>{IntlNumber2Digit(value)}</span>}</>;
};

const Data = ({ citiesStats, inicialCity }: any) => {
     const citiesStatsArray = Object.values(citiesStats).filter(
        (c: any) => c.name !== undefined
    );

    const [selectedCity, setCity] = useState(
        filterByName(citiesStatsArray, inicialCity)
    );
    const changeCity = (id: any) => {
        setCity(filterById(citiesStatsArray, id));
    };

    const [optionsType, setOptionsType] = useState("max1digit");

    const [city_sort, sortCity] = useState("total");
    const sort_cities = [
        {
            title: "Ordene as cidades: ",
            value: city_sort,
            name: "city-sort",
            onChange: (e: any) => sortCityAndType(e.target.value),
            onBlur: (e: any) => e,
            items: [
                { value: "percent", label: "cobertos do plano cicloviário" },
                { value: "pdc_feito", label: "implantados no plano cicloviário" },
                { value: "pdc_total", label: "projetada no plano cicloviário" },
                { value: "total", label: "estrutura cicloviárias" },
            ],
        },
    ];

    const sortCityAndType = (value: any) => {
        sortCity(value);
        let type = "max1digit";
        if (value == "percent") type = "percentual";
        setOptionsType(type);
    };

    const cellFilterByValue = {
        Cell: ({ value }: any) => {
            return value ? (
                <span>{("" + value.toFixed(2)).replace(".", ",")}</span>
            ) : (
                <span>{"N/A"}</span>
            );
        },
    };

    const columns = React.useMemo(
        () => [
            {
                Header: "(COD) Nome da Via",
                accessor: "cod_name",
                Filter: ColumnFilter,
            },
            {
                Header: "Tipologia prevista",
                accessor: "pdc_typology",
                Filter: SelectColumnFilter,
            },
            {
                Header: "Extensão prevista (km)",
                accessor: "length",
                Cell: ({ value }: any) => <ExtensionCell value={value} />,
                Filter: false,
            },
            {
                Header: "Tipologia executada",
                accessor: "typologies_str",
                Filter: ColumnFilter,
            },
            {
                Header: "Extensão executada (km)",
                accessor: "has_cycleway_length",
                Cell: ({ value }) => <ExtensionCell value={value} />,
                Filter: false,
            },
        ],
        []
    );

    function sortCards(data: any, order: any) {
        const units: any = {
            percentil: "%",
            pdc_feito: "km",
            pdc_total: "km",
            total: "km",
        };
        return data
            .map((d: any) => ({
                id: d.id,
                label: d.name,
                unit: units[order],
                value: d[order],
            }))
            .sort((a: any, b: any) => (b.value >= a.value ? 1 : -1));
    }

    return (
        <>
            <NumberCards
                cards={sortCards(citiesStatsArray, city_sort)}
                data={{
                    title: "Estrutura nas cidades",
                    filters: sort_cities,
                }}
                options={{
                    changeFunction: changeCity,
                    type: optionsType,
                }}
                selected={selectedCity?.id}
            />
            <StatisticsBox
                title={selectedCity.name}
                subtitle={"Estatísticas Gerais"}
                boxes={cityCycleStructureExecutionStatistics(selectedCity)}
            />
            <Table
                title={"Estruturas do PDC para " + selectedCity.name}
                data={selectedCity.relations}
                columns={columns}
            />
        </>
    );
};

export default Data;
